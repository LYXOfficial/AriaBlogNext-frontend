import Link from 'next/link'
import "src/styles/ASide/global.css"
import "src/styles/ASide/Info.css"
import { webInfo,siteInfo,social } from "src/interfaces/siteinfo"

export default function CardInfo({webInfos,siteInfos}:{webInfos:webInfo,siteInfos:siteInfo}){
    return (
        <div className="card-widget card-aside card-info">
            <div className="card-info-avatar">
                <img alt="avatar" src={siteInfos.avatar} className="card-info-avatar-img"/>
            </div>
            <span className="card-info-name">
                {siteInfos.author}
            </span>
            <div className="card-info-datas">
                <Link className="card-info-data" href="/archives">
                    <span className="card-info-data-title">文章</span>
                    <span className="card-info-data-count">{webInfos.postCount}</span>
                </Link>
                <Link className="card-info-data" href="/tags">
                    <span className="card-info-data-title">标签</span>
                    <span className="card-info-data-count">{webInfos.tagCount}</span>
                </Link>
                <Link className="card-info-data" href="/categories">
                    <span className="card-info-data-title">分类</span>
                    <span className="card-info-data-count">{webInfos.categoryCount}</span>
                </Link>
            </div>
            <div className="card-info-socials">
                {
                    siteInfos.socials.map((link:social)=>{
                        return (
                            <a key={link.name} className="card-info-social" href={link.url}>
                                {link.icon}
                            </a>
                        )
                    })
                }
            </div>
        </div>
    );
}