import FaIcon from './fa16';
import * as FaIcons from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import "../styles/Posts.css"

const posts=[
    {
        title:"Hello World",
        bannerImg:"https://bu.dusays.com/2024/07/02/668388069d6db.webp",
        content:"This is my first post",
        link:"/posts/hello-world",
        publishTime:0,
        lastUpdateTime:0,
        tags:["hello","world"],
        category:"hello",
        commentCount:0,
    }
]
export default function Posts() {
    return (
        <div id="posts-container">
            {posts.map((post)=>{
                    return (
                        <div className="post-card card-widget" key={post.title}>
                            <div className="post-banner">
                                <a className="post-banner-link" href={post.link} title={post.title}>
                                    <img className="post-banner-img" src={post.bannerImg} alt={post.title} />
                                </a>
                            </div>
                            <div className="post-info">
                                <a className="post-title" href={post.link} title={post.title} >{post.title}</a>
                                <div className="post-content">{post.content}</div>
                                <div className="post-metas">
                                    <a className="post-category" href={"/catogories/" + post.category} title={post.category}>{post.category}</a>
                                    <div className="post-meta post-publishdate">
                                        <FaIcon icon={FaIcons.faCalendarAlt} size={16}/>
                                        <span className="post-meta-context">
                                            {"发表于 "+moment.unix(post.publishTime).format("YYYY-MM-DD")+" | "}
                                        </span>
                                    </div>
                                    <div className="post-meta post-lastupdatedate">
                                        <FaIcon icon={FaIcons.faCalendarAlt} size={16}/>
                                        <span className="post-meta-context">
                                            {"更新于 "+moment.unix(post.lastUpdateTime).format("YYYY-MM-DD")+" | "}
                                        </span>
                                    </div>
                                    <div className="post-meta post-tags">
                                        <FaIcon icon={FaIcons.faTags} size={16}/>
                                        <span className="post-meta-context">
                                            {post.tags.map((tag,index) => {
                                                return (
                                                    <div key={tag}>
                                                        {index?(<span> · </span>):(<></>)}
                                                        <a href={"/tags/"+tag}>
                                                            {tag}
                                                        </a>
                                                    </div>
                                                );
                                            })}
                                            <span> | </span>
                                        </span>
                                    </div>
                                    <div className="post-meta post-commentcount">
                                        <FaIcon icon={FaIcons.faComment} size={16}/>
                                        <span className="post-meta-context">
                                            {post.commentCount+" 条评论"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
            )}
        </div>
    );
}