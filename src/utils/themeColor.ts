/**
 * 从头像图片里提取一个「适合当友链卡片背景」的主题色。
 * 纯前端实现：crossOrigin + canvas 读像素，不经过后端。
 */

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
  const hp = ((h % 360) + 360) % 360 / 60;
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

/** 调整成适合做卡片背景的颜色：保证白字可读、颜色不过灰 */
function normalizeForCard(hsl: Hsl): Hsl {
  let { h, s, l } = hsl;
  // 太亮 -> 压暗，保证白字对比度
  if (l > 0.58) l = 0.58;
  // 太暗 -> 提亮一点，避免糊成黑块
  if (l < 0.28) l = 0.28 + (l - 0.28) * 0.3;
  // 灰扑扑的图（比如线稿、黑白头像）补一点饱和度
  if (s < 0.22) s = 0.22;
  if (s > 0.75) s = 0.75;
  return { h, s, l };
}

function loadImage(url: string, timeoutMs = 8000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => reject(new Error("图片加载超时")), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("图片加载失败"));
    };
    img.src = url;
  });
}

/**
 * 提取主题色。
 * - 跳过透明像素、接近纯白/纯黑的像素（头像背景常是白底，会把颜色带偏）
 * - 按色相/明度分桶，取「最有存在感」的那一桶
 * - 最后压到适合白字卡片的明度/饱和度区间
 */
export async function extractThemeColorFromImage(url: string): Promise<string> {
  if (!url || !/^https?:\/\//i.test(url.trim())) return "";
  const img = await loadImage(url.trim());

  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "";
  ctx.drawImage(img, 0, 0, size, size);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch {
    // 对方图片没给 CORS 头，canvas 被污染
    return "";
  }

  const buckets = new Map<
    string,
    { weight: number; r: number; g: number; b: number; count: number }
  >();

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const hsl = rgbToHsl(r, g, b);
    // 跳过白底 / 黑边 / 极浅极深像素
    if (hsl.l > 0.92 || hsl.l < 0.06) continue;

    // 量化到 8 级色相 + 4 级明度，避免同一颜色被拆散
    const hKey = Math.round(hsl.h / 16);
    const lKey = Math.round(hsl.l * 8);
    const key = `${hKey}-${lKey}`;
    // 有彩度的像素权重更高（大面积白底/灰底不吃香）
    const weight = 1 + hsl.s * 3;
    const cur = buckets.get(key);
    if (cur) {
      cur.weight += weight;
      cur.r += r;
      cur.g += g;
      cur.b += b;
      cur.count += 1;
    } else {
      buckets.set(key, { weight, r, g, b, count: 1 });
    }
  }

  if (buckets.size === 0) {
    // 整张图都是极浅/极深像素：退化成平均色
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
    if (!n) return "";
    const avg = rgbToHsl(Math.round(r / n), Math.round(g / n), Math.round(b / n));
    return toHex(hslToRgb(normalizeForCard(avg)));
  }

  let best = [...buckets.values()].sort((a, b) => b.weight - a.weight)[0];
  const avg: Hsl = rgbToHsl(
    Math.round(best.r / best.count),
    Math.round(best.g / best.count),
    Math.round(best.b / best.count),
  );
  return toHex(hslToRgb(normalizeForCard(avg)));
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
    if (contrastWithWhite(toHex(candidate)) >= minContrast) return toHex(candidate);
  }
  // 极端情况（比如纯白）：给一个深灰
  return "#3a3a3a";
}
