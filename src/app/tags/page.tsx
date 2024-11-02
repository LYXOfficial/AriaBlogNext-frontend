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
export default async function Page(){
  let ArchiveContent:ReactElement[]=[],flag=false;
  const res=await fetch(`${siteConfigs.backEndUrl}/get/tag/tags`,{next:{revalidate:7200,tags:["posts"]}});
  let data:Category[]=[];
  if(res.ok){
    let Archives=new Map<number,Post[]>();
    data=(await res.json()).data;
    data.sort((a,b)=>a.name.localeCompare(b.name,"zh-cn"));
  }
  return (
    <div className="page" id="main-container">
      <style>{`#navbar{position:fixed}`}</style>
      <div id="article-container" className="page archives">
        <div id="post-maincontent" className="page archives">
          <h1 style={{marginBottom:20}}><Link href="/tags">标签</Link></h1>
          <PostCategoryBar data={data} type="tags" wrap={true}/>
        </div>
      </div>
      <HomeRightSide/>
    </div>
  );
}