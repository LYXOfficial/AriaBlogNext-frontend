import "styles/ASide/global.css";
import { Icon } from "@iconify/react";
import ASideList from "components/asides/ASideList";
import dayjs from "dayjs";
import { Post } from "interfaces/post";
import { ASideListItem } from "interfaces/asidelistitem";
import { siteConfigs } from "config";
import { fetchNewestPosts } from "utils/api";

export default async function CardNewestPosts() {
  let posts: Post[] = [];
  const resp = await fetchNewestPosts(6);
  if (resp.ok) posts = resp.data ?? [];
  return (
    <div className="card-widget card-aside card-latest-posts">
      <div className="card-headline">
        <Icon icon="solar:history-bold" />
        <span className="card-title">最新文章</span>
      </div>
      <div className="card-body">
        <ASideList
          items={
            posts.map((item: Post) => {
              return {
                title: item.title,
                content: dayjs.unix(item.publishTime!).format("YYYY-MM-DD"),
                pic: item.bannerImg,
                link: "/posts/" + item.slug,
              };
            }) as ASideListItem[]
          }
          falldownImg={siteConfigs.falldownImg}
        />
      </div>
    </div>
  );
}
