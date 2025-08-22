import "styles/Pages.css";
import "styles/PostContent.css";
import { HomeRightSide } from "components/RightSide";
import { siteConfigs } from "@/config";
import React from "react";
import Content from "./renderer";

export const metadata = {
  title: "友链 | " + siteConfigs.title,
};

export default async function Page() {
  return (
    <>
      <style>{`#navbar{position:fixed}`}</style>
      <div id="main-container" className="page">
        <div id="article-container" className="page flink">
          <div id="post-maincontent" className="page flink">
            <Content />
          </div>
        </div>
        <HomeRightSide />
      </div>
    </>
  );
}
