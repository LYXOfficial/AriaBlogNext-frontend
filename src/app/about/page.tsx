import "styles/Pages.css";
import "styles/PostContent.css";
import { PageRightSide } from "@/components/RightSide";
import { TwikooBaseComment } from "@/components/thirdpartyjs/Twikoo";
import MDXRenderer from "./renderer";
import { siteConfigs } from "@/config";

export const metadata = {
  title: `蒟蒻杂谈 | ${siteConfigs.title}`,
};

export default function Page() {
  return (
    <div className="page" id="main-container">
      <style>{`#navbar{position:fixed}`}</style>
      <div id="article-container" className="page flink">
        <div id="post-maincontent" className="page flink">
          <MDXRenderer />
        </div>
        <TwikooBaseComment />
      </div>
      <PageRightSide />
    </div>
  );
}
