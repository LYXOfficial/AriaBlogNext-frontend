import "src/styles/ASide/global.css"
import { Icon } from '@iconify/react';
import ASideList from "src/components/asides/ASideList";
import relativeTime from "src/utils/reltime"

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
                        return {
                            title: item.content,
                            content: item.user+" / "+relativeTime(item.time),
                            pic: item.avatar,
                            link: item.link
                        };
                    })
                }/>
            </div>
        </div>
    );
}