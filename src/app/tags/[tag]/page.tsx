// 页面级 ISR：写操作由后端 Webhook 立即 revalidateTag，600s 只是兜底。
export const revalidate = 600;

import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css";

import { HomeRightSide } from "@/components/RightSide";
import { ReactElement } from "react";
import { fetchTags, fetchPostsByTag } from "@/utils/api";

export async function generateStaticParams() {
  try {
    const res = await fetchTags();
    if (!res.ok) return [];
    return res.data.map((tag) => ({ tag: tag.name }));
  } catch {
    return [];
  }
}
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
import { siteConfigs } from "@/config";
import type { Metadata } from "next";

// 标题只取路由参数，不用为它再请求一次标签列表；解码方式和页面主体保持一致
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURI(tag);
  return { title: `标签：${decoded} | ${siteConfigs.title}` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURI(tag);
  let ArchiveContent: ReactElement[] = [],
    flag = false;
  const res = await fetchTags();
  let data: Category[] = [];
  if (res.ok) {
    const Archives = new Map<string, Post[]>();
    data = res.data ?? [];
    data.sort((a, b) => a.name.localeCompare(b.name, "zh-cn"));
    await Promise.all(
      data.map(async (item: Category) => {
        if (decodedTag == item.name) {
          const res = await fetchPostsByTag(item.name);
          if (res.ok) {
            const posts: Post[] = res.data ?? [];
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
          <Link className="collection-back" href="/tags">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="m14 6-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>全部标签</span>
          </Link>
          <CollectionHeader
            eyebrow="标签里的文章"
            title={decodedTag}
            extra={
              <span className="collection-stat">
                <b>
                  {data.find((item) => item.name === decodedTag)?.count ?? 0}
                </b>{" "}
                篇文章
              </span>
            }
          />
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
