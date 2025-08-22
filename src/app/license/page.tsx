import { HomeRightSide } from "@/components/RightSide";
import "styles/Pages.css";
import "styles/PostContent.css";
import React from "react";
import MDXRenderer from "./renderer";
import { siteConfigs } from "@/config";

export const metadata = {
  title: `声明 | ${siteConfigs.title}`,
};

export default function License() {
  return (
    <>
      <style>{`#navbar{position:fixed}`}</style>
      <div id="main-container" className="page">
        <div id="article-container" className="page flink">
          <div id="post-maincontent" className="page">
            <MDXRenderer />
          </div>
        </div>
      </div>
      <HomeRightSide />
    </>
  );
}
