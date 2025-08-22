import "styles/ASide/Archive.css";
import "styles/ASide/global.css";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { ArchiveListItem } from "interfaces/asidelistitem";
import { siteConfigs } from "config";

const monthToHanzi = [
  "",
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];
export default async function ASideList() {
  let items: ArchiveListItem[] = [];
  const res = await fetch(`${siteConfigs.backEndUrl}/get/archive/archives`, {
    next: { revalidate: 7200, tags: ["posts"] },
  });
  if (res.ok) items = (await res.json()).data.slice(0, 8);
  return (
    <div className="card-widget card-aside card-latest-comments">
      <div className="card-headline">
        <Icon icon="fa6-solid:box-archive" />
        <span className="card-title">归档</span>
        <Link className="card-viewmore" title="查看更多" href="/archives">
          <Icon icon="fa6-solid:angle-right" />
        </Link>
      </div>
      <div className="card-body">
        <div className="archives-list">
          {items.map((item: ArchiveListItem, index: number) => {
            return (
              <Link
                className="archives-list-item"
                href={`/archives/${item.year}/${item.month}`}
                key={index}
              >
                <span className="archives-list-item-content-date">{`${monthToHanzi[item.month]} ${item.year}`}</span>
                <span className="archives-list-item-content-count">
                  {item.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
