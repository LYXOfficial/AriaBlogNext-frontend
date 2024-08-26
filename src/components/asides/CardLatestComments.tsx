import "../../styles/ASide/global.css"
import { Icon } from '@iconify/react';
import ASideList from "./ASideList";
import moment from "moment";

export default function CardLatestComments({comments}:any) {
    return (
        <div className="card-widget card-aside card-latest-comments">
            <div className="card-headline">
                <Icon icon="fa6-solid:comment-dots" />
                <span className="card-title">最新评论</span>
            </div>
            <div className="card-body">
                <ASideList items={
                    comments.map((item:any)=>{
                        let aftertime,nowtime=Math.floor(Date.now()/1000);
                        if(nowtime-item.time<60)
                            aftertime="刚刚";
                        else if(nowtime-item.time<3600)
                            aftertime=Math.floor((nowtime-item.time)/60)+"分钟前";
                        else if(nowtime-item.time<86400)
                            aftertime=Math.floor((nowtime-item.time)/3600)+"小时前";
                        else if(nowtime-item.time<604800)
                            aftertime=Math.floor((nowtime-item.time)/86400)+"天前";
                        else
                            aftertime=moment.unix(item.time).format("yyyy-MM-DD");
                        return {
                            title: item.content,
                            content: item.user+" / "+aftertime,
                            pic: item.avatar,
                            link: item.link
                        };
                    })
                }/>
            </div>
        </div>
    );
}