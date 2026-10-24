/**
 * 从「粘贴过来的友链信息」里提取字段，纯规则实现，不调用任何外部 API。
 *
 * 支持的写法（中英文、全角/半角、有无冒号都行）：
 *   link(site page website): https://x.com
 *   网站名称（站名 站点名称 标题） xxx
 *   头像地址（网站图标 图标 头像）: https://x.com/a.png
 *   - 描述：一个碎碎念的博客
 *   | 名称 | 测试站 |
 *   {"name":"测试","url":"https://x.com"}
 *   https://x.com
 *   https://x.com/avatar.png
 */

export interface ParsedFlink {
  name?: string;
  link?: string;
  avatar?: string;
  descr?: string;
  color?: string;
}

type Field = "name" | "link" | "avatar" | "descr" | "color";

const MAX_NAME = 50;
const MAX_DESCR = 200;

/** 注意：带 g 的正则不能用于 .test()，否则 lastIndex 会残留导致结果时对时错 */
const URL_TEST_RE = /https?:\/\//i;
const URL_RE = /^https?:\/\/[^\s<>"'）)】\]]+$/i;
const URL_GLOBAL_RE = /https?:\/\/[^\s<>"'）)】\]]+/gi;
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|svg|ico|avif|bmp)(\?|#|$)/i;
const IMAGE_HINT_RE =
  /(avatar|icon|logo|favicon|gravatar|head|portrait|头像|图标)/i;
const COLOR_RE =
  /^(#[0-9a-fA-F]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\s]+\)|[a-zA-Z]{3,20})$/;
const HAS_WORD_RE =
  /[A-Za-z0-9\u00C0-\u024F\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]|\p{Extended_Pictographic}/u;

/** 标签同义词。匹配时按长度从长到短，避免「网站」抢走「网站链接」 */
const SYNONYMS: Array<{ field: Field; words: string[] }> = [
  {
    field: "descr",
    words: [
      "站点描述",
      "网站描述",
      "一句话介绍",
      "网站简介",
      "站点简介",
      "description",
      "介绍",
      "简介",
      "描述",
      "简述",
      "说明",
      "签名",
      "格言",
      "about",
      "intro",
      "desc",
      "bio",
    ],
  },
  {
    field: "avatar",
    words: [
      "头像地址",
      "头像链接",
      "头像url",
      "网站图标",
      "站点图标",
      "网站logo",
      "网站头像",
      "favicon",
      "头像",
      "图标",
      "avatar",
      "image",
      "logo",
      "icon",
    ],
  },
  {
    field: "color",
    words: [
      "背景颜色",
      "背景色",
      "主题色",
      "色值",
      "颜色",
      "background",
      "color",
      "theme",
      "bg",
    ],
  },
  {
    field: "link",
    words: [
      "网站链接",
      "站点链接",
      "网站地址",
      "网站网址",
      "站点地址",
      "主页地址",
      "homepage",
      "website",
      "siteurl",
      "链接",
      "网址",
      "地址",
      "主页",
      "首页",
      "link",
      "site",
      "page",
      "home",
      "url",
      "web",
    ],
  },
  {
    field: "name",
    words: [
      "网站名称",
      "站点名称",
      "博客名称",
      "站点标题",
      "网站标题",
      "sitetitle",
      "sitename",
      "blogname",
      "站名",
      "站点",
      "网站",
      "标题",
      "名字",
      "名称",
      "title",
      "name",
      "blog",
    ],
  },
];

const ALL_SYNONYMS: Array<{ field: Field; word: string }> = SYNONYMS.flatMap(
  (g) => g.words.map((word) => ({ field: g.field, word })),
).sort((a, b) => b.word.length - a.word.length);

/** 预计算归一化结果（normalize 是函数声明，会被提升，可用于此处初始化） */
const ALL_SYNONYMS_NORM = ALL_SYNONYMS.map((item) => ({
  ...item,
  norm: normalize(item.word),
}));

/** 只在成对出现时剥离外层包裹，避免把名称里的括号吃掉 */
const PAIRS: Array<[string, string]> = [
  ["<", ">"],
  ["「", "」"],
  ["『", "』"],
  ['"', '"'],
  ["'", "'"],
  ["`", "`"],
  ["(", ")"],
  ["（", "）"],
  ["[", "]"],
  ["【", "】"],
  ["《", "》"],
];

function stripPairs(value: string): string {
  let out = value.trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const [open, close] of PAIRS) {
      if (out.length >= 2 && out.startsWith(open) && out.endsWith(close)) {
        out = out.slice(open.length, out.length - close.length).trim();
        changed = true;
      }
    }
  }
  return out;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_\-·・/\\|:：]+/g, "")
    .replace(/[（）()【】[\]]/g, "");
}

/** 判断一段文字属于哪个字段（取最长的同义词） */
function matchLabel(label: string): Field | null {
  const text = normalize(label);
  if (!text) return null;
  for (const { field, norm } of ALL_SYNONYMS_NORM) {
    if (text.includes(norm)) return field;
  }
  return null;
}

/** 清理单行：去 BOM/列表符号/加粗，全角冒号转半角 */
function cleanLine(raw: string): string {
  return raw
    .replace(/\r/g, "")
    .replace(/^\uFEFF/, "")
    .replace(/\*\*/g, "")
    .replace(/^[\s\-*+•·]+/, "")
    .replace(/^\d+[.、)]\s*/, "")
    .replace(/：/g, ":")
    .trim();
}

/** 去掉值两侧的成对引号/括号，以及 markdown 链接包装、行尾标点 */
function cleanValue(raw: string): string {
  let value = raw.trim();
  const md = value.match(/\[[^\]]*\]\(([^)]+)\)/);
  if (md) value = md[1].trim();
  value = stripPairs(value);
  value = value.replace(/[，,。;；!！?？]+$/, "").trim();
  return value;
}

/** 「标签 + 分隔符 + 值」拆两半；支持 markdown 表格行 */
function splitKeyValue(line: string): { key: string; value: string } | null {
  // Markdown 表格行：| 名称 | 测试站 |
  const table = line.match(/^\|(.+)\|$/);
  if (table) {
    const cells = table[1]
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);
    if (cells.length >= 2) {
      return { key: cells[0], value: cells.slice(1).join(" ") };
    }
  }

  // 冒号（取第一个冒号，避免把 URL 里的端口切开）
  const colon = line.match(/^([^:]{1,40}):\s*(.+)$/);
  if (colon && matchLabel(colon[1])) {
    return { key: colon[1], value: colon[2] };
  }

  // 空格/制表符分隔：标签词开头，后面是值
  for (const { word } of ALL_SYNONYMS) {
    const head = line.slice(0, word.length);
    if (head.toLowerCase() !== word.toLowerCase()) continue;
    let rest = line.slice(word.length).trim();
    const paren = rest.match(/^[（(][^）)]*[）)]\s*(.*)$/);
    if (paren) rest = paren[1].trim();
    rest = rest.replace(/^[:：\-—|]+\s*/, "").trim();
    // 命中即停止（同义词按长到短排序）：剩余为空说明这行只是标签本身
    return rest ? { key: word, value: rest } : null;
  }
  return null;
}

/** 只有标签、没有值（值在下一行） */
function labelOnly(line: string): Field | null {
  if (line.length > 40) return null;
  if (URL_TEST_RE.test(line)) return null;
  if (/[:：]/.test(line)) return null;
  const stripped = line.replace(/[（(][^）)]*[）)]/g, "").trim();
  if (!stripped) return null;
  const norm = normalize(stripped);
  for (const { word, norm: w } of ALL_SYNONYMS_NORM) {
    if (norm === w || (norm.length <= w.length + 2 && norm.startsWith(w))) {
      return matchLabel(stripped);
    }
  }
  return null;
}

/** 整段文字就是个标签（例如「名称:」被误当站名的场景） */
function isBareLabel(text: string): boolean {
  const norm = normalize(text);
  return (
    norm.length > 0 && ALL_SYNONYMS_NORM.some((item) => item.norm === norm)
  );
}

/** 像一句话而不是站名：含句末标点或常见口语词，或没有任何文字 */
const PROSE_RE = /[，。！？；,.!?;]|(是|你好|欢迎|感谢|请问|这里|这是)/;

function looksLikeName(text: string): boolean {
  return (
    text.length > 0 &&
    text.length <= MAX_NAME &&
    HAS_WORD_RE.test(text) &&
    !URL_TEST_RE.test(text) &&
    !PROSE_RE.test(text) &&
    !isBareLabel(text) &&
    !/^(颜色|背景色|描述|简介|头像|图标)/.test(text)
  );
}

/** 图片判定：优先看扩展名；没有扩展名时只认「最后一段带图标词且像文件/带参数」 */
function looksLikeImage(url: string): boolean {
  if (IMAGE_EXT_RE.test(url)) return true;
  const last =
    url.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() ?? "";
  return IMAGE_HINT_RE.test(last) && (last.includes(".") || url.includes("?"));
}

/** 补全裸域名：www.foo.com / //foo.com -> https://foo.com */
function normalizeUrlCandidate(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(www\.|\/\/)/i.test(value)) {
    return "https://" + value.replace(/^\/\//, "");
  }
  return value;
}

/** 没有标签时，按内容猜：包含 URL 的行分给 link/avatar，纯文字当作名称 */
function assignByContent(line: string, result: ParsedFlink) {
  const urls = line.match(URL_GLOBAL_RE) ?? [];
  if (urls.length === 0) {
    const text = cleanValue(line);
    if (!result.name && looksLikeName(text)) result.name = text;
    return;
  }

  const withoutUrls = line
    .replace(URL_GLOBAL_RE, "")
    .replace(/[:：\-—|]+/g, " ")
    .trim();
  if (!result.name) {
    const text = cleanValue(withoutUrls);
    if (looksLikeName(text)) result.name = text;
  }

  for (const raw of urls) {
    const url = cleanValue(normalizeUrlCandidate(raw));
    if (!URL_RE.test(url)) continue;
    if (!result.avatar && looksLikeImage(url)) {
      result.avatar = url;
    } else if (!result.link && !looksLikeImage(url)) {
      result.link = url;
    }
  }
}

function assignField(
  field: Field,
  rawValue: string,
  result: ParsedFlink,
): boolean {
  const value = cleanValue(rawValue);
  if (!value) return false;

  switch (field) {
    case "link":
    case "avatar": {
      const found = value.match(URL_GLOBAL_RE);
      const url = cleanValue(normalizeUrlCandidate(found ? found[0] : value));
      if (!URL_RE.test(url)) return false;
      if (!result[field]) result[field] = url;
      return true;
    }
    case "name": {
      if (URL_TEST_RE.test(value)) return false;
      if (!result.name && HAS_WORD_RE.test(value)) {
        result.name = value.slice(0, MAX_NAME);
      }
      return true;
    }
    case "descr": {
      if (!result.descr) result.descr = value.slice(0, MAX_DESCR);
      return true;
    }
    case "color": {
      if (!result.color && COLOR_RE.test(value)) result.color = value;
      return true;
    }
  }
  return false;
}

/** 粘贴内容本身就是 JSON 时，直接按字段名取值 */
function parseJson(raw: string): ParsedFlink | null {
  const text = raw.trim();
  if (!text.startsWith("{")) return null;
  try {
    const obj = JSON.parse(text) as Record<string, unknown>;
    const pick = (...keys: string[]) => {
      for (const key of keys) {
        const value = obj?.[key];
        if (typeof value === "string" && value.trim()) return value;
      }
      return "";
    };
    const result: ParsedFlink = {};
    const name = pick("name", "title", "siteName", "sitename");
    const link = pick("url", "link", "site", "website", "homepage");
    const avatar = pick("avatar", "icon", "logo", "image", "favicon");
    const descr = pick("descr", "description", "desc", "about", "intro", "bio");
    const color = pick("color", "theme", "bg", "background");
    if (name) assignField("name", name, result);
    if (link) assignField("link", link, result);
    if (avatar) assignField("avatar", avatar, result);
    if (descr) assignField("descr", descr, result);
    if (color) assignField("color", color, result);
    return Object.keys(result).length ? result : null;
  } catch {
    return null;
  }
}

/** 主入口：把一段粘贴文本解析成表单字段 */
export function parseFlinkText(raw: string): ParsedFlink {
  const result: ParsedFlink = {};
  if (typeof raw !== "string" || !raw.trim()) return result;

  const fromJson = parseJson(raw);
  if (fromJson) return fromJson;

  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  let pending: Field | null = null;

  for (const line of lines) {
    // 1) 纯标签行：值在下一行
    const only = labelOnly(line);
    if (only) {
      pending = only;
      continue;
    }

    // 2) 标签 + 值
    const kv = splitKeyValue(line);
    if (kv) {
      const field = matchLabel(kv.key);
      if (field) {
        if (assignField(field, kv.value, result)) {
          pending = null;
          continue;
        }
        // 标签明确但值不合法：整行跳过，避免把标签文字当站名
        pending = null;
        continue;
      }
    }

    // 3) 上一条是纯标签：整行作为它的值
    if (pending) {
      if (assignField(pending, line, result)) {
        pending = null;
        continue;
      }
      pending = null;
    }

    // 4) 没标签：按内容猜
    assignByContent(line, result);
  }

  // 名称兜底：用域名
  if (!result.name && result.link) {
    try {
      result.name = new URL(result.link).hostname.replace(/^www\./, "");
    } catch {
      /* ignore */
    }
  }

  return result;
}
