import "src/styles/PostContent.css"

export default function PostContent({htmlContent}:{htmlContent:string}) {
    return (
        <article id="article-container" className="card-widget">
            <div id="post-maincontent" dangerouslySetInnerHTML={{ __html: htmlContent }}>
            </div>
        </article>
    );
}