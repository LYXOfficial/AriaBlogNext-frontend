export const revalidate = 1800;
import "styles/Pages.css";
import "styles/PostContent.css";
import { TwikooBaseComment } from "components/thirdpartyjs/Twikoo";
import { PageRightSide } from "components/RightSide";
import { Speaks } from "components/Speaks";
import { siteConfigs } from "@/config";
import React from "react";

export const metadata = {
  title: `哔哔 | ${siteConfigs.title}`,
};
export default function Page() {
  return (
    <>
      <style>{`#navbar{position:fixed}`}</style>
      <div id="main-container" className="page">
        <div id="article-container" className="page">
          <div id="post-maincontent" className="page">
            <h1>哔哔</h1>
            <Speaks />
          </div>
          {/* 评论区必须紧跟 #post-maincontent：Pages.css 的宽度/虚线分隔靠相邻
              兄弟选择器 (#post-maincontent.page + #post-comment-container) 生效，
              中间插任何元素（比如 <hr>）都会让评论区变成全宽、和正文对不齐 */}
          <TwikooBaseComment />
        </div>
        <PageRightSide />
      </div>
    </>
  );
}
