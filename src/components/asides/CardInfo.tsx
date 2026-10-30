import Link from "next/link";
import "styles/ASide/global.css";
import "styles/ASide/Info.css";
import { Social } from "interfaces/siteconfig";
import { siteConfigs } from "config";
import { fetchPostCount, fetchTagCount, fetchCategoryCount } from "utils/api";

export default async function CardInfo() {
  let postCount: number = 0,
    tagCount: number = 0,
    categoryCount: number = 0;
  // 三个 count 互不依赖，并发发出；串行会让侧栏多等 2 个 Atlas 往返
  const [resp, rest, resc] = await Promise.all([
    fetchPostCount(),
    fetchTagCount(),
    fetchCategoryCount(),
  ]);
  if (resp.ok) postCount = resp.data;
  if (rest.ok) tagCount = rest.data;
  if (resc.ok) categoryCount = resc.data;
  return (
    <div className="card-widget card-aside card-info">
      <div className="card-info-avatar">
        <img
          alt="avatar"
          src={siteConfigs.avatar}
          className="card-info-avatar-img"
        />
      </div>
      <span className="card-info-name">{siteConfigs.author}</span>
      <div className="card-info-datas">
        <Link className="card-info-data" href="/archives">
          <span className="card-info-data-title">文章</span>
          <span className="card-info-data-count">{postCount}</span>
        </Link>
        <Link className="card-info-data" href="/tags">
          <span className="card-info-data-title">标签</span>
          <span className="card-info-data-count">{tagCount}</span>
        </Link>
        <Link className="card-info-data" href="/categories">
          <span className="card-info-data-title">分类</span>
          <span className="card-info-data-count">{categoryCount}</span>
        </Link>
      </div>
      <div className="card-info-socials">
        {siteConfigs.socials.map((link: Social) => {
          return (
            <a
              key={link.name}
              className="card-info-Social"
              href={link.url}
              title={link.name}
            >
              {link.icon}
            </a>
          );
        })}
      </div>
    </div>
  );
}
