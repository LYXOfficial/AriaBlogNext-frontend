import { NextRequest } from "next/server";

/**
 * 网易云逐词歌词（YRC）代理。
 *
 * 背景：播放器原来直接请求第三方 CORS 代理 `cors.emasop.cn`，那个域名已经
 * 在 .cn 注册局层面消失（NXDOMAIN），解析不回来，逐词歌词整段失效。
 *
 * 网易云官方接口 `music.163.com/api/song/lyric` 不返回 Access-Control-Allow-Origin，
 * 浏览器直连一定被跨域拦住，所以改由站内路由转发：前端同源请求，服务端去拿。
 * 歌词是静态内容，这里同时做内存缓存 + CDN 缓存，避免每换一首歌都打一次上游。
 *
 * 只接受纯数字歌曲 id，避免这个路由被当成任意地址的开放代理。
 */

const UPSTREAM = "https://music.163.com/api/song/lyric";
// 网易云对空 UA / 站外 Referer 有时会返回空歌词，带上这两个头最稳。
const UPSTREAM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://music.163.com/",
};
const ID_RE = /^\d{1,20}$/;
const CACHE_TTL = 24 * 60 * 60 * 1000;
const MAX_CACHE = 300;
const CDN_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
};

type Entry = { data: unknown; at: number };

const cache = new Map<string, Entry>();

function cached(id: string): unknown | null {
  const hit = cache.get(id);
  if (!hit) return null;
  if (Date.now() - hit.at < CACHE_TTL) return hit.data;
  cache.delete(id);
  return null;
}

function remember(id: string, data: unknown) {
  if (cache.size >= MAX_CACHE) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(id, { data, at: Date.now() });
}

function fail(status: number) {
  return Response.json(
    { message: "fail", error: "歌词服务暂时不可用，稍后再试" },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get("id") ?? "").trim();
  if (!ID_RE.test(id)) return fail(400);

  const hit = cached(id);
  if (hit) return Response.json(hit, { headers: CDN_HEADERS });

  // 把时间轴、翻译、逐词都带全，上游默认只给普通 LRC。
  const url = new URL(UPSTREAM);
  url.searchParams.set("id", id);
  for (const key of ["lv", "kv", "tv", "rv", "yv", "ytv"]) {
    url.searchParams.set(key, "-1");
  }
  url.searchParams.set("cp", "false");

  let data: unknown;
  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: UPSTREAM_HEADERS,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return fail(502);
    data = await res.json();
  } catch {
    // 上游超时 / 网络失败：不缓存，下次换歌还能重试。
    return fail(502);
  }

  // 上游找不到歌曲时会给 code 404，直接透出的话前端会当成「有歌词」空数组，
  // 这里统一按失败处理，让播放器退回普通 LRC。
  if ((data as { code?: number } | null)?.code !== 200) return fail(502);

  remember(id, data);
  return Response.json(data, { headers: CDN_HEADERS });
}
