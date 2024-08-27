import "src/styles/PostContent.css"
import MDRender from "src/utils/mdrender";

export default async function PostContent({mdContent}:{mdContent:string}) {
    const postContent=await MDRender(mdContent);
    return (
        <article id="article-container" className="card-widget">
            <div id="post-maincontent" dangerouslySetInnerHTML={{ __html: postContent }}>
            </div>
        </article>
    );
}