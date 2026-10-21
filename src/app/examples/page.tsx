import type { Metadata } from "next";
import MDToTSXWithPlugins from "@/components/mdxlibs";
import { PageRightSide } from "@/components/RightSide";
import { siteConfigs } from "@/config";
import content from "./content.mdx";
import "styles/Pages.css";
import "styles/PostContent.css";

export const metadata: Metadata = {
  title: `示例 | ${siteConfigs.title}`,
  description:
    "文章外挂标签的效果与写法：提示块、折叠、选项卡、气泡提示和更多小组件。",
};

export default function ExamplesPage() {
  return (
    <div id="main-container" className="page examples-page">
      <style>{`#navbar{position:fixed}`}</style>
      <article id="article-container" className="page">
        <div className="examples-content">
          <div id="post-maincontent" className="page">
            <MDToTSXWithPlugins mdContent={content.toString()} />
          </div>
        </div>
      </article>
      <PageRightSide />
    </div>
  );
}
