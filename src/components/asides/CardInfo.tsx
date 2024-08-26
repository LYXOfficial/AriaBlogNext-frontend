import Link from 'next/link'
import "src/styles/ASide/global.css"
import "src/styles/ASide/Info.css"
import Image from "next/image"

export default function CardInfo({author,avatar,postCount,categoryCount,tagCount,socialLinks}:any){
    return (
        <div className="card-widget card-aside card-info">
            <div className="card-info-avatar">
                <img alt="avatar" src={avatar} className="card-info-avatar-img"/>
            </div>
            <span className="card-info-name">
                {author}
            </span>
            <div className="card-info-datas">
                <Link className="card-info-data" href="/archives">
                    <span className="card-info-data-title">文章</span>
                    <span className="card-info-data-count">{postCount}</span>
                </Link>
                <Link className="card-info-data" href="/tags">
                    <span className="card-info-data-title">标签</span>
                    <span className="card-info-data-count">{tagCount}</span>
                </Link>
                <Link className="card-info-data" href="/categories">
                    <span className="card-info-data-title">分类</span>
                    <span className="card-info-data-count">{categoryCount}</span>
                </Link>
            </div>
            <div className="card-info-socials">
                {
                    socialLinks.map((link:any)=>{
                        return (
                            <a key={link.name} className="card-info-social" href={link.link}>
                                {link.icon}
                            </a>
                        )
                    })
                }
            </div>
        </div>
    );
}