import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css";

import { HomeRightSide } from "@/components/RightSide";
import { ReactElement } from "react";
import { fetchArchives, fetchPostsByMonth } from "@/utils/api";
import { ArchiveListItem } from "@/interfaces/asidelistitem";
import { Post } from "@/interfaces/post";
import Link from "next/link";
import ArchiveItem from "@/components/Archives";
import CollectionHeader from "@/components/CollectionHeader";
import { siteConfigs } from "@/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `归档 | ${siteConfigs.title}`,
};

export default async function Page() {
  const ArchiveContent: ReactElement[] = [];
  let total = 0;
  const res = await fetchArchives();
  if (res.ok) {
    let Archives = new Map<number, Post[]>();
    const data: ArchiveListItem[] = res.data ?? [];
    await Promise.all(
      data.map(async (item: ArchiveListItem) => {
        const res = await fetchPostsByMonth(item.year, item.month);
        if (res.ok) {
          const posts: Post[] = res.data ?? [];
          Archives.set(item.year, [
            ...(Archives.get(item.year) ?? []),
            ...posts,
          ]);
        }
      }),
    );
    Archives = new Map([...Archives.entries()].sort((a, b) => b[0] - a[0]));
    Archives.forEach((value, key) => {
      Archives.set(
        key,
        value.sort((a, b) => b.publishTime! - a.publishTime!),
      );
    });
    Archives.forEach((value, key) => {
      total += value.length;
      ArchiveContent.push(
        <div key={key} className="archive-year">
          <h2 className="archive-year-title">
            <Link href={`/archives/${key}`}>{key}</Link>
            <span className="archive-year-count">{value.length} 篇</span>
          </h2>
          {value.map((post) => (
            <ArchiveItem key={post.slug} post={post} type="archives" />
          ))}
        </div>,
      );
    });
  }
  return (
    <div className="page" id="main-container">
      <style>{`#navbar{position:fixed}`}</style>
      <div id="article-container" className="page archives">
        <div id="post-maincontent" className="page archives">
          <CollectionHeader
            eyebrow="这里是时间线上的所有文章"
            title="归档"
            extra={
              <span className="collection-stat">
                <b>{total}</b> 篇文章
              </span>
            }
          />
          <div id="archives-container">{ArchiveContent}</div>
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
