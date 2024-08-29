import { Post } from "src/interfaces/post";
import { siteInfos } from "public/config";
import moment from "moment";
import "src/styles/PostCopyright.css";
import ShareJs from "src/components/ShareJs";

export default function PostEnd({ postInfo }: { postInfo: Post }) {
    return <>
        <div className="post-copyright">
            <div className="post-copyright__title">
                <span className="post-copyright-info">
                    {postInfo.title}
                </span>
            </div>
            <div className="post-copyright__type">
                <span className="post-copyright-info">
                    <a className="normal-a" href={`https://${siteInfos.siteDomain}/posts/${postInfo.slug}/`}>
                        {`https://${siteInfos.siteDomain}/posts/${postInfo.slug}/`}
                    </a>
                </span>
            </div>
            <div className="post-copyright-m">
            <div className="post-copyright-m-info">
                <div className="post-copyright-a" style={{display:"inline-block",width:120}}>
                    作者
                <div className="post-copyright-cc-info">
                    {siteInfos.author}
                </div>
            </div>
                <div className="post-copyright-c" style={{display:"inline-block",width:120}}>
                    发布于
                    <div className="post-copyright-cc-info">
                        {moment.unix(postInfo.publishTime).format('YYYY-MM-DD')}
                    </div>
                </div>
                    <div className="post-copyright-u" style={{display:"inline-block",width:120}}>
                        更新于
                        <div className="post-copyright-cc-info">
                            {moment.unix(postInfo.lastUpdateTime).format('YYYY-MM-DD')}
                        </div>
                    </div>
                    <div className="post-copyright-c" style={{display:"inline-block",width:180}}>
                        许可协议
                        <div className="post-copyright-cc-info">
                            <a className="icon" rel="noopener external nofollow noreferrer" target="_blank" title="Creative Commons" href="https://creativecommons.org/">
                                <i className="fab fa-creative-commons"></i>
                            </a>
                            <a className="normal-a" rel="noopener external nofollow noreferrer" target="_blank" title="CC BY-NC-SA 4.0" href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh">
                                CC BY-NC-SA 4.0
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="postend-tagbar">
            <div id="postend-tags">{
                postInfo.tags.map((tag, index) => {
                    return <a className="postend-tag" key={index} href={`/tags/${tag}`} rel="noopener external nofollow noreferrer" target="_blank">{tag}</a>
                })
            }</div>
            <ShareJs postInfo={postInfo}/>
        </div>
        <hr/>
    </>
}