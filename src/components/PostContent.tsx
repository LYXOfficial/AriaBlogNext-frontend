import "src/styles/PostContent.css"

import Lazyload from "src/components/thirdpartyjs/Lazyload";
import FancyBox from "src/components/thirdpartyjs/FancyBox";
import HLJSNum from "src/components/thirdpartyjs/HLJSNum";
import CodeCopier from "src/components/thirdpartyjs/CodeCopier";
import KaTex from "src/components/thirdpartyjs/KaTex";
import Twikoo from "src/components/thirdpartyjs/Twikoo";

import PostEnd from "src/components/PostEnd";
import { Post } from "src/interfaces/post";


export default function PostContent({htmlContent,postInfo}:{htmlContent:string,postInfo:Post}) {
    return (
        <article id="article-container" className="card-widget">
            <div id="post-maincontent" dangerouslySetInnerHTML={{ __html: htmlContent }}>
            </div>
            <FancyBox/>
            <HLJSNum/>
            <CodeCopier/>
            <KaTex/>
            <Lazyload/>
            <PostEnd postInfo={postInfo}/>
            <Twikoo/>
        </article>
    );
}