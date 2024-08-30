import "src/styles/ASide/global.css"
import { Icon } from '@iconify/react';
import ASideList from "src/components/asides/ASideList";
import moment from "moment";
import { Post } from "src/interfaces/post";
import { aSideListItem } from "src/interfaces/asidelistitem";
import { siteConfigs } from "public/config"

export default async function CardNewestPosts(){
    let posts:Post[]=[];
    let resp=await fetch(`${siteConfigs.backEndUrl}/get/post/postsInfo?startl=${0}&endl=${6}`);
    if(resp.ok) posts=(await resp.json()).data;
    return (
        <div className="card-widget card-aside card-latest-posts">
            <div className="card-headline">
                <Icon icon="fa6-solid:clock-rotate-left" />
                <span className="card-title">最新文章</span>
            </div>
            <div className="card-body">
                <ASideList items={
                    posts.map((item:Post)=>{
                        return {
                            title: item.title,
                            content: moment.unix(item.publishTime!).format("yyyy-MM-DD"),
                            pic: item.bannerImg,
                            link: "/posts/"+item.slug
                        };
                    }) as aSideListItem[]}
                />
            </div>
        </div>
    );
}