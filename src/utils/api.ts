/**
 * new-goapi 后端 API 层（唯一出口）。
 *
 * 全站对后端的访问都从这里走，调用方不再自己拼 backEndUrl、
 * 也不再各自拆 `{ok, data, meta}` 信封。契约见
 * ariablognext-backend-go/docs/api-v1.md：
 *   成功 `{ok:true, requestId, data, meta?}`；失败 `{ok:false, error:{code,message}}`。
 *
 * 约定：
 * - 网络层异常（断网等）原样抛出，由调用方决定怎么兜底——和旧代码的失败语义一致；
 * - HTTP 非 2xx 或信封 ok:false 时返回 `{ok:false, message}`，
 *   message 是后端给的面向用户的中文（可展示），拿不到时给兜底文案；
 * - 只有服务端组件才带 `next.revalidate`（默认 7200 秒），可传 `tags` 打失效标签；
 *   浏览器里 `next` 不是合法 RequestInit，传了也会被忽略，索性不带。
 */
import { siteConfigs } from "config";
import { Post } from "interfaces/post";
import { Category } from "@/interfaces/category";
import { FriendLinkGroup } from "interfaces/friendlink";
import { ArchiveListItem } from "@/interfaces/asidelistitem";
import { BB } from "@/interfaces/bb";

export type ListMeta = { page?: number; pageSize?: number | "full"; count: number; hasMore?: boolean };

export type ApiResult<T> =
  | { ok: true; data: T; meta?: ListMeta }
  | { ok: false; status: number; message: string };

type GoapiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** 服务端缓存标签（fetch next.tags），客户端调用不要传 */
  tags?: string[];
  /** 服务端缓存时长，默认 600 秒 */
  revalidate?: number;
};

/**
 * 默认 TTL 只做兜底：正常写路径会由 Go 后端在写入成功后调用
 * /refreshCache/{posts,speaks,flinks,post/<slug>} 立即失效（见 backend-go
 * SiteService.Notify）。600s 是为了「Webhook 丢了/博客当时挂了」时，
 * 内容最多 10 分钟后自己恢复，而不是像以前那样只能等 dashboard 手动刷。
 */
const DEFAULT_REVALIDATE = 600;

/** 服务端渲染时才启用 Next 的 fetch 缓存参数；浏览器里 fetch 不认识 `next` */
const isServer = typeof window === "undefined";

async function goapi<T>(path: string, opts: GoapiOptions = {}): Promise<ApiResult<T>> {
  const { tags, revalidate = DEFAULT_REVALIDATE, body, ...init } = opts;
  const res = await fetch(`${siteConfigs.backEndUrl}${path}`, {
    ...init,
    ...(body !== undefined
      ? { body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...init.headers } }
      : {}),
    // revalidate > 0 才进 fetch 缓存；revalidate: 0 表示「这次别缓存」。
    // 客户端组件（搜索、摘要、说说瀑布流）根本不会带这个字段。
    ...(isServer && revalidate > 0 ? { next: { revalidate, tags } } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    return { ok: false, status: res.status, message: err?.error?.message ?? `请求失败（HTTP ${res.status}）` };
  }
  const json = await res.json().catch(() => null);
  if (!json?.ok) return { ok: false, status: res.status, message: json?.error?.message ?? "响应格式异常" };
  return { ok: true, data: json.data as T, meta: json.meta };
}

/** 服务端渲染用的默认缓存参数 */
const cache = (tags: string[], revalidate = DEFAULT_REVALIDATE) => ({ tags, revalidate });

// ---------- posts ----------

/** 把 countOnly 响应（data 为 null、数量在 meta.count）规整成 ApiResult<number> */
function withCount(r: ApiResult<null>): ApiResult<number> {
  return r.ok ? { ok: true, data: r.meta?.count ?? 0 } : r;
}

/** 文章总数（posts/list?countOnly=true，数量在 meta.count） */
export function fetchPostCount(opts?: GoapiOptions) {
  return goapi<null>("/posts/list?countOnly=true", { ...cache(["posts"]), ...opts }).then(withCount);
}

/**
 * 按旧分页语义取一个「文章窗口」[startl, endl)。
 *
 * 旧接口能按任意区间取（postsInfo?startl=&endl=），新接口只能按整页取。
 * 首页 15 篇、之后每页 16 篇，起点不是 pageSize 的整数倍，所以先按
 * windowSize 对齐到页，再最多拼两页后切片。
 *
 * 不能像早期版本那样「取一页 size=windowSize+(startl%windowSize) 再切」：
 * startl%fetchSize 随页码变化，当余数大于 windowSize 时切片会越过页尾，
 * 第 4、8、12… 页会少一篇（2026-10-30 修复）。
 */
export async function fetchPostsWindow(startl: number, endl: number, opts?: GoapiOptions): Promise<ApiResult<Post[]>> {
  const windowSize = endl - startl;
  if (windowSize <= 0) return { ok: true, data: [] };
  const page = Math.floor(startl / windowSize) + 1;
  const skip = startl - (page - 1) * windowSize;
  const pageOpts = { ...cache(["posts"]), ...opts };
  // 第 2 页起窗口必然跨页，两页可以同时请求；串行会让首屏多等一个 Atlas 往返。
  if (skip === 0) {
    const first = await goapi<Post[]>(`/posts/list?page=${page}&pageSize=${windowSize}`, pageOpts);
    return first.ok ? { ok: true, data: first.data.slice(0, windowSize) } : first;
  }
  const [first, second] = await Promise.all([
    goapi<Post[]>(`/posts/list?page=${page}&pageSize=${windowSize}`, pageOpts),
    goapi<Post[]>(`/posts/list?page=${page + 1}&pageSize=${windowSize}`, pageOpts),
  ]);
  if (!first.ok) return first;
  if (!second.ok) return second;
  return { ok: true, data: first.data.concat(second.data).slice(skip, skip + windowSize) };
}

/**
 * 按 pageSize=200 翻页拉取全部命中。
 *
 * 不用 pageSize=full：后端对 full 有 300 条硬上限，超过直接 400（不是截断），
 * 而 RSS 与分类/标签/归档页需要「全部」。翻页循环对文章数增长免疫。
 */
async function goapiAllPosts(query: string, opts: GoapiOptions = {}): Promise<ApiResult<Post[]>> {
  const out: Post[] = [];
  // 上限只是防御：200 篇/页，50 页 = 10000 篇，够用到托管方换套餐
  for (let page = 1; page <= 50; page++) {
    const r = await goapi<Post[]>(`/posts/list?page=${page}&pageSize=200${query}`, opts);
    if (!r.ok) return r;
    out.push(...r.data);
    if (!r.meta?.hasMore) return { ok: true, data: out };
  }
  return { ok: true, data: out };
}

/** RSS 全量：全部文章含 mdContent */
export function fetchAllPostsWithContent(opts?: GoapiOptions) {
  return goapiAllPosts("&withContent=true", { revalidate: 3600, tags: ["posts"], ...opts });
}

/** 最新 N 篇（侧栏「最新文章」） */
export function fetchNewestPosts(limit: number, opts?: GoapiOptions) {
  return goapi<Post[]>(`/posts/list?page=1&pageSize=${limit}`, { ...cache(["posts"]), ...opts });
}

export function fetchPostDetail(slug: string, opts?: GoapiOptions) {
  return goapi<Post>(`/posts/detail?slug=${encodeURIComponent(slug)}`, { ...cache([slug]), ...opts });
}

export function fetchPostSlugs(opts?: GoapiOptions) {
  return goapi<string[]>("/posts/slugs", { ...cache(["posts"]), ...opts });
}

export function fetchPostNavigation(slug: string, opts?: GoapiOptions) {
  return goapi<{ newer: Post | null; older: Post | null }>(
    `/posts/navigation?slug=${encodeURIComponent(slug)}`,
    { ...cache(["posts"]), ...opts },
  );
}

export function fetchRelatedPosts(slug: string, opts?: GoapiOptions) {
  return goapi<Post[]>(`/posts/related?slug=${encodeURIComponent(slug)}`, { ...cache(["posts"]), ...opts });
}

/**
 * /posts/semantic 的结果项（2026-10-28 落地）。
 * 与列表项不同，它没有 category/tags/plainContent，只有搜索卡片需要的字段。
 */
export interface SemanticHit {
  slug: string;
  title: string;
  bannerImg: string;
  publishTime: number;
  /** 命中片段；语义命中时是命中块开头 120 字，可能为 null */
  context: string | null;
  matchType: "exact" | "fuzzy" | "semantic";
  matchScore: number;
  /** 历史字段，与 matchScore 同值 */
  score: number;
}

/**
 * 搜索。走 /posts/semantic：后端按 features.semanticSearch 自动分流，
 * 关闭时回退纯关键词（与 /posts/list?keyword 同源同序），调用方无感。
 * 不传 pageSize：语义端点返回全部命中、不分页。
 */
export function searchPosts(query: string, opts?: GoapiOptions) {
  return goapi<SemanticHit[]>(`/posts/semantic?query=${encodeURIComponent(query)}`, {
    // 搜索是实时行为，别进 7200s 的 fetch 缓存
    revalidate: 0,
    ...opts,
  });
}

/** 标题搜索（后台同款语义：titleOnly=true） */
export function searchPostTitles(keyword: string, page = 1, pageSize = 20, countOnly = false, opts?: GoapiOptions) {
  const k = encodeURIComponent(keyword);
  return goapi<Post[]>(`/posts/list?page=${page}&pageSize=${pageSize}&titleOnly=true&keyword=${k}${countOnly ? "&countOnly=true" : ""}`, opts);
}

export function fetchPostsByCategory(category: string, opts?: GoapiOptions) {
  return goapiAllPosts(`&category=${encodeURIComponent(category)}`, { ...cache(["posts"]), ...opts });
}

export function fetchPostsByTag(tag: string, opts?: GoapiOptions) {
  return goapiAllPosts(`&tag=${encodeURIComponent(tag)}`, { ...cache(["posts"]), ...opts });
}

export function fetchPostsByMonth(year: number, month: number, opts?: GoapiOptions) {
  return goapiAllPosts(`&year=${year}&month=${month}`, { ...cache(["posts"]), ...opts });
}

/** 全站总字数（posts/statistics） */
export function fetchPostStatistics(opts?: GoapiOptions) {
  return goapi<{ totalWordCount: number }>("/posts/statistics", { ...cache(["posts"]), ...opts });
}

/** AI 摘要：缓存优先，miss 时后端会生成一次并落库 */
export function fetchPostSummary(slug: string) {
  return goapi<{ summary: string }>(`/posts/summary?slug=${encodeURIComponent(slug)}`);
}

// ---------- taxonomy ----------

export function fetchTags(opts?: GoapiOptions) {
  return goapi<Category[]>("/tags/list", { ...cache(["posts"]), ...opts });
}

export function fetchCategories(opts?: GoapiOptions) {
  return goapi<Category[]>("/categories/list", { ...cache(["posts"]), ...opts });
}

/** 标签种类数（去重后的个数） */
export function fetchTagCount(opts?: GoapiOptions) {
  return goapi<null>("/tags/list?countOnly=true", { ...cache(["posts"]), ...opts }).then(withCount);
}

export function fetchCategoryCount(opts?: GoapiOptions) {
  return goapi<null>("/categories/list?countOnly=true", { ...cache(["posts"]), ...opts }).then(withCount);
}

/** 归档月份列表 [{year, month, count}]，按上海时区分桶、倒序 */
export function fetchArchives(opts?: GoapiOptions) {
  return goapi<ArchiveListItem[]>("/archives/list", { ...cache(["posts"]), ...opts });
}

// ---------- speaks ----------

/** 最新 N 条说说，time 倒序 */
export function fetchSpeaks(limit: number, opts?: GoapiOptions) {
  return goapi<BB[]>(`/speaks/list?page=1&pageSize=${limit}`, { ...cache(["speaks"]), ...opts });
}

// ---------- links ----------

/** 友链分组列表（meta.count 是友链条目总数） */
export function fetchFlinkGroups(opts?: GoapiOptions) {
  return goapi<FriendLinkGroup[]>("/links/list", { ...cache(["flinks"]), ...opts });
}

/**
 * 头像取色。链接非法返回 ""；下载/解析失败时抛错，
 * message 是可直接展示的中文（与 themeColor.ts 的对外语义保持一致）。
 */
export async function fetchThemeColor(url: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${siteConfigs.backEndUrl}/links/theme-color?url=${encodeURIComponent(url)}`);
  } catch {
    // 网络层失败（断网/后端不可达）：浏览器给的是英文 TypeError，别透传
    throw new Error("取色服务暂时不可用，请稍后再试");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = typeof data?.error?.message === "string" ? data.error.message : "";
    throw new Error(msg || "取色服务暂时不可用，请稍后再试");
  }
  return typeof data?.data?.color === "string" ? data.data.color : "";
}

// ---------- site ----------

export function fetchSiteInfo(opts?: GoapiOptions) {
  return goapi<{ latestUpdateTime: number }>("/site/info", { ...cache(["siteInfo"]), ...opts });
}

// ---------- sitemap ----------

/** sitemap 是唯一不走信封的响应（XML 原样） */
export async function fetchSitemapXml(opts?: GoapiOptions) {
  const { tags, revalidate = 7200, body: _unusedBody, ...init } = opts ?? {};
  void _unusedBody;
  const res = await fetch(`${siteConfigs.backEndUrl}/sitemap`, {
    ...init,
    ...(isServer && revalidate > 0 ? { next: { revalidate, tags } } : {}),
  });
  if (!res.ok) return null;
  return res.text();
}

// ---------- 友链申请 ----------

export interface FlinkApplicationPayload {
  name: string;
  link: string;
  avatar: string;
  descr: string;
  color: string;
  email: string;
  type: 0 | 1;
  targetUrl: string;
}

export function submitFlinkApplication(payload: FlinkApplicationPayload) {
  return goapi<{ screeningTriggered: boolean; mailSent: boolean }>("/links/applications/apply", {
    method: "POST",
    body: payload,
  });
}

/** 自助查询申请进度：按邮箱或站点名称，最多返回 20 条 */
export function queryApplicationStatus<T = unknown>(by: { email?: string; name?: string }) {
  const key = by.email ? `email=${encodeURIComponent(by.email)}` : `name=${encodeURIComponent(by.name ?? "")}`;
  return goapi<T[]>(`/links/applications/status?${key}`);
}
