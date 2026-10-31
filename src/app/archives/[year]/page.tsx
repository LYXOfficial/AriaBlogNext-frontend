// 页面级 ISR：写操作由后端 Webhook 立即 revalidateTag，600s 只是兜底。
export const revalidate = 600;

import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css";

import { HomeRightSide } from "@/components/RightSide";
import { ReactElement } from "react";
import { fetchArchives, fetchPostsByMonth } from "@/utils/api";

export async function generateStaticParams() {
  try {
    const res = await fetchArchives();
    if (!res.ok) return [];
    return [...new Set(res.data.map((b) => b.year))].map((year) => ({
      year: String(year),
    }));
  } catch {
    return [];
  }
}
import { ArchiveListItem } from "@/interfaces/asidelistitem";
import { Post } from "@/interfaces/post";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArchiveItem from "@/components/Archives";
import { siteConfigs } from "@/config";
import type { Metadata } from "next";

// 非法年份（/archives/abc）不给标题，页面自己会走 404
export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const yearNum = Number(year);
  if (!Number.isInteger(yearNum)) return {};
  return { title: `归档：${yearNum} 年 | ${siteConfigs.title}` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const yearNum = Number(year);
  const ArchiveContent: ReactElement[] = [];
  const months: ArchiveListItem[] = [];
  const res = await fetchArchives();
  if (res.ok) {
    let Archives = new Map<number, Post[]>();
    const data: ArchiveListItem[] = [];
    (res.data ?? []).forEach((item: ArchiveListItem) => {
      if (item.year !== yearNum) return;
      data.push(item);
      months.push(item);
    });
    let cnt = 0;
    await Promise.all(
      data.map(async (item: ArchiveListItem) => {
        if (item.year === yearNum) {
          const res = await fetchPostsByMonth(item.year, item.month);
          if (res.ok) {
            const posts: Post[] = res.data ?? [];
            Archives.set(item.year, [
              ...(Archives.get(item.year) ?? []),
              ...posts,
            ]);
            cnt++;
          }
        }
      }),
    );
    if (cnt === 0) {
      return notFound();
    }
    // 月份入口按月份倒序，最新的月份排前面
    months.sort((a, b) => b.month - a.month);
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
          <h1>
            <Link href="/archives">归档</Link>
          </h1>
          <div className="archive-months">
            {months.map((item) => (
              <Link
                className="archive-month"
                key={item.month}
                href={`/archives/${yearNum}/${item.month}`}
              >
                {item.month} 月
                <span className="archive-month-count">{item.count} 篇</span>
              </Link>
            ))}
          </div>
          <div id="archives-container">{ArchiveContent}</div>
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
