import RSS from 'rss'
import { siteConfigs } from '@/config'
import { Post } from 'interfaces/post'

export async function GET() {
  const feed = new RSS({
    title: 'Ariasakaの小窝',
    description: '分享Ariaの生活与编码',
    site_url: siteConfigs.siteUrl,
    feed_url: `${siteConfigs.siteUrl}/feed.xml`,
    language: 'zh-CN',
    image_url: 'https://bu.dusays.com/2023/01/31/63d8e6e23ada6.webp',
    generator: 'AriaBlogNext Next.js',
  })
  const res=await fetch(`${siteConfigs.backEndUrl}/get/post/postsInfo`);
  if(res.ok){
    const data:Post[]=(await res.json()).data;
    data.forEach((post) => {
      feed.item({
        title: post.title!,
        guid: post.slug,
        url: `${siteConfigs.siteUrl}/posts/${post.slug}`,
        description: post.description?post.description:post.plainContent!,
        date: new Date(post.publishTime!),
        enclosure: {
          url: post.bannerImg!,
        }
      })
    })
}
  return new Response(feed.xml(), {
    headers: {
      'content-type': 'application/xml'
    }
  })
}