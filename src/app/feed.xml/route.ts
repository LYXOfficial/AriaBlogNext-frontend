export const revalidate=3600;

import RSS from 'rss'
import { siteConfigs } from '@/config'
import { Post } from 'interfaces/post'

export async function GET() {
  const feed = new RSS({
    title: siteConfigs.title,
    description: '分享Ariaの生活与编码',
    site_url: siteConfigs.siteUrl,
    feed_url: `${siteConfigs.siteUrl}/feed.xml`,
    language: 'zh-CN',
    image_url: 'https://bu.dusays.com/2024/10/28/671f8bf00317e.jpg',
    generator: 'AriaBlogNext Next.js',
    copyright: 'CC BY-NC-SA 4.0',
  })
  const res=await fetch(`${siteConfigs.backEndUrl}/get/post/postsInfo`,{next:{revalidate:7200,tags:["posts"]}});
  if(res.ok){
    const data:Post[]=(await res.json()).data;
    data.forEach((post) => {
      feed.item({
        title: post.title!,
        guid: post.slug,
        url: `${siteConfigs.siteUrl}/posts/${post.slug}`,
        // description: post.description?post.description:post.plainContent!,
        date: new Date(post.publishTime!*1000),
        enclosure: {
          url: post.bannerImg!,
        },
        description: `<p><strong>RSS 阅读器可能渲染错误。查看原文：<a href="${siteConfigs.siteUrl}/posts/${post.slug}">${siteConfigs.siteUrl}/posts/${post.slug}</a></strong></p>`+post.cachedHtml!,
      })
    })
}
  return new Response(feed.xml(), {
    headers: {
      'content-type': 'application/xml'
    }
  })
}