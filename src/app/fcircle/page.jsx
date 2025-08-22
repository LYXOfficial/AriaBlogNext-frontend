"use client";
import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/FriendCircle.css";
import { useEffect } from "react";
import { HomeRightSide } from "@/components/RightSide";
import { siteConfigs } from "@/config";

export default function Page() {
  useEffect(() => {
    window.UserConfig = {
      private_api_url: siteConfigs.fcircleUrl,
      page_init_number: 20,
      page_turning_number: 10,
      error_img: siteConfigs.falldownAvatar,
      sort_rule: "created",
      expire_days: 1,
    };
    import("fcircle-theme-yyyz/dist/fcircle.min");
  }, []);
  return (
    <div className="page" id="main-container">
      <style>{`#navbar{position:fixed}`}</style>
      <title>{`朋友圈 | ${siteConfigs.title}`}</title>
      <div id="article-container" className="page flink">
        <div id="post-maincontent" className="page flink">
          <h1>朋友圈</h1>
          <div id="hexo-circle-of-friends-root" />
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
