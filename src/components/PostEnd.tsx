import { Post } from "interfaces/post";
import { siteConfigs } from "config";
import moment from "moment";
import "styles/PostEnd.css";
import ShareJs from "components/thirdpartyjs/ShareJs";
import Link from "next/link";
import { Icon } from "@iconify/react";
import ImageWithFalldown from "components/ImageWithFalldown";
import React from "react";

export default async function PostEnd({ postInfo }: { postInfo: Post }) {
  const res = await fetch(
    `${siteConfigs.backEndUrl}/get/post/postNavigation?slug=${postInfo.slug}`,
    { next: { revalidate: 7200, tags: ["posts"] } },
  );
  let previousPost: Post = {},
    nextPost: Post = {};
  if (res.ok) {
    const postNavigation = await res.json();
    previousPost = postNavigation.previous;
    nextPost = postNavigation.next;
  }
  return (
    <>
      <div className="post-copyright">
        <div className="post-copyright__title">
          <span className="post-copyright-info">{postInfo.title}</span>
        </div>
        <div className="post-copyright__type">
          <span className="post-copyright-info">
            <a
              className="normal-a"
              href={`${siteConfigs.siteUrl}/posts/${postInfo.slug}/`}
            >
              {`${siteConfigs.siteUrl}/posts/${postInfo.slug}/`}
            </a>
          </span>
        </div>
        <div className="post-copyright-m">
          <div className="post-copyright-m-info">
            <div
              className="post-copyright-a"
              style={{ display: "inline-block", width: 120 }}
            >
              作者
              <div className="post-copyright-cc-info">{siteConfigs.author}</div>
            </div>
            <div
              className="post-copyright-c"
              style={{ display: "inline-block", width: 120 }}
            >
              发布于
              <div className="post-copyright-cc-info">
                {moment.unix(postInfo.publishTime!).format("YYYY-MM-DD")}
              </div>
            </div>
            <div
              className="post-copyright-u"
              style={{ display: "inline-block", width: 120 }}
            >
              更新于
              <div className="post-copyright-cc-info">
                {moment.unix(postInfo.lastUpdatedTime!).format("YYYY-MM-DD")}
              </div>
            </div>
            <div
              className="post-copyright-c"
              style={{ display: "inline-block", width: 180 }}
            >
              许可协议
              <div className="post-copyright-cc-info">
                <a
                  className="icon"
                  rel="noopener external nofollow noreferrer"
                  target="_blank"
                  title="Creative Commons"
                  href="https://creativecommons.org/"
                >
                  <i className="fab fa-creative-commons"></i>
                </a>
                <a
                  className="normal-a"
                  rel="noopener external nofollow noreferrer"
                  target="_blank"
                  title="CC BY-NC-SA 4.0"
                  href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh"
                >
                  CC BY-NC-SA 4.0
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="postend-tagbar">
        <div id="postend-tags">
          {postInfo.tags!.map((tag, index) => {
            return (
              <a
                className="postend-tag"
                key={index}
                href={`/tags/${tag}`}
                rel="noopener external nofollow noreferrer"
                target="_blank"
              >
                {tag}
              </a>
            );
          })}
        </div>
        <ShareJs postInfo={postInfo} />
      </div>
      <div id="postend-navigation">
        {previousPost ? (
          <Link
            className={`postend-navigation-item previous${nextPost ? "" : " single"}`}
            href={`/posts/${previousPost.slug}`}
          >
            <ImageWithFalldown
              className="postend-navigation-image"
              src={previousPost.bannerImg!}
              alt={previousPost.title!}
              falldownImg={siteConfigs.falldownImg}
            />
            <span className="postend-navigation-headline">
              <span className="postend-navigation-intro">
                <Icon icon="fa6-solid:angle-left" />
                上一篇
              </span>
              <span className="postend-navigation-date">
                <Icon icon="fa6-solid:calendar-days" />
                {moment.unix(previousPost.publishTime!).format("YYYY-MM-DD")}
              </span>
            </span>
            <span className="postend-navigation-title">
              {previousPost.title}
            </span>
          </Link>
        ) : (
          <></>
        )}
        {nextPost ? (
          <Link
            className={`postend-navigation-item next${previousPost ? "" : " single"}`}
            href={`/posts/${nextPost.slug}`}
          >
            <ImageWithFalldown
              className="postend-navigation-image"
              src={
                nextPost.bannerImg
                  ? nextPost.bannerImg
                  : siteConfigs.falldownImg
              }
              alt={nextPost.title!}
              falldownImg={siteConfigs.falldownImg}
            />
            <span className="postend-navigation-headline">
              <span className="postend-navigation-date">
                <Icon icon="fa6-solid:calendar-days" />
                {moment.unix(nextPost.publishTime!).format("YYYY-MM-DD")}
              </span>
              <span className="postend-navigation-intro">
                下一篇
                <Icon icon="fa6-solid:angle-right" />
              </span>
            </span>
            <span className="postend-navigation-title">{nextPost.title}</span>
          </Link>
        ) : (
          <></>
        )}
      </div>
      <hr />
    </>
  );
}
