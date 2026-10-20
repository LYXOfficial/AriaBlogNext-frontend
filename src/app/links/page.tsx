import "styles/Pages.css";
import "styles/PostContent.css";
import { HomeRightSide } from "components/RightSide";
import { siteConfigs } from "@/config";
import React from "react";
import Content from "./renderer";
import CollectionHeader from "@/components/CollectionHeader";

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
            <CollectionHeader
              eyebrow="朋友名录"
              title="友链"
              extra={
                <a className="collection-action" href="#friend-apply">
                  申请友链 ↗
                </a>
              }
            />
            <Content />
          </div>
        </div>
        <HomeRightSide />
      </div>
    </>
  );
}
