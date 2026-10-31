// 页面级 ISR：写操作由后端 Webhook 立即 revalidateTag，600s 只是兜底。
export const revalidate = 600;

import PostHeader from "components/PostHeader";
import { Post } from "interfaces/post";
import { PageASides } from "components/ASides";
import PostContent from "components/PostContent";
import { siteConfigs } from "config";
import { fetchPostDetail, fetchPostSlugs } from "utils/api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostRightSide } from "components/RightSide";
import React from "react";

// 预渲染已有文章；新文章上线后按需生成并缓存（Webhook 会立即失效对应 tag）。
export async function generateStaticParams() {
  try {
    const res = await fetchPostSlugs();
    if (!res.ok) return [];
    return res.data.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

async function getPostInfo(slug: string): Promise<Post> {
  // 不要用 new Promise 里只挂 .then：网络异常时 promise 永远不会 reject，
  // 页面会卡住而不是走 404。
  const res = await fetchPostDetail(slug);
  if (!res.ok) throw new Error(res.message);
  return res.data;
}

// 标题必须走 generateMetadata，不能像以前那样在页面里渲染 <title>：
// 根 layout 的 metadata 已经产出一个 <title>，页面再渲染一个就变成 head 里
// 两个标题，浏览器只认第一个，标签页永远显示站名（2026-11-01 修复）。
// 这里的 fetch 和页面里的那次 URL/缓存参数一致，Next 会自动去重，不会多打一次后端。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostInfo(slug);
    return { title: `${post.title} | ${siteConfigs.title}` };
  } catch {
    // 文章不存在/接口挂了交给页面走 404，标题退回根 layout 的站名
    return {};
  }
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let currentPost: Post;
  try {
    currentPost = await getPostInfo(slug);
  } catch (e) {
    return notFound();
  }
  return (
    <>
      <style>{`#navbar{position:fixed}`}</style>
      <PostHeader postInfo={currentPost} />
      <div id="main-container" className="post">
        <PostContent
          mdContent={currentPost.mdContent!}
          postInfo={currentPost}
        />
        <PageASides postInfo={currentPost!} />
        <PostRightSide />
      </div>
    </>
  );
}
