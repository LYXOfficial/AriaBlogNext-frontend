import CardInfo from "src/components/asides/CardInfo";
import CardAnnouncement from "src/components/asides/CardAnnouncement";
import CardLatestComments from "src/components/asides/CardLatestComments";
import CardArchives from "src/components/asides/CardArchives";
import CardWebInfo from "src/components/asides/CardWebInfo";
import CardNewestPosts from "src/components/asides/CardNewestPosts";
import CardToc from "src/components/asides/CardToc";

import { siteConfigs } from "public/config"

import { Post } from "src/interfaces/post"


export function HomeASides() {
    return (
        <div id="aside-container">
            <CardInfo/>
            <CardAnnouncement content={<>欢迎光临AriaのNext.js新博客QwQ~</>}/>
            <div className="aside-sticky-container">
                <CardLatestComments/>
                <CardArchives/>
                <CardWebInfo/>
            </div>
        </div>
    );
}
export async function PageASides({htmlContent}:{htmlContent:string}) {
    let posts:Post[]=[];
    let resp=await fetch(`${siteConfigs.backEndUrl}/get/post/postsInfo?startl=${0}&endl=${6}`);
    if(resp.ok) posts=(await resp.json()).data;
    return (
        <div id="aside-container">
            <CardInfo/>
            <CardAnnouncement content={<>欢迎光临AriaのNext.js新博客QwQ~</>}/>
            <div className="aside-sticky-container">
                <CardToc htmlContent={htmlContent}/>
                <CardNewestPosts posts={posts}/>
            </div>
        </div>
    );
}