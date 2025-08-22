"use client";
import "styles/ASide/global.css";
import { Icon } from "@iconify/react";
import ASideList from "components/asides/ASideList";
import { TwikooCommentItem, ASideListItem } from "interfaces/asidelistitem";
import { siteConfigs } from "config";
import { useEffect, useState } from "react";

export default function CardLatestComments() {
  const [comments, setComments] = useState<TwikooCommentItem[]>([]);
  useEffect(() => {
    (async () => {
      const twikoo = require("twikoo/dist/twikoo.min");
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
                  content: `${item!.nick} / ${item!.relativeTime}`,
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
