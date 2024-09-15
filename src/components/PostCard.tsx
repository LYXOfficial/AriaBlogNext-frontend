import { Icon } from "@iconify/react"
import moment from 'moment';
import "styles/PostCard.css"
import Link from 'next/link';
import { Post } from "interfaces/post"
import { siteConfigs } from 'config';
import { notFound } from "next/navigation";
import { TwikooCountHome } from "components/thirdpartyjs/Twikoo";
import PostCategoryBar from "components/PostCategoryBar";
import ImageWithFalldown from "./ImageWithFalldown";

export default async function Posts({page}:{page:number}){
    let startl=(page-1)*siteConfigs.pageMaxPosts,endl=page*siteConfigs.pageMaxPosts;
    let resp=await fetch(`${siteConfigs.backEndUrl}/get/post/postsInfo?startl=${startl}&endl=${endl}`,{next:{tags:["posts"]}});
    if(!resp.ok) return notFound();
    let posts:Post[]=(await resp.json()).data;
    let resm=await fetch(`${siteConfigs.backEndUrl}/get/post/postCount`,{next:{tags:["posts"]}});
    if(!resm.ok) return notFound();
    let postTotal=(await resm.json()).count;
    const maxPage=Math.ceil(postTotal/siteConfigs.pageMaxPosts);
    return (
        <div id="recent-posts">
            <PostCategoryBar/>
            {posts.map((post)=>{
                    return (
                        <div className={`recent-post-info post-card card-widget ${startl?"":"first-page"}`} key={post.title}>
                            <span className="for-fc post__title">{post.title}</span>
                            <div className="for-fc post-meta-date">
                                <span className="time for-fc">{moment.unix(post.publishTime!).format("YYYY-MM-DD")}</span>
                                <span className="time for-fc">{moment.unix(post.lastUpdatedTime!).format("YYYY-MM-DD")}</span>
                            </div>
                            <div className="post-banner">
                                <Link className="post-banner-link" href={"/posts/"+post.slug} title={post.title}>
                                    <ImageWithFalldown objectPosition={post?.coverFit} className="post-banner-img" src={post.bannerImg?post.bannerImg:siteConfigs.falldownImg} alt={post.title!} falldownImg={siteConfigs.falldownImg}/>
                                </Link>
                            </div>
                            <div className="post-info">
                                <Link className="post-title" href={"/posts/"+post.slug} title={post.title} >{post.title}</Link>
                                <div className="post-content">{post.description?post.description:post.plainContent}</div>
                                <div className="post-metas">
                                    <Link className="post-category" href={"/catogories/" + post.category} title={post.category}>{post.category}</Link>
                                    <div className="post-meta post-publishdate">
                                        <Icon icon="fa6-solid:calendar-days"/>
                                        <span className="post-meta-content">
                                            {"发表于 "+moment.unix(post.publishTime!).format("YYYY-MM-DD")+" |"}
                                        </span>
                                    </div>
                                    <div className="post-meta post-lastupdatedate">
                                        <Icon icon="fa6-solid:calendar-days"/>
                                        <span className="post-meta-content">
                                            {"更新于 "+moment.unix(post.lastUpdatedTime!).format("YYYY-MM-DD")+" |"}
                                        </span>
                                    </div>
                                    <div className="post-meta post-tags">
                                        <Icon icon="fa6-solid:tag" />
                                        <span className="post-meta-content">
                                            {post.tags!.slice(0,5).map((tag,index) => {
                                                return (
                                                    <div key={tag}>
                                                        {index?(<span>·</span>):(<></>)}
                                                        <Link href={"/tags/"+tag}>
                                                            {tag}
                                                        </Link>
                                                    </div>
                                                );
                                            })}
                                            <span> |</span>
                                        </span>
                                    </div>
                                    <div className="post-meta post-commentcount">
                                        <Icon icon="fa6-solid:comments" />
                                        <span className="post-meta-content">
                                            {"条评论"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
            )}
            <div className="post-card-pgwrap">
                {page-2>0?<Link className="post-card-pgbtn" href="/page/1">1</Link>:<></>}
                {page-3>0?<span className="post-card-spec">...</span>:<></>}
                {page-1>0?<Link className="post-card-pgbtn" href={`/page/${page-1}`}>{page-1}</Link>:<></>}
                <Link className="post-card-pgbtn current" href={`/page/${page}`}>{page}</Link>
                {page+1<=maxPage?<Link className="post-card-pgbtn" href={`/page/${page+1}`}>{page+1}</Link>:<></>}
                {page+3<=maxPage?<span className="post-card-spec">...</span>:<></>}
                {page+2<=maxPage?<Link className="post-card-pgbtn" href={`/page/${maxPage}`}>{maxPage}</Link>:<></>}
            </div>
            <TwikooCountHome/>
        </div>
    );
}