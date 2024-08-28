import "src/styles/PostContent.css"
import MDRender from "src/utils/mdrender";

export default async function PostContent({mdContent}:{mdContent:string}) {
    const postContent=await MDRender(mdContent);
    return (
        <article id="article-container" className="card-widget">
            <div id="post-maincontent" dangerouslySetInnerHTML={{ __html: postContent }}>
            </div>
            {/* <script>
                {`MathJax = {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']]
                },
                svg: {
                    fontCache: 'global'
                }
                };`}
            </script>
            <script type="text/javascript" id="MathJax-script" async
                src="https://gcore.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js">
            </script> */}
        </article>
    );
}