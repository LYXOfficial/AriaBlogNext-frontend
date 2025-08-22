import "styles/Archives.css";
import { siteConfigs } from "@/config";
import { Post } from "@/interfaces/post";
import Link from "next/link";
import moment from "moment";
import ImageWithFalldown from "@/components/ImageWithFalldown";
import { Icon } from "@iconify/react";
export default function ArchiveItem({
  post,
  type,
}: {
  post: Post;
  type: "archives" | "categories" | "tags";
}) {
  return (
    <Link
      key={post.slug}
      href={`/posts/${post.slug}`}
      className="archive-item"
      title={post.title + "\n" + (post.description ?? "")}
    >
      <div className="archive-item-banner">
        <ImageWithFalldown
          className="archive-item-banner-img"
          alt={post.title!}
          falldownImg={siteConfigs.falldownImg}
          src={post.bannerImg!}
        />
      </div>
      <span className="archive-item-title">{post.title}</span>
      <object>
        <Link
          className="archive-item-category"
          href={`/${type == "archives" || type == "tags" ? "categories" : "tags"}/${type == "categories" ? post.tags?.[0] : post.category}`}
          title={type == "categories" ? post.tags?.[0] : post.category}
        >
          <Icon
            icon={`fa6-solid:${type == "categories" ? "tags" : "list-ul"}`}
          />
          {type == "categories" ? post.tags?.[0] : post.category}
        </Link>
      </object>
      <span className="archive-item-date">
        <Icon icon="fa6-solid:calendar-days" />
        {moment.unix(post.publishTime!).format("YYYY-MM-DD")}
      </span>
    </Link>
  );
}
