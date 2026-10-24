/**
 * 友链头像主题色。
 * 提取在服务端完成（GET /get/flink/themeColor，分桶算法与权重和原来逐行
 * 一致，见后端 get/flink/main.py）：原先是纯前端 canvas 读像素，要求图床
 * 返回 CORS 头，QQ 头像（qlogo.cn）等国内常用源不带，浏览器里必然加载失败。
 * ensureCardColor 的对比度调节仍留在前端，逻辑不变。
 */
import { siteConfigs } from "@/config";

interface Hsl {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  else if (max === gn) h = ((bn - rn) / d + 2) * 60;
  else h = ((rn - gn) / d + 4) * 60;
  return { h, s, l };
}

function hslToRgb({ h, s, l }: Hsl): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb: [number, number, number];
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const m = l - c / 2;
  return rgb.map((v) => Math.round((v + m) * 255)) as [number, number, number];
}

export function toHex([r, g, b]: [number, number, number]): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * 提取主题色。
 * 链接非法返回 ""；图片下载/解析失败时抛错，message 是可直接展示的中文。
 * 返回空字符串只剩一种情况：图片所有像素都透明（极端情况，与原版行为一致）。
 */
export async function extractThemeColorFromImage(url: string): Promise<string> {
  const trimmed = (url || "").trim();
  if (!/^https?:\/\//i.test(trimmed)) return "";
  let res: Response;
  try {
    res = await fetch(
      `${siteConfigs.backEndUrl}/get/flink/themeColor?url=${encodeURIComponent(trimmed)}`,
    );
  } catch {
    // 网络层失败（断网/后端不可达）：浏览器给的是英文 TypeError，别透传
    throw new Error("取色服务暂时不可用，请稍后再试");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // 后端 detail.error 是面向用户的中文（域名解析不了/不是图片/超时等）；
    // 其余情况（网关 404、平台错误页）统一走兜底文案，不外泄内部信息
    const detail = data?.detail;
    const msg = typeof detail === "object" && detail !== null ? detail.error : "";
    throw new Error(msg || "取色服务暂时不可用，请稍后再试");
  }
  return typeof data?.data === "string" ? data.data : "";
}

/* ---------- 卡片底色可读性 ---------- */

function parseHexColor(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** 与白色文字的对比度（1~21） */
export function contrastWithWhite(hex: string): number {
  const rgb = parseHexColor(hex);
  if (!rgb) return 21;
  return 1.05 / (relativeLuminance(rgb) + 0.05);
}

/**
 * 友链卡片用该颜色作背景 + 白色文字。
 * 颜色太浅、和白字拉不开对比时自动压深，直到达到 minContrast（默认 3:1）。
 * 非 #hex 写法（颜色名、rgb() 等）原样返回。
 */
export function ensureCardColor(hex: string, minContrast = 3): string {
  const rgb = parseHexColor(hex);
  if (!rgb) return hex;
  if (contrastWithWhite(hex) >= minContrast) return hex;

  const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  let l = hsl.l;
  for (let i = 0; i < 50; i++) {
    l -= 0.02;
    if (l <= 0.04) break;
    const candidate = hslToRgb({ ...hsl, l });
    if (contrastWithWhite(toHex(candidate)) >= minContrast)
      return toHex(candidate);
  }
  // 极端情况（比如纯白）：给一个深灰
  return "#3a3a3a";
}
