"use client";
import { useEffect, useState } from "react";
// twikoo 2.x ships its stylesheet inlined in the bundle (and no longer exposes
// "twikoo/dist/twikoo.css" through its package "exports" map), so the separate
// CSS import is no longer needed.
import "styles/Twikoo.css";
import { siteConfigs } from "config";
import { Icon } from "@iconify/react";
import "styles/owoBig.css";

export function TwikooBaseComment() {
  const [tkloadState, setTkloadState] = useState<string>("加载中...");

  useEffect(() => {
    function owoBig() {
      let flag = 1,
        owo_time: NodeJS.Timeout | null = null,
        m = 3;
      const div = document.createElement("div"),
        body = document.querySelector("body") as HTMLElement;
      div.id = "owo-big";
      body.appendChild(div);

      const observer = new MutationObserver((mutations) => {
        for (let i = 0; i < mutations.length; i++) {
          let dom = mutations[i].addedNodes,
            owo_body: HTMLElement | null = null;
          if (
            dom.length == 2 &&
            (dom[1] as HTMLElement).className == "OwO-body"
          )
            owo_body = dom[1] as HTMLElement;
          else if (
            dom.length == 1 &&
            (dom[0] as HTMLElement).className == "tk-comment"
          )
            owo_body = dom[0] as HTMLElement;
          else continue;

          if (document.body.clientWidth <= 768)
            owo_body.addEventListener("contextmenu", (e) => e.preventDefault());

          owo_body.onmouseover = (e: MouseEvent) => {
            const target = e.target as HTMLImageElement;
            if (flag && target.tagName === "IMG") {
              flag = 0;
              owo_time = setTimeout(() => {
                let height = target.clientHeight * m,
                  width = target.clientWidth * m,
                  left = e.x - e.offsetX - (width - target.clientWidth) / 2,
                  top = e.y - e.offsetY;

                if (left + width > body.clientWidth)
                  left -= left + width - body.clientWidth + 10;
                if (left < 0) left = 10;

                div.style.cssText = `display:flex; height:${height}px; width:${width}px; left:${left}px; top:${top}px;`;
                div.innerHTML = `<img src="${target.src}">`;
              }, 300);
            }
          };

          owo_body.onmouseout = () => {
            div.style.display = "none";
            flag = 1;
            if (owo_time) clearTimeout(owo_time);
          };
        }
      });

      const twikooElement = document.getElementById("twikoo");
      if (twikooElement) {
        observer.observe(twikooElement, { subtree: true, childList: true });
      }
    }

    const tk = require("twikoo");
    try {
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
      owoBig();
    } catch (e) {
      setTkloadState("评论暂时加载失败，可以刷新页面或稍后再试");
    }

    return () => {
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
        <Icon icon="fa6-solid:comments" />
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
    }).then((res: { count: number }[] | undefined) => {
      if (!Array.isArray(res)) return;
      const commentCountElement = document.querySelector(
        ".post-commentcount>.post-meta-content",
      );
      if (commentCountElement) {
        commentCountElement.textContent = `${res[0]?.count ?? 0} 条评论`;
      }
    }).catch((error: unknown) => console.warn("评论计数获取失败", error));
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
        }).then((res: { count: number }[] | undefined) => {
          if (!Array.isArray(res)) return;
          const commentCountElement = el.querySelector(
            ".post-commentcount>.post-meta-content",
          );
          if (commentCountElement) {
            commentCountElement.textContent = `${res[0]?.count ?? 0} 条评论`;
          }
        }).catch((error: unknown) => console.warn("评论计数获取失败", error));
      });

      const rest = await fetch(`${siteConfigs.backEndUrl}/get/post/postSlugs`, {
        next: { tags: ["posts"] },
      });
      const pages = [
        "/messageboard",
        "/speaks",
        "/about",
        "/links",
      ];
      if (rest.ok) {
        const postSlugs = (await rest.json()).data as string[];
        tk.getCommentsCount({
          envId: siteConfigs.twikooEnv,
          // 服务端会归一化尾斜杠，总数也只能对每个页面计数一次。
          urls: [...new Set(postSlugs.map((slug) => `/posts/${slug}`).concat(pages))],
          includeReply: true,
        }).then((res: { count: number }[] | undefined) => {
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
        }).catch((error: unknown) => console.warn("评论总数获取失败", error));
      }
    })().catch((error: unknown) => console.warn("评论计数加载失败", error));
  }, []);

  return null;
}
