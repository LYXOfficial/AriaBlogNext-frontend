// 轻量级 Twikoo 只读接口封装：直接走 fetch 调用云函数，
// 避免首页和侧栏为了取评论数/最新评论而加载 350KB+ 的完整 twikoo 客户端。

async function callTwikoo<T>(
  envId: string,
  event: string,
  payload: Record<string, unknown>,
): Promise<T> {
  let accessToken: string | null = null;
  try {
    accessToken = localStorage.getItem("twikoo-access-token");
  } catch {
    // 隐私模式可能禁用存储
  }
  const res = await fetch(envId, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken,
      event,
      ...payload,
      envId,
    }),
  });
  if (!res.ok) throw new Error(`Twikoo 请求失败（HTTP ${res.status}）`);
  const json = (await res.json()) as {
    accessToken?: string;
    data?: T;
    code?: number;
    message?: string;
  };
  if (json.accessToken && typeof json.accessToken === "string") {
    try {
      localStorage.setItem("twikoo-access-token", json.accessToken);
    } catch {}
  }
  if (typeof json.code === "number" && json.code !== 0) {
    throw new Error(json.message || `Twikoo 返回错误（${json.code}）`);
  }
  return json.data as T;
}

export async function getTwikooCommentsCount(options: {
  envId: string;
  urls: string[];
  includeReply?: boolean;
}): Promise<{ url: string; count: number }[]> {
  if (!options.urls.length) return [];
  const data = await callTwikoo<{ url: string; count: number }[]>(
    options.envId,
    "GET_COMMENTS_COUNT",
    {
      urls: options.urls,
      includeReply: options.includeReply ?? true,
    },
  );
  return Array.isArray(data) ? data : [];
}

export async function getTwikooRecentComments<T = unknown>(options: {
  envId: string;
  pageSize?: number;
  includeReply?: boolean;
}): Promise<T[]> {
  const data = await callTwikoo<T[]>(options.envId, "GET_RECENT_COMMENTS", {
    pageSize: options.pageSize ?? 5,
    includeReply: options.includeReply ?? true,
  });
  return Array.isArray(data) ? data : [];
}
