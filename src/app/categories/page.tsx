import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css"

import { HomeRightSide } from "@/components/RightSide";
import { siteConfigs } from "@/config";
import { Category } from "@/interfaces/category";
import Link from "next/link";
import PostCategoryBar from "@/components/PostCategoryBar";
export default async function Page(){
  const res=await fetch(`${siteConfigs.backEndUrl}/get/category/categories`,{next:{revalidate:7200,tags:["posts"]}});
  let data:Category[]=[];
  if(res.ok){
    data=(await res.json()).data;
    data.sort((a,b)=>a.name.localeCompare(b.name,"zh-cn"));
  }
  return (
    <div className="page" id="main-container">
      <style>{`#navbar{position:fixed}`}</style>
      <div id="article-container" className="page archives">
        <div id="post-maincontent" className="page archives">
          <h1 style={{marginBottom:20}}><Link href="/categories">分类</Link></h1>
          <PostCategoryBar data={data} type="categories" wrap={true} current=""/>
        </div>
      </div>
      <HomeRightSide/>
    </div>
  );
}