import { cache } from "react";

const $ = require("jquery");
const genanno = cache(async () => {
  return await new Promise((resolve, reject) =>
    $.ajax({
      type: "get",
      url: "https://apis.map.qq.com/ws/location/v1/ip",
      data: {
        key: "T3EBZ-TJ7LI-YRBG2-5ZLUR-KD3OS-U6BJO",
        output: "jsonp",
      },
      dataType: "jsonp",
      success: function (res) {
        var ipLocation = res;
        function getDistance(e1, n1, e2, n2) {
          const R = 6371;
          const { sin, cos, asin, PI, hypot } = Math;
          let getPoint = (e, n) => {
            e *= PI / 180;
            n *= PI / 180;
            return { x: cos(n) * cos(e), y: cos(n) * sin(e), z: sin(n) };
          };
          let a = getPoint(e1, n1);
          let b = getPoint(e2, n2);
          let c = hypot(a.x - b.x, a.y - b.y, a.z - b.z);
          let r = asin(c / 2) * 2 * R;
          return Math.round(r);
        }
        let dist;
        try {
          dist = getDistance(
            107.38779,
            29.70239,
            ipLocation.result.location.lng,
            ipLocation.result.location.lat,
          );
        } catch (e) {
          return;
        }
        let pos = ipLocation.result.ad_info.nation;
        let posdesc;
        switch (ipLocation.result.ad_info.nation) {
          case "日本":
            posdesc = "よろしく，一起去看樱花吗";
            break;
          case "美国":
            posdesc = "Make America Great Again!";
            break;
          case "英国":
            posdesc = "想同你一起夜乘伦敦眼";
            break;
          case "俄罗斯":
            posdesc = "干了这瓶伏特加！";
            break;
          case "法国":
            posdesc = "C'est La Vie";
            break;
          case "德国":
            posdesc = "Die Zeit verging im Fluge.";
            break;
          case "澳大利亚":
            posdesc = "一起去大堡礁吧！";
            break;
          case "加拿大":
            posdesc = "拾起一片枫叶赠予你";
            break;
          case "中国":
            pos =
              ipLocation.result.ad_info.province +
              " " +
              ipLocation.result.ad_info.city;
            switch (ipLocation.result.ad_info.province) {
              case "北京市":
                posdesc = "北——京——欢迎你~~~";
                break;
              case "天津市":
                posdesc = "讲段相声吧。";
                break;
              case "重庆市":
                posdesc = "轻轨亲鬼，才不是亲鬼！";
                break;
              case "河北省":
                posdesc =
                  "山势巍巍成壁垒，天下雄关。铁马金戈由此向，无限江山。";
                break;
              case "山西省":
                posdesc = "展开坐具长三尺，已占山河五百余。";
                break;
              case "内蒙古自治区":
                posdesc = "天苍苍，野茫茫，风吹草低见牛羊。";
                break;
              case "辽宁省":
                posdesc = "我想吃烤鸡架！";
                break;
              case "吉林省":
                posdesc = "状元阁就是东北烧烤之王。";
                break;
              case "黑龙江省":
                posdesc = "很喜欢哈尔滨大剧院。";
                break;
              case "上海市":
                posdesc = "众所周知，中国只有两个城市。";
                break;
              case "江苏省":
                switch (ipLocation.result.ad_info.city) {
                  case "南京市":
                    posdesc = "欢迎来自安徽省南京市的小伙伴。";
                    break;
                  case "苏州市":
                    posdesc = "上有天堂，下有苏杭。";
                    break;
                  default:
                    posdesc = "散装是必须要散装的。";
                    break;
                }
                break;
              case "浙江省":
                posdesc = "东风渐绿西湖柳，雁已还人未南归。";
                break;
              case "安徽省":
                posdesc = "蚌埠住了，芜湖起飞。";
                break;
              case "福建省":
                posdesc = "井邑白云间，岩城远带山。";
                break;
              case "江西省":
                posdesc = "落霞与孤鹜齐飞，秋水共长天一色。";
                break;
              case "山东省":
                posdesc = "遥望齐州九点烟，一泓海水杯中泻。";
                break;
              case "湖北省":
                posdesc = "来碗热干面！";
                break;
              case "湖南省":
                posdesc = "74751，长沙斯塔克。";
                break;
              case "广东省":
                posdesc = "老板来两斤福建人。";
                break;
              case "广西壮族自治区":
                posdesc = "桂林山水甲天下。";
                break;
              case "海南省":
                posdesc = "朝观日出逐白浪，夕看云起收霞光。";
                break;
              case "四川省":
                posdesc = "康康川妹子。";
                break;
              case "贵州省":
                posdesc = "茅台，学生，再塞200。";
                break;
              case "云南省":
                posdesc = "玉龙飞舞云缠绕，万仞冰川直耸天。";
                break;
              case "西藏自治区":
                posdesc = "躺在茫茫草原上，仰望蓝天。";
                break;
              case "陕西省":
                posdesc = "来份臊子面加馍。";
                break;
              case "甘肃省":
                posdesc = "羌笛何须怨杨柳，春风不度玉门关。";
                break;
              case "青海省":
                posdesc = "牛肉干和老酸奶都好好吃。";
                break;
              case "宁夏回族自治区":
                posdesc = "大漠孤烟直，长河落日圆。";
                break;
              case "新疆维吾尔自治区":
                posdesc = "驼铃古道丝绸路，胡马犹闻唐汉风。";
                break;
              case "台湾省":
                posdesc = "我在这头，大陆在那头。";
                break;
              case "香港特别行政区":
                posdesc = "永定贼有残留地鬼嚎，迎击光非岁玉。";
                break;
              case "澳门特别行政区":
                posdesc = "性感荷官，在线发牌。";
                break;
              default:
                posdesc = "社会主义大法好。";
                break;
            }
            break;
          default:
            posdesc = "带我去你的国家逛逛吧。";
            break;
        }
        let timeChange;
        let date = new Date();
        if (date.getHours() >= 5 && date.getHours() < 11)
          timeChange = (
            <>
              <span>上午好</span>，一日之计在于晨
            </>
          );
        else if (date.getHours() >= 1 && date.getHours() < 13)
          timeChange = (
            <>
              <span>中午好</span>，该摸鱼吃午饭了
            </>
          );
        else if (date.getHours() >= 13 && date.getHours() < 15)
          timeChange = (
            <>
              <span>下午好</span>，懒懒地睡个午觉吧！
            </>
          );
        else if (date.getHours() >= 15 && date.getHours() < 16)
          timeChange = (
            <>
              <span>三点几啦</span>，饮茶先啦！
            </>
          );
        else if (date.getHours() >= 16 && date.getHours() < 19)
          timeChange = (
            <>
              <span>夕阳无限好！</span>
            </>
          );
        else if (date.getHours() >= 19 && date.getHours() < 24)
          timeChange = (
            <>
              <span>晚上好</span>，夜生活嗨起来！
            </>
          );
        else timeChange = "夜深了，早点休息，少熬夜";
        resolve(
          <>
            Next.js新博客！
            <br />
            欢迎来自<span>{pos}</span>的小伙伴，{timeChange}
            <br />
            你距离Ariasaka约有<span>{dist}</span>公里，{posdesc}
            <br />
            本网站的Twikoo评论系统使用
            <a className="normal-a" href="https://weavatar.com">
              WeAvatar
            </a>
            头像系统，请自行绑定邮箱配置
          </>,
        );
      },
      error: () => resolve("欢迎来到Ariaの新博客喵，基于Next.js和React构建。"),
    }),
  );
});
async function agn() {
  let annoText = genanno();
  return annoText;
}
export const annogen = cache(agn);
