"use client";
import "styles/ASide/global.css";
import { Icon } from "@iconify/react";
import ASideList from "components/asides/ASideList";
import { TwikooCommentItem, ASideListItem } from "interfaces/asidelistitem";
import { siteConfigs } from "config";
import relativeTime from "@/utils/reltime";
import { useEffect, useState } from "react";

export default function CardLatestComments() {
  const [comments, setComments] = useState<TwikooCommentItem[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const twikoo = require("twikoo");
        // 网络失败会异步拒绝，不能用只处理 then 的 Promise 包装，否则一直停在加载中。
        const res = await twikoo.getRecentComments({
          envId: siteConfigs.twikooEnv,
          region: "",
          pageSize: 5,
          includeReply: true,
        });
        if (!Array.isArray(res)) throw new Error("评论数据格式异常");
        if (!cancelled) {
          setComments(res);
          setStatus("success");
        }
      } catch (error) {
        console.warn("最新评论获取失败", error);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div className="card-widget card-aside card-latest-comments">
      <div className="card-headline">
        <Icon icon="fa6-solid:comment-dots" />
        <span className="card-title">最新评论</span>
      </div>
      <div className="card-body">
        {status === "loading" ? (
          <center>获取中...</center>
        ) : status === "error" ? (
          <center>评论暂时获取失败，可以刷新页面或稍后再试</center>
        ) : comments.length ? (
          <ASideList
            items={
              comments.map((item: TwikooCommentItem | undefined) => {
                return {
                  title: item!.commentText!.replace("\n", " "),
                  // 不用 twikoo 2.x 的 relativeTime：它由客户端 i18n 生成，
                  // 而这个卡片所在的页面不会调用 init，语言会停在默认的 en。
                  // 这里用站点自己的中文相对时间工具（与 Speaks 保持一致）。
                  content: `${item!.nick} / ${
                    item!.created ? relativeTime(Math.floor(item!.created / 1000)) : ""
                  }`,
                  pic: item!.avatar,
                  link: (item!.url as string) + "#" + item!.id,
                };
              }) as ASideListItem[]
            }
            falldownImg={siteConfigs.falldownAvatar}
          />
        ) : (
          <center>还没有评论，来留下第一条吧</center>
        )}
      </div>
    </div>
  );
}
