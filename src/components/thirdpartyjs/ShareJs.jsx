"use client"
import "social-share.js/dist/css/share.min.css";
import { useEffect } from "react";

export default function ShareJs({postInfo}) {
    useEffect(()=>{(async ()=>{
        require('jquery');
        require('social-share.js/dist/js/social-share.min.js');
        window.socialShare("#postend-share", {
            title: postInfo.title,
            description: postInfo.description?postInfo.description:postInfo.plainContent?.substring(0,100).replace("\n"," "),
            image: postInfo.bannerImg,
            // sites: ['qzone', 'qq', 'weibo','wechat', 'douban'],
            disabled: ['google', 'facebook', 'twitter',"linkedin","tencent","diandian"],
        });
    })()},[postInfo])
    return <div id="postend-share"></div>;
}