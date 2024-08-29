import "src/styles/ASide/global.css"
import { Icon } from '@iconify/react';
import "src/styles/ASide/WebInfo.css";
import relativeTime from "src/utils/reltime";
import { webInfo } from "src/interfaces/siteinfo";
import "src/components/thirdpartyjs/Busuanzi";
import Busuanzi from "src/components/thirdpartyjs/Busuanzi";

export default function CardWebInfo({webInfos}:{webInfos:webInfo}){
    return (
        <div className="card-widget card-aside card-webinfo">
            <div className="card-headline">
                <Icon icon="fa6-solid:chart-line" />
                <span className="card-title">网站统计</span>
            </div>
            <div className="card-body">
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">文章数目 :</span>
                    <span className="card-webinfo-item-right">{webInfos.postCount}</span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">运行天数 :</span>
                    <span className="card-webinfo-item-right">{webInfos.runDays} 天</span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">文章字数 :</span>
                    <span className="card-webinfo-item-right">{Math.floor(webInfos.wordCount/100)/10}k</span>
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
                    <span className="card-webinfo-item-right">{relativeTime(webInfos.lastUpdateTime)}</span>
                </div>
                <div className="card-webinfo-item">
                    <span className="card-webinfo-item-left">评论总数 :</span>
                    <span className="card-webinfo-item-right">{webInfos.commentCount}</span>
                </div>
            </div>
            <Busuanzi/>
        </div>
    );
}