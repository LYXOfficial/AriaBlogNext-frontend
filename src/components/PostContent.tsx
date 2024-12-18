import "styles/PostContent.css"
import { TwikooBaseComment, TwikooCountPost } from "components/thirdpartyjs/Twikoo";
import PostEnd from "components/PostEnd";
import { Post } from "interfaces/post";
import MDToTSXWithPlugins from "./mdxlibs";

export default function PostContent({ mdContent, postInfo }: { mdContent: string, postInfo: Post }) {
  return (
    <article id="article-container" className="card-widget">
      <div id="post-maincontent">
        <MDToTSXWithPlugins mdContent={mdContent} />
      </div>
      <PostEnd postInfo={postInfo} />
      <TwikooBaseComment />
      <TwikooCountPost />
    </article>
  );
}