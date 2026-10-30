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
    return res.data.map((b) => ({ year: String(b.year), month: String(b.month) }));
  } catch {
    return [];
  }
}
import { ArchiveListItem } from "@/interfaces/asidelistitem";
import { Post } from "@/interfaces/post";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArchiveItem from "@/components/Archives";
export default async function Page({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const yearNum = Number(year);
  const monthNum = Number(month);
  const ArchiveContent: ReactElement[] = [];
  const res = await fetchArchives();
  if (res.ok) {
    let Archives = new Map<number, Post[]>();
    const data: ArchiveListItem[] = res.data ?? [];
    let flag = false;
    await Promise.all(
      data.map(async (item: ArchiveListItem) => {
        if (item.year === yearNum && item.month === monthNum) {
          const res = await fetchPostsByMonth(item.year, item.month);
          if (res.ok) {
            const posts: Post[] = res.data ?? [];
            Archives.set(item.year, [
              ...(Archives.get(item.year) ?? []),
              ...posts,
            ]);
            flag = true;
          }
        }
      }),
    );
    if (!flag) {
      return notFound();
    }
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
            <Link href={`/archives/${key}`}>{key}</Link> -{" "}
            <Link href={`/archives/${key}/${month}`}>{month}</Link>
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
          <div id="archives-container">{ArchiveContent}</div>
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
