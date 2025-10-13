import CardInfo from "components/asides/CardInfo";
import CardAnnouncement from "components/asides/CardAnnouncement";
import CardLatestComments from "components/asides/CardLatestComments";
import CardArchives from "components/asides/CardArchives";
import CardWebInfo from "components/asides/CardWebInfo";
import CardNewestPosts from "components/asides/CardNewestPosts";
import CardToc from "components/asides/CardToc";
import CardRelatedPosts from "components/asides/CardRelatedPosts";
import CardLoveU from "components/asides/CardLoveU";
import React, { ReactElement } from "react";
import { Post } from "@/interfaces/post";

export function HomeASides() {
  return (
    <div id="aside-container">
      <CardInfo />
      <CardLoveU />
      <CardAnnouncement content={<>欢迎光临Ariaの博客QwQ~</>} />
      <div className="aside-sticky-container">
        <CardLatestComments />
        <CardArchives />
        <CardWebInfo />
      </div>
    </div>
  );
}
export async function PageASides({ postInfo }: { postInfo: Post }) {
  return (
    <div id="aside-container">
      <CardInfo />
      <CardAnnouncement content={<>欢迎光临AriaのNext.js新博客QwQ~</>} />
      <div className="aside-sticky-container">
        <CardToc mdContent={postInfo.mdContent!} />
        <CardNewestPosts />
        <CardRelatedPosts slug={postInfo.slug!} />
      </div>
    </div>
  );
}
