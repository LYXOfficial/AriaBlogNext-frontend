"use client";

import { useEffect } from "react";
import { siteConfigs } from "config";
import { fetchPostSlugs } from "utils/api";
import { getTwikooCommentsCount } from "utils/twikooApi";

function normalizeUrl(url: string) {
  return url.length > 1 ? url.replace(/\/+$/, "") : url;
}

export default function TwikooCountHome() {
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const cardEntries: { path: string; el: Element }[] = [];
      document.querySelectorAll(".post-info").forEach((el) => {
        const postTitle = el.querySelector(
          ".post-title",
        ) as HTMLAnchorElement | null;
        if (!postTitle) return;
        const path = normalizeUrl(
          "/" + postTitle.href.split("/").slice(3).join("/"),
        );
        cardEntries.push({ path, el });
      });

      const rest = await fetchPostSlugs();
      if (cancelled) return;
      const pages = ["/messageboard", "/speaks", "/about", "/links"];
      const postSlugs = rest.ok ? (rest.data ?? []) : [];
      // 将首页文章卡片与全站统计合并为一次批量请求（服务端会归一化尾斜杠，
      // 每个页面只传一次，避免翻倍），同时省去 15 次零散请求。
      const allUrls = [
        ...new Set([
          ...cardEntries.map((item) => item.path),
          ...postSlugs.map((slug) => `/posts/${slug}`),
          ...pages,
        ]),
      ];

      const res = await getTwikooCommentsCount({
        envId: siteConfigs.twikooEnv,
        urls: allUrls,
        includeReply: true,
      });
      if (cancelled || !Array.isArray(res)) return;

      const countMap = new Map<string, number>();
      let total = 0;
      for (const item of res) {
        const count = typeof item?.count === "number" ? item.count : 0;
        total += count;
        if (item?.url) countMap.set(normalizeUrl(item.url), count);
      }

      for (const { path, el } of cardEntries) {
        const commentCountElement = el.querySelector(
          ".post-commentcount>.post-meta-content",
        );
        if (commentCountElement) {
          commentCountElement.textContent = `${countMap.get(path) ?? 0} 条评论`;
        }
      }

      if (rest.ok) {
        const webinfoCommentCountElement = document.querySelector(
          ".card-webinfo-item-right.commentcount",
        );
        if (webinfoCommentCountElement) {
          webinfoCommentCountElement.textContent = total.toString();
        }
      }
    };

    const w = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let timer = 0;
    let idle = 0;
    if (typeof w.requestIdleCallback === "function") {
      idle = w.requestIdleCallback(
        () => {
          run().catch((error: unknown) =>
            console.warn("评论计数加载失败", error),
          );
        },
        { timeout: 1500 },
      );
    } else {
      timer = window.setTimeout(() => {
        run().catch((error: unknown) =>
          console.warn("评论计数加载失败", error),
        );
      }, 300);
    }
    return () => {
      cancelled = true;
      if (idle && typeof w.cancelIdleCallback === "function")
        w.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return null;
}
