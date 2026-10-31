// 页面级 ISR：写操作由后端 Webhook 立即 revalidateTag，600s 只是兜底。
export const revalidate = 600;

import Posts from "components/PostCard";
import { HomeASides } from "components/ASides";
import { HomeRightSide } from "components/RightSide";
import { notFound } from "next/navigation";
import PostPageStart from "@/components/PostPageStart";
import { fetchPostCount } from "@/utils/api";
import { siteConfigs } from "@/config";
import type { Metadata } from "next";

// 非法页码（/page/abc）不给标题，页面自己会走 404
export async function generateMetadata({
  params,
}: {
  params: Promise<{ no: string }>;
}): Promise<Metadata> {
  const { no } = await params;
  const pageNo = Number(no);
  if (!Number.isInteger(pageNo) || pageNo < 1) return {};
  return { title: `第 ${pageNo} 页 | ${siteConfigs.title}` };
}

// 预渲染已有页码；新页码（文章变多后）仍由 dynamicParams 按需生成并缓存。
export async function generateStaticParams() {
  try {
    const res = await fetchPostCount();
    if (!res.ok) return [];
    const maxPage =
      Math.ceil(
        Math.max(res.data - siteConfigs.homeMaxPosts, 0) /
          siteConfigs.pageMaxPosts,
      ) + 1;
    return Array.from({ length: maxPage }, (_, i) => ({ no: String(i + 1) }));
  } catch {
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  try {
    return (
      <div id="main-container">
        <Posts page={parseInt(no)} />
        <PostPageStart />
        <HomeASides />
        <HomeRightSide />
      </div>
    );
  } catch (e) {
    return notFound();
  }
}
