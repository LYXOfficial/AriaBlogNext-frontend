import PostHeader from "components/PostHeader";
import { Post } from "interfaces/post";
import { PageASides } from "components/ASides";
import PostContent from "components/PostContent";
import { siteConfigs } from "config";
import MDRender from "utils/mdrender";
import { RightButtonsPages } from 'components/RightButtons';
import { notFound } from "next/navigation";
import { cache } from "react";

async function getPostInfo(slug:string):Promise<Post>{
    return new Promise((resolve,reject)=>{
        
        fetch(`${siteConfigs.backEndUrl}/get/post/postBySlug?slug=${slug}`)
            .then(async res=>{
                if(!res.ok) reject();
                let data=(await res.json());
                if(data.message=="fail") reject();
                else resolve(data.data);
            });
    });
}
export default async function Page({params}:{params:any}){
    let currentPost:Post;
    try{
        currentPost=await getPostInfo(params.slug);
    }
    catch(e){
        return notFound();
    }
    let htmlContent:string;
    if(currentPost.cachedHtml)
        htmlContent=currentPost.cachedHtml;
    else htmlContent=await MDRender(currentPost.mdContent,currentPost.slug);
    return (<>
        <title>{currentPost.title+" | "+siteConfigs.title}</title>
        <style>{`#navbar{position:fixed}`}</style>
        <PostHeader postInfo={currentPost}/>
        <div id="main-container">
            <PostContent htmlContent={htmlContent} postInfo={currentPost}/>
            <PageASides htmlContent={htmlContent} slug={currentPost.slug!}/>
            <RightButtonsPages/>
        </div>
    </>);
}