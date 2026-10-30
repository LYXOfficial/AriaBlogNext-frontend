import { Post } from "interfaces/post";
import { siteConfigs } from "config";
import { fetchPostNavigation } from "utils/api";
import dayjs from "dayjs";
import "styles/PostEnd.css";
import ShareJs from "components/thirdpartyjs/ShareJs";
import Link from "next/link";
import { Icon } from "@iconify/react";
import ImageWithFalldown from "components/ImageWithFalldown";
import React from "react";

export default async function PostEnd({ postInfo }: { postInfo: Post }) {
  const res = await fetchPostNavigation(postInfo.slug ?? "");
  // 边界文章没有上一篇/下一篇，必须保持 null——写成 {} 会让下面的
  // `previousPost ?` 恒为真，渲染出 /posts/undefined 和 Invalid Date。
  let previousPost: Post | null = null,
    nextPost: Post | null = null;
  if (res.ok && res.data) {
    // 新接口的 newer/older 语义正确（旧接口的 previous/next 名实相反）
    previousPost = res.data.newer ?? null;
    nextPost = res.data.older ?? null;
  }
  return (
    <>
      <section className="post-copyright" aria-label="文章版权信息">
        <div className="post-copyright-heading">
          <span className="post-copyright-eyebrow">本文信息</span>
          <span className="post-copyright-license-group">
            {/* 含 AIGC 标签（不分大小写）时，在许可协议右侧标注 AI 生成内容 */}
            {(postInfo.tags ?? []).some((tag) =>
              /^aigc$/i.test(tag.trim()),
            ) && <span className="post-copyright-aigc">AIGC</span>}
            <span className="post-copyright-license">CC BY-NC-SA 4.0</span>
          </span>
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
