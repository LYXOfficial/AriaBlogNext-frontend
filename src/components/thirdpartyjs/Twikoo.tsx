"use client";
import { useEffect, useState } from "react";
// twikoo 2.x ships its stylesheet inlined in the bundle (and no longer exposes
// "twikoo/dist/twikoo.css" through its package "exports" map), so the separate
// CSS import is no longer needed.
import "styles/Twikoo.css";
import { siteConfigs } from "config";
import { fetchPostSlugs } from "utils/api";
import { Icon } from "@iconify/react";
import "styles/owoBig.css";

export function TwikooBaseComment() {
  const [tkloadState, setTkloadState] = useState<string>("加载中...");

  useEffect(() => {
    // 悬浮放大。原来靠 MutationObserver 逐个给 .OwO-body/.tk-comment 挂
    // onmouseover，twikoo 2.x 的 DOM 插入方式变了以后匹配不上，放大就失效了；
    // 改成在评论容器上做事件委托，面板怎么重建都不用重新绑定。
    function owoBig() {
      const m = 3;
      // 同一页面重复挂载时先清掉旧容器，避免出现多个 #owo-big 互相盖住
      document.querySelectorAll("#owo-big").forEach((el) => el.remove());
      const div = document.createElement("div");
      div.id = "owo-big";
      document.body.appendChild(div);

      let owo_time: ReturnType<typeof setTimeout> | null = null;
      let lastTarget: HTMLImageElement | null = null;

      const hide = () => {
        div.style.display = "none";
        div.innerHTML = "";
        if (owo_time) clearTimeout(owo_time);
        owo_time = null;
        lastTarget = null;
      };

      const onMouseOver = (e: MouseEvent) => {
        const target = e.target;
        if (!(target instanceof HTMLImageElement) || target === lastTarget)
          return;
        hide();
        lastTarget = target;
        owo_time = setTimeout(() => {
          const rect = target.getBoundingClientRect();
          const height = rect.height * m,
            width = rect.width * m;
          let left = rect.left - (width - rect.width) / 2,
            top = rect.top;

          if (left + width > window.innerWidth)
            left = window.innerWidth - width - 10;
          if (left < 0) left = 10;
          // 上方放不下就翻到图片下面（#owo-big 自己有 -105% 的位移）
          if (top - height * 1.05 < 0) top = rect.bottom + height * 1.05;

          div.style.cssText = `display:flex; height:${height}px; width:${width}px; left:${left}px; top:${top}px;`;
          div.innerHTML = `<img src="${target.currentSrc || target.src}">`;
          owo_time = null;
        }, 300);
      };

      const onMouseOut = (e: MouseEvent) => {
        const target = e.target;
        if (!(target instanceof HTMLImageElement)) return;
        if (e.relatedTarget instanceof Node && target.contains(e.relatedTarget))
          return;
        hide();
      };

      // 手机端长按图片不要弹系统菜单（原来只给表情面板和评论挂了）
      const onContextMenu = (e: MouseEvent) => {
        if (window.innerWidth <= 768) e.preventDefault();
      };

      const root =
        document.getElementById("post-comment-container") ?? document.body;
      root.addEventListener("mouseover", onMouseOver);
      root.addEventListener("mouseout", onMouseOut);
      root.addEventListener("contextmenu", onContextMenu);

      return () => {
        root.removeEventListener("mouseover", onMouseOver);
        root.removeEventListener("mouseout", onMouseOut);
        root.removeEventListener("contextmenu", onContextMenu);
        hide();
        div.remove();
      };
    }

    // 劫持表情点击：默认点击表情后 twikoo 会立即 toggle() 关闭 OwO 面板，
    // 这里在捕获阶段拦截 .OwO-item 的点击，直接把表情 code 插入光标处并保留面板打开状态。
    function keepOwOOpen() {
      const root =
        document.getElementById("post-comment-container") ?? document.body;

      const handleItemClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const item = target.closest(".OwO-item") as HTMLElement | null;
        if (!item) return;

        // 阻止冒泡到 twikoo 原生 onItemClick（原生会在插入后执行 this.toggle() 关闭面板）
        e.stopPropagation();
        e.preventDefault();

        const container = item.closest(".OwO");
        const textarea =
          (container
            ?.closest(".tk-submit")
            ?.querySelector("textarea") as HTMLTextAreaElement | null) ??
          (document.querySelector(
            ".tk-input textarea, textarea.tk-input__inner",
          ) as HTMLTextAreaElement | null);

        if (!textarea) return;

        let insertText = item.textContent ?? "";
        const img = item.querySelector("img");
        if (img) {
          if (item.title) {
            insertText = `:${item.title}: `;
          } else {
            const src = img.getAttribute("src");
            insertText = src
              ? `![](<${src.replace(/</g, "%3C").replace(/>/g, "%3E")}>)`
              : "";
          }
        }

        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? textarea.value.length;
        const val = textarea.value;

        textarea.value = val.slice(0, start) + insertText + val.slice(end);
        const nextPos = start + insertText.length;
        textarea.selectionStart = nextPos;
        textarea.selectionEnd = nextPos;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.focus();
      };

      root.addEventListener("click", handleItemClick, true);

      return () => {
        root.removeEventListener("click", handleItemClick, true);
      };
    }

    // twikoo 标题上的「N 条评论」读的是列表接口 COMMENT_GET 响应里的 count 字段
    // （服务端只数顶层；「查看更多」按钮由响应里的 more 字段驱动，别碰），
    // 和文章卡片、侧栏（都用 includeReply: true 的总数）对不上。
    // twikoo 没有站点级开关：渲染后覆写会和它自己的渲染赛跑（实测数字会闪），
    // 给 GET_COMMENTS_COUNT 补参也没用（标题不读它）。所以在 fetch 层改写
    // COMMENT_GET 的响应：列表请求照发，并行查一次含楼中楼的总数，把响应里
    // 的 count 替换掉再交给 twikoo 渲染。搜索请求（带 keyword）不改，
    // 「找到 N 条评论」保持搜索结果的语义。
    function patchCommentListCount() {
      const originalFetch = window.fetch.bind(window);
      window.fetch = async function (
        input: RequestInfo | URL,
        init?: RequestInit,
      ): Promise<Response> {
        try {
          const url =
            typeof input === "string"
              ? input
              : input instanceof URL
                ? input.toString()
                : input.url;
          const body = init?.body;
          if (typeof body !== "string" || !url.startsWith(siteConfigs.twikooEnv))
            return originalFetch(input, init);

          const payload = JSON.parse(body) as {
            event?: string;
            url?: string;
            keyword?: string;
          };
          if (payload.event !== "COMMENT_GET" || !payload.url || payload.keyword)
            return originalFetch(input, init);

          const [listRes, countRes] = await Promise.all([
            originalFetch(input, init),
            originalFetch(siteConfigs.twikooEnv, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event: "GET_COMMENTS_COUNT",
                urls: [payload.url],
                includeReply: true,
              }),
            }).catch(() => null),
          ]);
          const text = await listRes.text();
          let data: unknown;
          try {
            data = JSON.parse(text);
          } catch {
            return new Response(text, {
              status: listRes.status,
              statusText: listRes.statusText,
              headers: listRes.headers,
            });
          }
          if (countRes && data && typeof data === "object" && "count" in data) {
            try {
              const cj = (await countRes.json()) as {
                data?: { count?: number }[];
              };
              const total = cj?.data?.[0]?.count;
              if (typeof total === "number")
                (data as { count: number }).count = total;
            } catch {
              // 总数查不到就保留列表自带的顶层数，别让评论区因此挂掉
            }
          }
          // body 长度变了，content-length 不能透传，否则浏览器会挂起
          const headers = new Headers(listRes.headers);
          headers.delete("content-length");
          return new Response(JSON.stringify(data), {
            status: listRes.status,
            statusText: listRes.statusText,
            headers,
          });
        } catch {
          // 任何解析/改写异常都原样放行，不能因为补丁弄挂评论加载
          return originalFetch(input, init);
        }
      };
      return () => {
        window.fetch = originalFetch;
      };
    }

    const tk = require("twikoo");
    let cleanupOwoBig: (() => void) | null = null;
    let cleanupKeepOwOOpen: (() => void) | null = null;
    let cleanupCountPatch: (() => void) | null = null;
    try {
      cleanupCountPatch = patchCommentListCount();
      tk.init({
        envId: siteConfigs.twikooEnv,
        el: "#post-comment",
        // twikoo 2.x 新增了前端 i18n，不指定就跟浏览器语言走（1.6 没有这个行为）。
        // 本站界面全中文，固定下来避免英文浏览器看到英文评论框。
        lang: "zh-CN",
      }).catch((error: unknown) => {
        // init 返回 Promise，同步 try/catch 接不住网络或跨域失败。
        console.warn("评论加载失败", error);
        setTkloadState("评论暂时加载失败，可以刷新页面或稍后再试");
      });
      cleanupOwoBig = owoBig();
      cleanupKeepOwOOpen = keepOwOOpen();
    } catch (e) {
      setTkloadState("评论暂时加载失败，可以刷新页面或稍后再试");
    }

    return () => {
      cleanupOwoBig?.();
      cleanupKeepOwOOpen?.();
      cleanupCountPatch?.();
      const tkel = document.querySelector("#twikoo");
      if (tkel) {
        tkel.innerHTML = "";
        tkel.className = "";
        tkel.id = "post-comment";
      }
    };
  }, []);

  return (
    <div id="post-comment-container">
      <div id="post-comment-header">
        <Icon icon="solar:chat-square-dots-bold" />
        <h2>评论</h2>
      </div>
      <div id="post-comment">{tkloadState}</div>
    </div>
  );
}

export function TwikooCountPost() {
  useEffect(() => {
    const tk = require("twikoo");
    tk.getCommentsCount({
      envId: siteConfigs.twikooEnv,
      urls: [document.location.pathname],
      includeReply: true,
    })
      .then((res: { count: number }[] | undefined) => {
        if (!Array.isArray(res)) return;
        const commentCountElement = document.querySelector(
          ".post-commentcount>.post-meta-content",
        );
        if (commentCountElement) {
          commentCountElement.textContent = `${res[0]?.count ?? 0} 条评论`;
        }
      })
      .catch((error: unknown) => console.warn("评论计数获取失败", error));
  }, []);

  return null;
}

export function TwikooCountHome() {
  useEffect(() => {
    (async () => {
      const tk = require("twikoo");
      document.querySelectorAll(".post-info").forEach((el) => {
        const postTitle = el.querySelector(".post-title") as HTMLAnchorElement;
        const hr = "/" + postTitle.href.split("/").slice(3).join("/");
        // 注意：twikoo 会把 URL 结尾的斜杠归一化，同时传两种写法会返回同一个数，
        // 相加会导致评论数翻倍，所以这里只查一次。
        tk.getCommentsCount({
          envId: siteConfigs.twikooEnv,
          urls: [hr],
          includeReply: true,
        })
          .then((res: { count: number }[] | undefined) => {
            if (!Array.isArray(res)) return;
            const commentCountElement = el.querySelector(
              ".post-commentcount>.post-meta-content",
            );
            if (commentCountElement) {
              commentCountElement.textContent = `${res[0]?.count ?? 0} 条评论`;
            }
          })
          .catch((error: unknown) => console.warn("评论计数获取失败", error));
      });

      const rest = await fetchPostSlugs();
      const pages = ["/messageboard", "/speaks", "/about", "/links"];
      if (rest.ok) {
        const postSlugs = rest.data ?? [];
        tk.getCommentsCount({
          envId: siteConfigs.twikooEnv,
          // 服务端会归一化尾斜杠，总数也只能对每个页面计数一次。
          urls: [
            ...new Set(postSlugs.map((slug) => `/posts/${slug}`).concat(pages)),
          ],
          includeReply: true,
        })
          .then((res: { count: number }[] | undefined) => {
            if (!Array.isArray(res)) return;
            const webinfoCommentCountElement = document.querySelector(
              ".card-webinfo-item-right.commentcount",
            );
            if (webinfoCommentCountElement) {
              webinfoCommentCountElement.textContent = res
                .map((r) => r.count)
                .reduce((a, b) => a + b, 0)
                .toString();
            }
          })
          .catch((error: unknown) => console.warn("评论总数获取失败", error));
      }
    })().catch((error: unknown) => console.warn("评论计数加载失败", error));
  }, []);

  return null;
}
