import "styles/ASide/global.css"
import { Icon } from '@iconify/react';
import ASideList from "components/asides/ASideList";
import moment from "moment";
import { Post } from "interfaces/post";
import { ASideListItem } from "interfaces/asidelistitem";
import { siteConfigs } from "config"

export default async function CardNewestPosts(){
    let posts:Post[]=[];
    let resp=await fetch(`${siteConfigs.backEndUrl}/get/post/postsInfo?startl=${0}&endl=${6}`,{next:{tags:["posts"]}});
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
                    }) as ASideListItem[]}
                    falldownImg={siteConfigs.falldownImg}
                />
            </div>
        </div>
    );
}