import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css";

import { HomeRightSide } from "@/components/RightSide";
import { ReactElement } from "react";
import { siteConfigs } from "@/config";
import { ArchiveListItem } from "@/interfaces/asidelistitem";
import { Post } from "@/interfaces/post";
import Link from "next/link";
import ArchiveItem from "@/components/Archives";
export default async function Page() {
  const ArchiveContent: ReactElement[] = [];
  const res = await fetch(`${siteConfigs.backEndUrl}/get/archive/archives`, {
    next: { revalidate: 7200, tags: ["posts"] },
  });
  if (res.ok) {
    let Archives = new Map<number, Post[]>();
    const data: ArchiveListItem[] = (await res.json()).data;
    await Promise.all(
      data.map(async (item: ArchiveListItem) => {
        const res = await fetch(
          `${siteConfigs.backEndUrl}/get/archive/archiveInfo?year=${item.year}&month=${item.month}`,
          { next: { revalidate: 7200, tags: ["posts"] } },
        );
        if (res.ok) {
          const posts: Post[] = (await res.json()).data;
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
      ArchiveContent.push(
        <div key={key} className="archive-year">
          <h2 className="archive-year-title">
            <Link href={`/archives/${key}`}>{key}</Link>
          </h2>
          {value.map((post) => (
            <ArchiveItem post={post} type="archives" />
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
          <h1>
            <Link href="/archives">归档</Link>
          </h1>
          <div id="archives-container">{ArchiveContent}</div>
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
