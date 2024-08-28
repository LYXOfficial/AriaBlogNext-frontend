import PostHeader from "src/components/PostHeader";
import { Post } from "src/interfaces/post";
import { PageASides } from "src/components/ASides";
import PostContent from "src/components/PostContent";
import { Metadata } from "next";
import { siteInfos } from "public/config"
import FancyBox from "src/components/FancyBox";
import HLJSNum from "src/components/HLJSNum";
import CodeCopier from "src/components/CodeCopier";
import KaTex from "src/components/KaTex";
import fs from "fs";
import MDRender from "src/utils/mdrender";
import TocUpdater from "src/components/TocUpdater";
import Lazyload from "src/components/Lazyload";

var currentPost:Post = {
    title: "你好！！！",
    mdContent: "",
    slug: "my-first-post",
    publishTime: 0,
    lastUpdateTime: 0,
    tags: ["测试","react"],
    category: "hello",
    commentCount: 0,
    bannerImg: "https://npm.elemecdn.com/saiodgm-api@1.0.1/randomimg-my/7.webp",
    wordCount: 1145141,
    viewCount: 0,
};
export const metadata: Metadata = {
    title: currentPost.title+" | "+siteInfos.title,
};
export default async function Page(){
    currentPost.mdContent=await new Promise((resolve)=>{
        fs.readFile(`public/test.md`,(err,data)=>{
            if(err){
                console.log(err);
                resolve("");
            }   
            else{
                resolve(data.toString());
            }
        })
    })
    const htmlContent=await MDRender(currentPost.mdContent);
    return (<>
        <style>{`#navbar{position:fixed}`}</style>
        <PostHeader postInfo={currentPost}/>
        <div id="main-container">
            <PostContent htmlContent={htmlContent}/>
            <PageASides htmlContent={htmlContent}/>
            <FancyBox/>
            <HLJSNum/>
            <CodeCopier/>
            <KaTex/>
            <TocUpdater/>
            <Lazyload/>
        </div>
    </>);
}