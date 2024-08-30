import PostHeader from "src/components/PostHeader";
import { Post } from "src/interfaces/post";
import { PageASides } from "src/components/ASides";
import PostContent from "src/components/PostContent";
import { siteConfigs } from "public/config"
import MDRender from "src/utils/mdrender";
import { RightButtonsPages } from 'src/components/RightButtons';
import { notFound } from "next/navigation";
import { cache } from "react";

const cleanMarkdown=cache((text:string)=>{
    // 移除Markdown语法中的符号
    const cleanedText = text
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // 粗体 **text** 或 __text__
        .replace(/(\*|_)(.*?)\1/g, '$2')    // 斜体 *text* 或 _text_
        .replace(/(~~)(.*?)\1/g, '$2')      // 删除线 ~~text~~
        .replace(/`{1,2}(.*?)`{1,2}/g, '$1') // 行内代码 `code`
        .replace(/```[\s\S]*?```/g, '')     // 代码块 ```code```
        .replace(/!\[.*?\]\(.*?\)/g, '')    // 图片 ![alt](url)
        .replace(/\[.*?\]\(.*?\)/g, '$1')   // 链接 [text](url)
        .replace(/^\s{0,3}>\s?/gm, '')      // 引用 >
        .replace(/^\s{0,3}[-*+]\s/gm, '')   // 无序列表 - * +
        .replace(/^\s{0,3}\d+\.\s/gm, '')   // 有序列表 1. 2. 3.
        .replace(/^#{1,6}\s?/gm, '')        // 标题 # ## ### 等
        .replace(/^\s*\|.*?\|\s*$/gm, '')   // 表格 | col1 | col2 |
        .replace(/^-{3,}$/gm, '')           // 分隔线 ---
        .replace(/\n{2,}/g, '\n');          // 多余的换行

    // 去除文本开头和结尾的多余换行
    return cleanedText.trim();
});

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
    const htmlContent=await MDRender(currentPost.mdContent);
    return (<>
        <title>{currentPost.title+" | "+siteConfigs.title}</title>
        <style>{`#navbar{position:fixed}`}</style>
        <PostHeader postInfo={currentPost}/>
        <div id="main-container">
            <PostContent htmlContent={htmlContent} postInfo={currentPost}/>
            <PageASides htmlContent={htmlContent}/>
            <RightButtonsPages/>
        </div>
    </>);
}