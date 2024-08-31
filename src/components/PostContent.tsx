import "styles/PostContent.css"

import Lazyload from "components/thirdpartyjs/Lazyload";
import FancyBox from "components/thirdpartyjs/FancyBox";
import HLJSNum from "components/thirdpartyjs/HLJSNum";
import CodeCopier from "components/thirdpartyjs/CodeCopier";
import KaTex from "components/thirdpartyjs/KaTex";
import { TwikooPost } from "components/thirdpartyjs/Twikoo";

import PostEnd from "components/PostEnd";
import { Post } from "interfaces/post";


export default function PostContent({htmlContent,postInfo}:{htmlContent:string,postInfo:Post}) {
    return (
        <article id="article-container" className="card-widget">
            <div id="post-maincontent" dangerouslySetInnerHTML={{ __html: htmlContent }}/>
            <FancyBox/>
            <HLJSNum/>
            <CodeCopier/>
            <KaTex/>
            <Lazyload/>
            <PostEnd postInfo={postInfo}/>
            <TwikooPost/>
        </article>
    );
}