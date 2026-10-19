import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css";

import { HomeRightSide } from "@/components/RightSide";
import { ReactElement } from "react";
import { siteConfigs } from "@/config";
import { Category } from "@/interfaces/category";
import { Post } from "@/interfaces/post";
import Link from "next/link";
import dayjs from "dayjs";
import ImageWithFalldown from "@/components/ImageWithFalldown";
import { Icon } from "@iconify/react";
import { notFound } from "next/navigation";
import CollectionHeader from "@/components/CollectionHeader";
import TagIndex from "@/components/TagIndex";
import CollectionSwitcher from "@/components/CollectionSwitcher";
import ArchiveItem from "@/components/Archives";
export default async function Page({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decodedTag = decodeURI(tag);
  let ArchiveContent: ReactElement[] = [],
    flag = false;
  const res = await fetch(`${siteConfigs.backEndUrl}/get/tag/tags`, {
    next: { revalidate: 7200, tags: ["posts"] },
  });
  let data: Category[] = [];
  if (res.ok) {
    const Archives = new Map<string, Post[]>();
    data = (await res.json()).data ?? [];
    data.sort((a, b) => a.name.localeCompare(b.name, "zh-cn"));
    await Promise.all(
      data.map(async (item: Category) => {
        if (decodedTag == item.name) {
          const res = await fetch(
            `${siteConfigs.backEndUrl}/get/tag/tagInfo?tag=${item.name}`,
            { next: { revalidate: 7200, tags: ["posts"] } },
          );
          if (res.ok) {
            const posts: Post[] = (await res.json()).data ?? [];
            Archives.set(item.name, [
              ...(Archives.get(item.name) ?? []),
              ...posts,
            ]);
            flag = true;
          }
        }
      }),
    );
    Archives.forEach((value, key) => {
      Archives.set(
        key,
        value.sort((a, b) => b.publishTime! - a.publishTime!),
      );
    });
    if (!flag) {
      return notFound();
    }
    Archives.forEach((value, key) => {
      ArchiveContent.push(
        <div key={key} className="archive-year">
          {value.map((post) => (
            <ArchiveItem key={post.slug} post={post} type="tags" />
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
          <Link className="collection-back" href="/tags"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="m14 6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg><span>全部标签</span></Link>
          <CollectionHeader eyebrow="标签里的文章" title={decodedTag} extra={<span className="collection-stat"><b>{data.find(item => item.name === decodedTag)?.count ?? 0}</b> 篇文章</span>} />
          <CollectionSwitcher label="切换标签">
            <TagIndex tags={data} type="tags" current={decodedTag} />
          </CollectionSwitcher>
          <div id="archives-container">{ArchiveContent}</div>
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
