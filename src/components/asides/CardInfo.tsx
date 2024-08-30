import Link from 'next/link'
import "src/styles/ASide/global.css"
import "src/styles/ASide/Info.css"
import { siteConfig,social } from "src/interfaces/siteconfig"
import { siteConfigs } from 'public/config'

export default async function CardInfo(){
    let postCount:number=0,tagCount:number=0,categoryCount:number=0;
    const resp=await fetch(`${siteConfigs.backEndUrl}/get/post/postCount`);
    if(resp.ok){
        let pi=await resp.json();
        postCount=pi.count;
    }
    const rest=await fetch(`${siteConfigs.backEndUrl}/get/tag/tagCount`);
    if(rest.ok){
        let ti=await rest.json();
        tagCount=ti.count;
    }
    const resc=await fetch(`${siteConfigs.backEndUrl}/get/category/categoryCount`);
    if(resc.ok){
        let ti=await resc.json();
        categoryCount=ti.count;
    }
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