import { NextRequest } from "next/server";

/**
 * 公告生成：服务端获取访客 IP 归属地后拼文案。
 * - 不再使用前端 JSONP + 公开 key（每秒限流，访客一多就失败）
 * - 按 IP 缓存 30 分钟，极大减少第三方调用
 * - 腾讯接口失败时回退到 keyless 的 ipapi.co，再失败则用默认文案
 */

const TENCENT_KEY = "T3EBZ-TJ7LI-YRBG2-5ZLUR-KD3OS-U6BJO";
const HOME = { lng: 107.38779, lat: 29.70239 };
const CACHE_TTL = 30 * 60 * 1000;
const MAX_CACHE = 500;

type Geo = {
  nation: string;
  province: string;
  city: string;
  lng?: number;
  lat?: number;
};
type Entry = { text: string; at: number };

const cache = new Map<string, Entry>();

function cached(ip: string): string | null {
  const hit = cache.get(ip);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.text;
  if (hit) cache.delete(ip);
  return null;
}

function remember(ip: string, text: string) {
  if (cache.size >= MAX_CACHE) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(ip, { text, at: Date.now() });
}

function distanceKm(
  aLng: number,
  aLat: number,
  bLng: number,
  bLat: number,
): number {
  const R = 6371;
  const { sin, cos, asin, PI, hypot } = Math;
  const point = (lng: number, lat: number) => {
    const e = (lng * PI) / 180;
    const n = (lat * PI) / 180;
    return { x: cos(n) * cos(e), y: cos(n) * sin(e), z: sin(n) };
  };
  const a = point(aLng, aLat);
  const b = point(bLng, bLat);
  const c = hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  return Math.round(asin(c / 2) * 2 * R);
}

async function lookupTencent(ip?: string): Promise<Geo | null> {
  try {
    const url = new URL("https://apis.map.qq.com/ws/location/v1/ip");
    url.searchParams.set("key", TENCENT_KEY);
    if (ip) url.searchParams.set("ip", ip);
    const res = await fetch(url.toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 0 || !json.result?.ad_info) return null;
    const ad = json.result.ad_info;
    return {
      nation: ad.nation ?? "",
      province: ad.province ?? "",
      city: ad.city ?? "",
      lng: json.result.location?.lng,
      lat: json.result.location?.lat,
    };
  } catch {
    return null;
  }
}

async function lookupFallback(ip?: string): Promise<Geo | null> {
  if (!ip) return null;
  try {
    const res = await fetch(`https://api.ip.sb/geoip/${ip}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.country) return null;
    return {
      nation: json.country === "China" ? "中国" : json.country,
      province: json.region ?? "",
      city: json.city ?? "",
      lng: json.longitude,
      lat: json.latitude,
    };
  } catch {
    return null;
  }
}

const COUNTRY_CN: Record<string, string> = {
  China: "中国",
  Japan: "日本",
  "United States": "美国",
  "United Kingdom": "英国",
  Russia: "俄罗斯",
  France: "法国",
  Germany: "德国",
  Australia: "澳大利亚",
  Canada: "加拿大",
  Singapore: "新加坡",
  "South Korea": "韩国",
  Taiwan: "台湾省",
  "Hong Kong": "香港特别行政区",
  Macao: "澳门特别行政区",
  "New Zealand": "新西兰",
  Malaysia: "马来西亚",
  Thailand: "泰国",
  India: "印度",
  Brazil: "巴西",
};

const REGION_CN: Record<string, string> = {
  Beijing: "北京市",
  Tianjin: "天津市",
  Chongqing: "重庆市",
  Hebei: "河北省",
  Henan: "河南省",
  Shanxi: "山西省",
  "Inner Mongolia": "内蒙古自治区",
  Liaoning: "辽宁省",
  Jilin: "吉林省",
  Heilongjiang: "黑龙江省",
  Shanghai: "上海市",
  Jiangsu: "江苏省",
  Zhejiang: "浙江省",
  Anhui: "安徽省",
  Fujian: "福建省",
  Jiangxi: "江西省",
  Shandong: "山东省",
  Hubei: "湖北省",
  Hunan: "湖南省",
  Guangdong: "广东省",
  Guangxi: "广西壮族自治区",
  Hainan: "海南省",
  Sichuan: "四川省",
  Guizhou: "贵州省",
  Yunnan: "云南省",
  Tibet: "西藏自治区",
  Shaanxi: "陕西省",
  Gansu: "甘肃省",
  Qinghai: "青海省",
  Ningxia: "宁夏回族自治区",
  Xinjiang: "新疆维吾尔自治区",
};

function cnify(geo: Geo): Geo {
  const nation = COUNTRY_CN[geo.nation] ?? geo.nation;
  const province = REGION_CN[geo.province] ?? geo.province;
  // 回退源的城市名多为英文，英文时不参与展示，避免“浙江省 Hangzhou”
  const city = /[\u4e00-\u9fa5]/.test(geo.city) ? geo.city : "";
  return { ...geo, nation, province, city };
}

function posDesc(geo: Geo): string {
  if (geo.nation !== "中国") {
    switch (geo.nation) {
      case "日本":
        return "よろしく，一起去看樱花吗";
      case "美国":
        return "Make America Great Again!";
      case "英国":
        return "想同你一起夜乘伦敦眼";
      case "俄罗斯":
        return "达瓦里氏，干了这瓶伏特加！";
      case "法国":
        return "C'est La Vie";
      case "德国":
        return "Die Zeit verging im Fluge.";
      case "澳大利亚":
        return "一起去大堡礁吧！";
      case "加拿大":
        return "拾起一片枫叶赠予你";
      default:
        return "带我去你的国家逛逛吧。";
    }
  }
  const province = geo.province;
  const city = geo.city;
  const known = new Set([
    "北京市",
    "天津市",
    "重庆市",
    "河北省",
    "河南省",
    "山西省",
    "内蒙古自治区",
    "辽宁省",
    "吉林省",
    "黑龙江省",
    "上海市",
    "江苏省",
    "浙江省",
    "安徽省",
    "福建省",
    "江西省",
    "山东省",
    "湖北省",
    "湖南省",
    "广东省",
    "广西壮族自治区",
    "海南省",
    "四川省",
    "贵州省",
    "云南省",
    "西藏自治区",
    "陕西省",
    "甘肃省",
    "青海省",
    "宁夏回族自治区",
    "新疆维吾尔自治区",
    "台湾省",
    "香港特别行政区",
    "澳门特别行政区",
  ]);
  if (!known.has(province)) return "";
  if (province === "江苏省" && city === "南京市")
    return "欢迎来自安徽省南京市的小伙伴。";
  if (province === "江苏省" && city === "苏州市")
    return "苏州梅友机场，苏州享耀机场。";
  if (province === "江苏省") return "散装是必须要散装的。";
  if (province === "四川省") {
    switch (city) {
      case "成都市":
        return "戳啦，成都省四川市啦！";
      case "泸州市":
        return "百年老窖，千年酒城。";
      case "绵阳市":
        return "不当万年川老二辣！";
      case "广安市":
        return "走开走开，我要跟重庆玩！";
      case "宜宾市":
        return "五粮液为您报时。";
      case "甘孜藏族自治州":
        return "到达世界最高城理塘！AUV这不顶针吗？";
      default:
        return "干爪子嘛仙人。";
    }
  }
  const table: Record<string, string> = {
    北京市: "来碗地地道道的豆汁不？",
    天津市: "开车禁止讲相声！",
    重庆市: "老师老师两路口走不走？",
    河北省: "生命可以重来，高考只有一次。",
    河南省: "中不中？中嘞！",
    山西省: "凋零骷髅煤炭来几个？",
    内蒙古自治区: "真的住蒙古包骑马上学吗？",
    辽宁省: "我就是，大连市长___，__律师__。",
    吉林省: "长白山上白雪飘，吉林雾凇美如画。",
    黑龙江省: "北国风光，千里冰封，万里雪飘。",
    上海市: "沪 爷 冲 击 ！",
    浙江省: "浙江温州、浙江温州，江南皮革厂倒闭了。",
    安徽省: "蚌埠住了，芜湖起飞。",
    福建省: "长征的心情如何煞去，爱靠着甚人挽回曾经。",
    江西省: "阿卡林省的小朋友你好。",
    山东省: "正步踢进台球厅，打个响袋给党听。",
    湖北省: "故人西辞黄鹤楼，烟花三月下扬州。",
    湖南省: "湘江北去，橘子洲头。",
    广东省: "老板来两斤胡建人。",
    广西壮族自治区: "桂林山水甲天下。",
    海南省: "朝观日出逐白浪，夕看云起收霞光。",
    贵州省: "茅台，学生，再塞200。",
    云南省: "红伞伞，白杆杆，吃完一起躺板板。",
    西藏自治区: "布达拉宫，拉萨河，雪山下的圣地。",
    陕西省: "我是秦始皇v我50封你当兵马俑。",
    甘肃省: "羌笛何须怨杨柳，春风不度玉门关。",
    青海省: "山舞银蛇，原驰蜡象，欲与天公试比高。",
    宁夏回族自治区: "大漠孤烟直，长河落日圆。",
    新疆维吾尔自治区: "驼铃古道丝绸路，胡马犹闻唐汉风。",
    台湾省: "拜托啦～你说话真的好机车的欸～",
    香港特别行政区: "今天只有残留的躯壳，迎接光辉岁月～",
    澳门特别行政区: "性感荷官，在线发牌。",
  };
  return table[province] ?? "";
}

function greet(hour: number): string {
  if (hour >= 5 && hour < 11) return "上午好，一日之计在于晨";
  if (hour >= 11 && hour < 13) return "中午好，该摸鱼吃午饭了";
  if (hour >= 13 && hour < 15) return "下午好，懒懒地睡个午觉吧！";
  if (hour >= 15 && hour < 16) return "三点几啦，饮茶先啦！";
  if (hour >= 16 && hour < 19) return "夕阳无限好！";
  if (hour >= 19 && hour < 24) return "晚上好，夜生活嗨起来！";
  return "夜深了，早点休息，少熬夜";
}

function compose(geo: Geo | null): string {
  const hour = parseInt(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    }).format(new Date()),
    10,
  );
  const timeChange = greet(Number.isFinite(hour) ? hour : 12).replace(
    /[。！!，,]+$/,
    "",
  );
  if (!geo) return `欢迎光临！${timeChange}。`;
  geo = cnify(geo);

  const where =
    geo.nation === "中国" && geo.province
      ? `${geo.province} ${geo.city}`.trim()
      : geo.nation || "远方";
  const dist =
    typeof geo.lng === "number" && typeof geo.lat === "number"
      ? distanceKm(HOME.lng, HOME.lat, geo.lng, geo.lat)
      : null;

  const desc = posDesc(geo);
  const tail = dist !== null ? `你距离 Ariasaka 约有 ${dist} 公里` : "";
  const clean = (v: string) => v.replace(/[。！!，,～~]+$/, "");
  const extra = [tail, desc].map(clean).filter(Boolean).join("，");
  return (
    `欢迎来自 ${where} 的小伙伴，${timeChange}` +
    // 地区文案可能以问号收尾，不要再追加句号。
    (extra ? `。${extra}${/[。！？!?]$/.test(extra) ? "" : "。"}` : "。")
  );
}

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip =
    forwarded.split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  const cacheKey = ip || "anon";

  const hit = cached(cacheKey);
  if (hit) {
    return Response.json(
      { text: hit },
      { headers: { "Cache-Control": "public, max-age=1800" } },
    );
  }

  const geo =
    (await lookupTencent(ip || undefined)) ??
    (await lookupFallback(ip || undefined));
  const text = compose(geo);
  remember(cacheKey, text);
  return Response.json(
    { text },
    { headers: { "Cache-Control": "public, max-age=1800" } },
  );
}
