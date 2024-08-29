import "src/styles/PostContent.css"
import Lazyload from "src/components/Lazyload";
import FancyBox from "src/components/FancyBox";
import HLJSNum from "src/components/HLJSNum";
import CodeCopier from "src/components/CodeCopier";
import KaTex from "src/components/KaTex";

export default function PostContent({htmlContent}:{htmlContent:string}) {
    return (
        <article id="article-container" className="card-widget">
            <div id="post-maincontent" dangerouslySetInnerHTML={{ __html: htmlContent }}>
            </div>
            <FancyBox/>
            <HLJSNum/>
            <CodeCopier/>
            <KaTex/>
            <Lazyload/>
        </article>
    );
}