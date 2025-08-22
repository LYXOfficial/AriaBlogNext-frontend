"use client";
import { BB } from "interfaces/bb";
import { siteConfigs } from "@/config";
import relativeTime from "@/utils/reltime";
import { Icon } from "@iconify/react/dist/iconify.js";
import "styles/BB.css";
import { ReactElement, useEffect, useState } from "react";
import { throttle } from "lodash";
import Snackbar from "node-snackbar";
import "node-snackbar/src/sass/snackbar.sass";

const bbClickHandle = (event: React.MouseEvent) => {
  const str = (
    (event.currentTarget as HTMLElement)!.parentNode!.parentNode!.querySelector(
      ".bb-content",
    ) as HTMLElement
  ).innerText;
  const e = document.getElementsByClassName("el-textarea__inner")[0],
    t = document.createEvent("HTMLEvents");
  t.initEvent("input", true, true);
  (((e as HTMLInputElement).value = "> " + str + "\n\n"), e.dispatchEvent(t));
  (
    document.getElementsByClassName("el-textarea__inner")[0] as HTMLInputElement
  ).value = "> " + str + "\n\n";
  document.location.href += "#twikoo";
  (
    document.querySelector(
      ".tk-col>.tk-input>.el-textarea__inner",
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
      const res = await fetch(
        `${siteConfigs.backEndUrl}/get/speaks/speaks?endl=40`,
        { next: { revalidate: 7200, tags: ["speaks"] } },
      );
      if (res.ok) {
        const speaksContent: BB[] = (await res.json()).data;
        setSpeakContent(
          speaksContent.map((item, index) => {
            return (
              <div key={index} className="bb-item card-widget">
                <div
                  className="bb-content"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
                <div className="bb-bottombar">
                  <span className="bb-time">
                    <Icon icon="fa6-solid:clock" />
                    <span className="bb-time-text">
                      {relativeTime(item.time)}
                    </span>
                  </span>
                  <button className="bb-comment-button" onClick={bbClickHandle}>
                    <Icon icon="fa6-solid:comment" />
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
  return (
    <wc-waterfall id="bb" gap={20} cols={speakCols}>
      {speakContent}
    </wc-waterfall>
  );
}
