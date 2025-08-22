export const revalidate = 3600;

import RSS from "rss";
import { siteConfigs } from "@/config";
import { Post } from "interfaces/post";
import { cache } from "react";

declare const Lute: any;
require("@/utils/lute.min.js");

const lute = Lute.New();

const renderer = (md: string): string => lute.MarkdownStr("", md);
export async function GET() {
  const feed = new RSS({
    title: siteConfigs.title,
    description: "分享Ariaの生活与编码",
    site_url: siteConfigs.siteUrl,
    feed_url: `${siteConfigs.siteUrl}/feed.xml`,
    language: "zh-CN",
    image_url: "https://img.0v0.my/2024/10/28/671f8bf00317e.jpg",
    generator: "AriaBlogNext Next.js",
    copyright: "CC BY-NC-SA 4.0",
  });
  const res = await fetch(
    `${siteConfigs.backEndUrl}/get/post/postsInfo?type=full`,
    { next: { revalidate: 3600, tags: ["posts"] } },
  );
  if (res.ok) {
    const data: Post[] = (await res.json()).data;
    for (const post of data) {
      const renderedHTML = cache(renderer)(post.mdContent!);
      feed.item({
        title: post.title!,
        guid: post.slug,
        url: `${siteConfigs.siteUrl}/posts/${post.slug}`,
        date: new Date(post.publishTime! * 1000),
        enclosure: {
          url: post.bannerImg!,
        },
        description: `${post.description ?? ""}</br><img src="${post.bannerImg}"/><p><strong>RSS 阅读器可能渲染错误。查看原文：<a href="${siteConfigs.siteUrl}/posts/${post.slug}">${siteConfigs.siteUrl}/posts/${post.slug}</a></strong></p>${renderedHTML}`,
      });
    }
  }
  return new Response(feed.xml(), {
    headers: {
      "content-type": "application/xml",
    },
  });
}
