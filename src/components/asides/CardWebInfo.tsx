import "src/styles/ASide/global.css"
import { Icon } from '@iconify/react';
import "src/styles/ASide/WebInfo.css";
import relativeTime from "src/utils/reltime";
import "src/components/thirdpartyjs/Busuanzi";
import Busuanzi from "src/components/thirdpartyjs/Busuanzi";
import { siteConfigs } from "public/config";
import moment from "moment";

export default async function CardWebInfo(){
    let lastUpdatedTime:number=0,wordCount:number=0,postCount:number=0;
    const resu=await fetch(`${siteConfigs.backEndUrl}/get/siteInfo/lastUpdateTime`);
    if(resu.ok){
        let ui=await resu.json();
        lastUpdatedTime=ui.time;
    }
    const resw=await fetch(`${siteConfigs.backEndUrl}/get/post/totalWordCount`);
    if(resw.ok){
        let wi=await resw.json();
        wordCount=wi.count;
    }
    const resp=await fetch(`${siteConfigs.backEndUrl}/get/post/postCount`);
    if(resp.ok){
        let pi=await resp.json();
        postCount=pi.count;
    }
    const runDays=moment().diff(moment([siteConfigs.createYear,siteConfigs.createMonth-1,siteConfigs.createDay]),"days");
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
                    <span className="card-webinfo-item-right" id="busuanzi_value_site_uv"></span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">总浏览量 :</span>
                    <span className="card-webinfo-item-right" id="busuanzi_value_site_pv"></span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">上次更新 :</span>
                    <span className="card-webinfo-item-right">{relativeTime(lastUpdatedTime)}</span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">评论总数 :</span>
                    <span className="card-webinfo-item-right"></span>
                </div>
            </div>
            <Busuanzi/>
        </div>
    );
}