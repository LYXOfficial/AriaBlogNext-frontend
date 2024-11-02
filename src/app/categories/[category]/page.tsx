import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css"

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
export default async function Page({params}:{params:{category:string}}){
  let ArchiveContent:ReactElement[]=[],flag=false;
  const res=await fetch(`${siteConfigs.backEndUrl}/get/category/categories`,{next:{revalidate:7200,tags:["posts"]}});
  let data:Category[]=[];
  if(res.ok){
    let Archives=new Map<number,Post[]>();
    data=(await res.json()).data;
    data.sort((a,b)=>a.name.localeCompare(b.name,"zh-cn"));
    await Promise.all(data.map(async (item:Category)=>{
      if(decodeURI(params.category)==item.name){
        const res=await fetch(`${siteConfigs.backEndUrl}/get/category/categoryInfo?category=${item.name}`,{next:{revalidate:7200,tags:["posts"]}});
        if(res.ok){
          const posts:Post[]=(await res.json()).data;
          Archives.set(item.name,[...Archives.get(item.name)??[],...posts]);
          flag=true;
        }
      }
    }));
    Archives.forEach((value,key)=>{
      Archives.set(key,value.sort((a,b)=>b.publishTime!-a.publishTime!));
    });
    if(!flag){
      return notFound();
    }
    Archives.forEach((value,key)=>{
      ArchiveContent.push(
        <div key={key} className="archive-year">
          <h2 className="archive-year-title"><Link href={`/categories/${key}`}>{key}</Link></h2>
          {
            value.map(post=>{
              return (
                <Link key={post.slug} href={`/posts/${post.slug}`} className="archive-item">
                  <div className="archive-item-banner">
                    <ImageWithFalldown className="archive-item-banner-img" alt={post.title!} falldownImg={siteConfigs.falldownImg} src={post.bannerImg!}/>
                  </div>
                  <span className="archive-item-title">{post.title}</span>
                  <object>
                    <Link className="archive-item-category" href={`/tags/${post.tags[0]}`}><Icon icon="fa6-solid:tags"/>{post.tags[0]}</Link>
                  </object>
                  <span className="archive-item-date"><Icon icon="fa6-solid:calendar-days"/>{moment.unix(post.publishTime!).format('YYYY-MM-DD')}</span>
                </Link>
              );
            })
          }
        </div>
      );
    })
  }
  return (
    <div className="page" id="main-container">
      <style>{`#navbar{position:fixed}`}</style>
      <div id="article-container" className="page archives">
        <div id="post-maincontent" className="page archives">
          <h1 style={{marginBottom:20}}><Link href="/categories">分类</Link></h1>
          <PostCategoryBar data={data} type="categories" current={decodeURI(params.category)} wrap={true}/>
          <div id="archives-container">
            {ArchiveContent}
          </div>
        </div>
      </div>
      <HomeRightSide/>
    </div>
  );
}