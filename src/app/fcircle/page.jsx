"use client";
import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/FriendCircle.css";
import { useEffect } from "react";
import { HomeRightSide } from "@/components/RightSide";
import { siteConfigs } from "@/config";

export default function Page() {
    useEffect(()=>{
        window.UserConfig={
            // 填写你的api地址
            private_api_url: siteConfigs.fcircleUrl,
            // 初始加载几篇文章
            page_init_number: 20,
            // 点击加载更多时，一次最多加载几篇文章，默认10
            page_turning_number: 10,
            // 头像加载失败时，默认头像地址
            error_img: siteConfigs.falldownAvatar,
            // 进入页面时第一次的排序规则
            sort_rule: 'created',
            // 本地文章缓存数据过期时间（天）
            expire_days: 1, 
        }
        import("fcircle-theme-yyyz/dist/fcircle.min");
    },[]);
    return <div className="page" id="main-container">
        <style>{`#navbar{position:fixed}`}</style>
        <div id="article-container" className="page flink">
            <div id="post-maincontent" className="page flink">
                <h1>朋友圈</h1>
                <div id="hexo-circle-of-friends-root"/>
            </div>
        </div>
        <HomeRightSide/>
    </div>;
}