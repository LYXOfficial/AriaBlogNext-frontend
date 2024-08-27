import "src/styles/PostHeader.css"
import { Post } from "src/interfaces/post"
import { Icon } from "@iconify/react"
import Link from "next/link"
import moment from "moment"

export default function PostHeader({postInfo}:{postInfo:Post}) {
    return (
        <header id="post-banner" style={{backgroundImage: `url(${postInfo.bannerImg})`}}>
            <div id="post-banner-info">
                <div id="post-banner-title">
                    {postInfo.title}
                </div>
                <div id="post-banner-meta">
                    <div className="post-metas">
                        <div className="post-metas-firstline">
                            <div className="post-meta post-publishdate">
                                <Icon icon="fa6-solid:calendar-days"/>
                                <span className="post-meta-content">
                                    {" 发表于 "+moment.unix(postInfo.publishTime).format("YYYY-MM-DD")+" | "}
                                </span>
                            </div>
                            <div className="post-meta post-lastupdatedate">
                                <Icon icon="fa6-solid:calendar-days"/>
                                <span className="post-meta-content">
                                    {" 更新于 "+moment.unix(postInfo.lastUpdateTime).format("YYYY-MM-DD")+" | "}
                                </span>
                            </div>
                            <div className="post-meta post-category">
                                <Icon icon="fa6-solid:inbox"/>
                                <span className="post-meta-content">
                                    <a href={"/categories/"+postInfo.category}>
                                        {postInfo.category}
                                    </a>
                                    <span>&nbsp;| </span>
                                </span>
                            </div>
                            <div className="post-meta post-tags">
                                <Icon icon="fa6-solid:tag" />
                                <span className="post-meta-content">
                                    {postInfo.tags.map((tag,index) => {
                                        return (
                                            <div key={tag}>
                                                {index?(<span> · </span>):(<></>)}
                                                <Link href={"/tags/"+tag}>
                                                    {tag}
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </span>
                            </div>
                        </div>
                        <div className="post-metas-secondline">
                            <div className="post-meta post-wordcount">
                                <Icon icon="fa6-regular:file-word" />
                                <span className="post-meta-content">
                                    {`字数总计: ${(postInfo.wordCount as number)>=1000?(postInfo.wordCount as number)/1000+"k":(postInfo.wordCount as number)} | `}
                                </span>
                            </div>
                            <div className="post-meta post-wordcount">
                                <Icon icon="fa6-regular:eye" />
                                <span className="post-meta-content">
                                    {`阅读量: ${postInfo.viewCount as number} | `}
                                </span>
                            </div>
                            <div className="post-meta post-wordcount">
                                <Icon icon="fa6-regular:clock" />
                                <span className="post-meta-content">
                                    {`阅读用时: ${Math.floor((postInfo.wordCount as number)/300)} 分钟 | `}
                                </span>
                            </div>
                            <div className="post-meta post-commentcount">
                                <Icon icon="fa6-solid:comments" />
                                <span className="post-meta-content">
                                    {" "+postInfo.commentCount+" 条评论"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}