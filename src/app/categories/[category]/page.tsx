// 页面级 ISR：写操作由后端 Webhook 立即 revalidateTag，600s 只是兜底。
export const revalidate = 600;

import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css";

import { HomeRightSide } from "@/components/RightSide";
import { ReactElement } from "react";
import { fetchCategories, fetchPostsByCategory } from "@/utils/api";

export async function generateStaticParams() {
  try {
    const res = await fetchCategories();
    if (!res.ok) return [];
    return res.data.map((c) => ({ category: c.name }));
  } catch {
    return [];
  }
}
import { Category } from "@/interfaces/category";
import { Post } from "@/interfaces/post";
import Link from "next/link";
import { notFound } from "next/navigation";
import CollectionHeader from "@/components/CollectionHeader";
import TagIndex from "@/components/TagIndex";
import CollectionSwitcher from "@/components/CollectionSwitcher";
import ArchiveItem from "@/components/Archives";
import { siteConfigs } from "@/config";
import type { Metadata } from "next";

// 标题只取路由参数，不用为它再请求一次分类列表；解码方式和页面主体保持一致
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURI(category);
  return { title: `分类：${decoded} | ${siteConfigs.title}` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decodedCategory = decodeURI(category);
  let ArchiveContent: ReactElement[] = [],
    flag = false;
  const res = await fetchCategories();
  let data: Category[] = [];
  if (res.ok) {
    const Archives = new Map<string, Post[]>();
    data = res.data ?? [];
    data.sort((a, b) => a.name.localeCompare(b.name, "zh-cn"));
    await Promise.all(
      data.map(async (item: Category) => {
        if (decodedCategory == item.name) {
          const res = await fetchPostsByCategory(item.name);
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
            <ArchiveItem key={post.slug} post={post} type="categories" />
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
          <Link className="collection-back" href="/categories">
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
            <span>全部分类</span>
          </Link>
          <CollectionHeader
            eyebrow="分类里的文章"
            title={decodedCategory}
            extra={
              <span className="collection-stat">
                <b>
                  {data.find((item) => item.name === decodedCategory)?.count ??
                    0}
                </b>{" "}
                篇文章
              </span>
            }
          />
          <CollectionSwitcher label="切换分类">
            <TagIndex tags={data} type="categories" current={decodedCategory} />
          </CollectionSwitcher>
          <div id="archives-container">{ArchiveContent}</div>
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
