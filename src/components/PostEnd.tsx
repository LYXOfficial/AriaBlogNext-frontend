import { Post } from "interfaces/post";
import { siteConfigs } from "config";
import dayjs from "dayjs";
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
      <section className="post-copyright" aria-label="文章版权信息">
        <div className="post-copyright-heading">
          <span className="post-copyright-eyebrow">本文信息</span>
          <span className="post-copyright-license">CC BY-NC-SA 4.0</span>
        </div>
        <div className="post-copyright-title">{postInfo.title}</div>
        <a
          className="post-copyright-url"
          href={`${siteConfigs.siteUrl}/posts/${postInfo.slug}/`}
        >
          {`${siteConfigs.siteUrl}/posts/${postInfo.slug}/`}
        </a>
        <dl className="post-copyright-details">
          <div>
            <dt>作者</dt>
            <dd>{siteConfigs.author}</dd>
          </div>
          <div>
            <dt>发布于</dt>
            <dd>{dayjs.unix(postInfo.publishTime!).format("YYYY-MM-DD")}</dd>
          </div>
          <div>
            <dt>更新于</dt>
            <dd>{dayjs.unix(postInfo.lastUpdatedTime!).format("YYYY-MM-DD")}</dd>
          </div>
          <div>
            <dt>许可协议</dt>
            <dd>
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh"
                target="_blank"
                rel="noopener noreferrer"
              >
                署名 · 非商业性 · 相同方式共享
              </a>
            </dd>
          </div>
        </dl>
      </section>
      <div id="postend-tagbar">
        <div id="postend-tags">
          {Array.from(new Set(postInfo.tags ?? [])).map((tag) => {
            return (
              <a
                className="postend-tag"
                key={tag}
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
                <Icon icon="solar:calendar-date-bold" />
                {dayjs.unix(previousPost.publishTime!).format("YYYY-MM-DD")}
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
                <Icon icon="solar:calendar-date-bold" />
                {dayjs.unix(nextPost.publishTime!).format("YYYY-MM-DD")}
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
