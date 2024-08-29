import Link from 'next/link'
import "src/styles/ASide/global.css"
import "src/styles/ASide/Info.css"
import { webInfo,siteConfig,social } from "src/interfaces/siteinfo"

export default function CardInfo({webInfos,siteConfigs}:{webInfos:webInfo,siteConfigs:siteConfig}){
    return (
        <div className="card-widget card-aside card-info">
            <div className="card-info-avatar">
                <img alt="avatar" src={siteConfigs.avatar} className="card-info-avatar-img"/>
            </div>
            <span className="card-info-name">
                {siteConfigs.author}
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
                    siteConfigs.socials.map((link:social)=>{
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