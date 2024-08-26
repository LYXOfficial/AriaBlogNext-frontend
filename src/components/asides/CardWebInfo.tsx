"use client"
import "src/styles/ASide/global.css"
import { Icon } from '@iconify/react';
import "src/styles/ASide/WebInfo.css"
import relativeTime from "src/utils/reltime"

export default function CardWebInfo({postCount,runDays,wordCount,visitorCount,viewCount,lastUpdateTime,commentCount}:any){
    
    return (
        <div className="card-widget card-aside card-webinfo">
            <div className="card-headline">
                <Icon icon="fa6-solid:chart-line" />
                <span className="card-title">网站统计</span>
            </div>
            <div className="card-body">
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">文章数目 :</span>
                    <span className="card-webinfo-item-right">{postCount}</span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">运行天数 :</span>
                    <span className="card-webinfo-item-right">{runDays} 天</span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">文章字数 :</span>
                    <span className="card-webinfo-item-right">{Math.floor(wordCount/100)/10}k</span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">总访客数 :</span>
                    <span className="card-webinfo-item-right">{visitorCount}</span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">总浏览量 :</span>
                    <span className="card-webinfo-item-right">{viewCount}</span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">上次更新 :</span>
                    <span className="card-webinfo-item-right">{relativeTime(lastUpdateTime)}</span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">评论总数 :</span>
                    <span className="card-webinfo-item-right">{commentCount}</span>
                </div>
            </div>
        </div>
    );
}