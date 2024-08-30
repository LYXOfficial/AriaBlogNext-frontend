import "src/styles/ASide/global.css"
import { Icon } from '@iconify/react';
import ASideList from "src/components/asides/ASideList";
import moment from "moment";
import { Post } from "src/interfaces/post";
import { aSideListItem } from "src/interfaces/asidelistitem";
import { siteConfigs } from "public/config"

export default async function CardRelatedPosts({slug}:{slug:string}){
    let posts:Post[]=[];
    let res=await fetch(`${siteConfigs.backEndUrl}/get/post/relatedPosts?slug=${slug}`);
    if(res.ok) posts=(await res.json()).data;
    if(posts.length==0) return <></>;
    return (
        <div className="card-widget card-aside card-latest-posts">
            <div className="card-headline">
                <Icon icon="fa6-solid:clock-rotate-left" />
                <span className="card-title">相关推荐</span>
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