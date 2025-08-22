import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css";

import { HomeRightSide } from "@/components/RightSide";
import { ReactElement } from "react";
import { siteConfigs } from "@/config";
import { Category } from "@/interfaces/category";
import { Post } from "@/interfaces/post";
import Link from "next/link";
import moment from "moment";
import ImageWithFalldown from "@/components/ImageWithFalldown";
import { Icon } from "@iconify/react";
import { notFound } from "next/navigation";
import PostCategoryBar from "@/components/PostCategoryBar";
import ArchiveItem from "@/components/Archives";
export default async function Page({ params }: { params: { tag: string } }) {
  let ArchiveContent: ReactElement[] = [],
    flag = false;
  const res = await fetch(`${siteConfigs.backEndUrl}/get/tag/tags`, {
    next: { revalidate: 7200, tags: ["posts"] },
  });
  let data: Category[] = [];
  if (res.ok) {
    const Archives = new Map<string, Post[]>();
    data = (await res.json()).data;
    data.sort((a, b) => a.name.localeCompare(b.name, "zh-cn"));
    await Promise.all(
      data.map(async (item: Category) => {
        if (decodeURI(params.tag) == item.name) {
          const res = await fetch(
            `${siteConfigs.backEndUrl}/get/tag/tagInfo?tag=${item.name}`,
            { next: { revalidate: 7200, tags: ["posts"] } },
          );
          if (res.ok) {
            const posts: Post[] = (await res.json()).data;
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
          <h2 className="archive-year-title">
            <Link href={`/tags/${key}`}>{key}</Link>
          </h2>
          {value.map((post) => (
            <ArchiveItem post={post} type="tags" />
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
          <h1 style={{ marginBottom: 20 }}>
            <Link href="/tags">标签</Link>
          </h1>
          <PostCategoryBar
            data={data}
            type="tags"
            current={decodeURI(params.tag)}
            wrap={true}
          />
          <div id="archives-container">{ArchiveContent}</div>
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
