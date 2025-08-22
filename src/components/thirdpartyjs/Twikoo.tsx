"use client";
import { useEffect, useState } from "react";
import "twikoo/dist/twikoo.css";
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

    const tk = require("twikoo/dist/twikoo.min");
    try {
      tk.init({
        envId: siteConfigs.twikooEnv,
        el: "#post-comment",
      });
      owoBig();
    } catch (e) {
      setTkloadState("加载失败，请检查配置");
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
    const tk = require("twikoo/dist/twikoo.min");
    tk.getCommentsCount({
      envId: siteConfigs.twikooEnv,
      urls: [document.location.pathname, document.location.pathname + "/"],
      includeReply: true,
    }).then((res: { count: number }[]) => {
      const commentCountElement = document.querySelector(
        ".post-commentcount>.post-meta-content",
      );
      if (commentCountElement) {
        commentCountElement.textContent = `${res[0].count + res[1].count} 条评论`;
      }
    });
  }, []);

  return null;
}

export function TwikooCountHome() {
  useEffect(() => {
    (async () => {
      const tk = require("twikoo/dist/twikoo.min");
      document.querySelectorAll(".post-info").forEach((el) => {
        const postTitle = el.querySelector(".post-title") as HTMLAnchorElement;
        const hr = "/" + postTitle.href.split("/").slice(3).join("/");
        tk.getCommentsCount({
          envId: siteConfigs.twikooEnv,
          urls: [hr, hr + "/"],
          includeReply: true,
        }).then((res: { count: number }[]) => {
          const commentCountElement = el.querySelector(
            ".post-commentcount>.post-meta-content",
          );
          if (commentCountElement) {
            commentCountElement.textContent = `${res[0].count + res[1].count} 条评论`;
          }
        });
      });

      const rest = await fetch(`${siteConfigs.backEndUrl}/get/post/postSlugs`, {
        next: { tags: ["posts"] },
      });
      const pages = [
        "/messageboard",
        "/messageboard/",
        "/speaks",
        "/speaks/",
        "/about",
        "/about/",
        "/links",
        "/links/",
      ];
      if (rest.ok) {
        const postSlugs = (await rest.json()).data as string[];
        tk.getCommentsCount({
          envId: siteConfigs.twikooEnv,
          urls: postSlugs
            .map((slug) => `/posts/${slug}`)
            .concat(postSlugs.map((slug) => `/posts/${slug}/`))
            .concat(pages),
          includeReply: true,
        }).then((res: { count: number }[]) => {
          const webinfoCommentCountElement = document.querySelector(
            ".card-webinfo-item-right.commentcount",
          );
          if (webinfoCommentCountElement) {
            webinfoCommentCountElement.textContent = res
              .map((r) => r.count)
              .reduce((a, b) => a + b)
              .toString();
          }
        });
      }
    })();
  }, []);

  return null;
}
