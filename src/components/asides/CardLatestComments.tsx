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
  useEffect(() => {
    (async () => {
      const twikoo = require("twikoo");
      const res: TwikooCommentItem[] = await new Promise((resolve, reject) => {
        try {
          twikoo
            .getRecentComments({
              envId: siteConfigs.twikooEnv,
              region: "",
              pageSize: 5,
              includeReply: true,
            })
            .then((res: TwikooCommentItem[]) => {
              resolve(res);
            });
        } catch (e) {
          resolve([{}]);
        }
      });
      setComments(res);
    })();
    return () => {
      setComments([]);
    };
  }, []);
  return (
    <div className="card-widget card-aside card-latest-comments">
      <div className="card-headline">
        <Icon icon="fa6-solid:comment-dots" />
        <span className="card-title">最新评论</span>
      </div>
      <div className="card-body">
        {comments.length == 5 ? (
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
        ) : comments.length ? (
          <center>评论获取失败，请检查相关配置是否正确</center>
        ) : (
          <center>获取中...</center>
        )}
      </div>
    </div>
  );
}
