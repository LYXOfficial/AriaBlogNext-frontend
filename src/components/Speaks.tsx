"use client";
import { BB } from "interfaces/bb";
import { fetchSpeaks } from "@/utils/api";
import relativeTime from "@/utils/reltime";
import { Icon } from "@iconify/react/dist/iconify.js";
import "styles/BB.css";
import { ReactElement, useEffect, useState } from "react";
import throttle from "lodash/throttle";
import Snackbar from "node-snackbar";
import "node-snackbar/src/sass/snackbar.sass";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

/**
 * 说说正文是后端直接吐的 HTML，里面的图片是裸 <img>（不像文章走 MarkdownImage）。
 * 这里包一层灯箱链接，复用全站 fancybox（点图看大图、手势/键盘/关闭都跟文章一致）。
 * 已经带 data-fancybox 的不动，避免重复包裹。
 */
function withSpeaksLightbox(html: string): string {
  if (!html || html.includes("data-fancybox")) return html;
  return html.replace(
    /<img(\s[^>]*?)src=(["'])(.*?)\2([^>]*?)\/?>/g,
    (whole, before: string, quote: string, src: string, after: string) => {
      // 后台插入的 owo 表情带 .bb-emoji，是跟文字排在一起的行内小图，
      // 套上灯箱后会变成"点一下放大成大图"，和 twikoo 评论区里的表情行为也不一致
      if (
        /class=(["'])[^"']*\bbb-emoji\b[^"']*\1/.test(`${before}${after}`)
      )
        return whole;
      return `<a href="${src}" data-fancybox="speaks" class="bb-img-a" title="点击查看大图"><img${before}src=${quote}${src}${quote}${after}/></a>`;
    },
  );
}

const bbClickHandle = (event: React.MouseEvent) => {
  const str = (
    (event.currentTarget as HTMLElement)!.parentNode!.parentNode!.querySelector(
      ".bb-content",
    ) as HTMLElement
  ).innerText;
  const e = document.getElementsByClassName("tk-textarea__inner")[0],
    t = document.createEvent("HTMLEvents");
  t.initEvent("input", true, true);
  (((e as HTMLInputElement).value = "> " + str + "\n\n"), e.dispatchEvent(t));
  (
    document.getElementsByClassName("tk-textarea__inner")[0] as HTMLInputElement
  ).value = "> " + str + "\n\n";
  document.location.href += "#twikoo";
  (
    document.querySelector(
      ".tk-col>.tk-input>.tk-textarea__inner",
    ) as HTMLInputElement
  ).focus();
  Snackbar.show({
    text: "为保证最佳评论阅读体验，建议不要删除空行",
    pos: "top-center",
    showAction: false,
  });
};

export function Speaks() {
  const [speakCols, setSpeakCols] = useState(1);
  const [speakContent, setSpeakContent] = useState<ReactElement[]>([]);
  useEffect(() => {
    (async () => {
      import("wc-waterfall");
      const res = await fetchSpeaks(40);
      if (res.ok) {
        const speaksContent: BB[] = res.data ?? [];
        setSpeakContent(
          speaksContent.map((item, index) => {
            return (
              <div
                key={`${item.time}-${index}`}
                className="bb-item card-widget"
              >
                <div
                  className="bb-content"
                  dangerouslySetInnerHTML={{ __html: withSpeaksLightbox(item.content) }}
                />
                <div className="bb-bottombar">
                  <span className="bb-time">
                    <Icon icon="solar:clock-circle-bold" />
                    <span className="bb-time-text">
                      {relativeTime(item.time)}
                    </span>
                  </span>
                  <button className="bb-comment-button" onClick={bbClickHandle}>
                    <Icon icon="solar:chat-round-bold" />
                  </button>
                </div>
              </div>
            );
          }),
        );
        const callBack = throttle(() => {
          if (window.innerWidth >= 900) setSpeakCols(3);
          else if (window.innerWidth >= 600) setSpeakCols(2);
          else setSpeakCols(1);
        }, 200);
        callBack();
        window.addEventListener("resize", callBack);
        return () => {
          window.removeEventListener("resize", callBack);
        };
      }
    })();
  }, []);
  // 说说列表是异步灌进来的，灯箱要在图片节点出现后绑定；切走时解绑避免重复
  useEffect(() => {
    if (speakContent.length === 0) return;
    Fancybox.bind('#bb [data-fancybox="speaks"]');
    return () => {
      Fancybox.unbind('#bb [data-fancybox="speaks"]');
    };
  }, [speakContent]);
  return (
    <wc-waterfall id="bb" gap={20} cols={speakCols}>
      {speakContent}
    </wc-waterfall>
  );
}
