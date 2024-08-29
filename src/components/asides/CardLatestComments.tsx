"use client"
import "src/styles/ASide/global.css"
import { Icon } from '@iconify/react';
import ASideList from "src/components/asides/ASideList";
import { twikooCommentItem,aSideListItem } from "src/interfaces/asidelistitem";
import { siteInfos } from "public/config";
import { useEffect, useState } from "react";

export default function CardLatestComments(){
    const [comments,setComments]=useState<twikooCommentItem[]>([]);
    useEffect(()=>{(async ()=>{
        var twikoo=require('twikoo/dist/twikoo.min');
        console.log(siteInfos.twikooEnv);
        let res:twikooCommentItem[]=await new Promise((resolve,reject)=>{
            try{
                twikoo.getRecentComments({
                    envId: siteInfos.twikooEnv,
                    region: '',
                    pageSize: 5,
                    includeReply: true
                }).then((res:twikooCommentItem[]) => {
                    resolve(res);
                })
            }
            catch(e){
                resolve([{}]);
            }
        });
        setComments(res);
        })();
        return ()=>{setComments([])};
    },[])
    return (
        <div className="card-widget card-aside card-latest-comments">
            <div className="card-headline">
                <Icon icon="fa6-solid:comment-dots" />
                <span className="card-title">最新评论</span>
            </div>
            <div className="card-body">
                {
                    comments.length==5?
                        (<ASideList items={
                            comments.map((item:twikooCommentItem|undefined)=>{
                                return {
                                    title: item!.commentText!.replace("\n"," "),
                                    content: `${item!.nick} / ${item!.relativeTime}`,
                                    pic: item!.avatar,
                                    link: item!.url
                                };
                            }) as aSideListItem[]
                        }/>):(comments.length?<center>评论获取失败，请检查相关配置是否正确</center>:<center>获取中...</center>)
                }
            </div>
        </div>
    );
}