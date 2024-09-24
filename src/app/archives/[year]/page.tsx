export const revalidate=7200;

import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css"

import { HomeRightSide } from "@/components/RightSide";
import { ReactElement } from "react";
import { siteConfigs } from "@/config";
import { ArchiveListItem } from "@/interfaces/asidelistitem";
import { Post } from "@/interfaces/post";
import Link from "next/link";
import moment from "moment";
import ImageWithFalldown from "@/components/ImageWithFalldown";
import { Icon } from "@iconify/react"
import { notFound } from "next/navigation";
export default async function Page({params}:{params:{year:string}}){
  let ArchiveContent:ReactElement[]=[];
  const res=await fetch(`${siteConfigs.backEndUrl}/get/archive/archives`,{next:{tags:["posts"]}});
  if(res.ok){
    let Archives=new Map<number,Post[]>();
    const data:ArchiveListItem[]=(await res.json()).data;
    let cnt=0;
    await Promise.all(data.map(async (item:ArchiveListItem)=>{
      if(item.year===Number(params.year)){
        const res=await fetch(`${siteConfigs.backEndUrl}/get/archive/archiveInfo?year=${item.year}&month=${item.month}`,{next:{tags:["posts"]}});
        if(res.ok){
          const posts:Post[]=(await res.json()).data;
          Archives.set(item.year,[...Archives.get(item.year)??[],...posts]);
        }
        cnt++;
      }
    }));
    if(cnt===0){
      return notFound();
    }
    Archives.forEach((value,key)=>{
      Archives.set(key,value.sort((a,b)=>b.publishTime!-a.publishTime!));
    });
    Archives.forEach((value,key)=>{
      ArchiveContent.push(
        <div key={key} className="archive-year">
          <h2 className="archive-year-title">{key}</h2>
          {
            value.map(post=>{
              return (
                <Link key={post.slug} href={`/posts/${post.slug}`} className="archive-item">
                  <div className="archive-item-banner">
                    <ImageWithFalldown className="archive-item-banner-img" alt={post.title!} falldownImg={siteConfigs.falldownImg} src={post.bannerImg!}/>
                  </div>
                  <span className="archive-item-title">{post.title}</span>
                  <object>
                    <Link className="archive-item-category" href={`/categories/${post.category}`}><Icon icon="fa6-solid:tag"/>{post.category}</Link>
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
          <h1>归档</h1>
          <div id="archives-container">
            {ArchiveContent}
          </div>
        </div>
      </div>
      <HomeRightSide/>
    </div>
  );
}