import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import "styles/PostCard.css";
import Link from "next/link";
import { Post } from "interfaces/post";
import { siteConfigs } from "config";
import { notFound } from "next/navigation";
import { TwikooCountHome } from "components/thirdpartyjs/Twikoo";
import PostCategoryBar from "components/PostCategoryBar";
import ImageWithFalldown from "./ImageWithFalldown";
import { Category } from "@/interfaces/category";
import React from "react";
import PostCardParallax from "./PostCardParallax";

export default async function Posts({ page }: { page: number }) {
  if (page < 1) return notFound();
  const resm = await fetch(`${siteConfigs.backEndUrl}/get/post/postCount`, {
    next: { revalidate: 7200, tags: ["posts"] },
  });
  if (!resm.ok) return notFound();
  const postTotal = (await resm.json()).count;
  const maxPage =
    Math.ceil(
      Math.max(postTotal - siteConfigs.homeMaxPosts, 0) /
        siteConfigs.pageMaxPosts,
    ) + 1;
  if (page > maxPage) return notFound();
  const offset = siteConfigs.homeMaxPosts - siteConfigs.pageMaxPosts;
  const startl =
    page === 1
      ? 0
      : Math.max((page - 1) * siteConfigs.pageMaxPosts + offset, 0);
  const endl = Math.max(page * siteConfigs.pageMaxPosts + offset, 0);
  const resp = await fetch(
    `${siteConfigs.backEndUrl}/get/post/postsInfo?startl=${startl}&endl=${endl}`,
    { next: { revalidate: 7200, tags: ["posts"] } },
  );
  if (!resp.ok) return notFound();
  const posts: Post[] = (await resp.json()).data ?? [];
  // 分类栏只是装饰，接口失败时降级为空，避免整页崩溃
  let data: Category[] = [];
  try {
    const res = await fetch(
      `${siteConfigs.backEndUrl}/get/category/categories`,
    );
    if (res.ok) data = (await res.json()).data ?? [];
  } catch {
    data = [];
  }
  // 首尾页固定保留；较短的缺口直接补齐，避免出现只省略一页的跳跃。
  const visiblePages = new Set([1, maxPage, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => visiblePages.add(n));
  if (page >= maxPage - 2)
    [maxPage - 3, maxPage - 2, maxPage - 1].forEach((n) => visiblePages.add(n));
  const pageNumbers = [...visiblePages]
    .filter((n) => n >= 1 && n <= maxPage)
    .sort((a, b) => a - b);
  const pagination: (number | string)[] = [];
  pageNumbers.forEach((n, i) => {
    const previous = pageNumbers[i - 1];
    if (i && n - previous === 2) pagination.push(previous + 1);
    else if (i && n - previous > 2) pagination.push(`gap-${previous}`);
    pagination.push(n);
  });
  // 分页连续浏览返回文章区；顶栏与 Logo 的首页入口仍保留 Banner。
  const pageHref = (n: number) => `/page/${n}`;
  return (
    <div id="recent-posts">
      <PostCategoryBar data={data} type="categories" wrap={false} current="" />
      {posts.map((post) => {
        return (
          <div
            className={`recent-post-info post-card card-widget ${startl ? "" : "first-page"}`}
            key={post.title}
          >
            <span className="for-fc post__title">{post.title}</span>
            <div className="for-fc post-meta-date">
              <span className="time for-fc">
                {dayjs.unix(post.publishTime!).format("YYYY-MM-DD")}
              </span>
              <span className="time for-fc">
                {dayjs.unix(post.lastUpdatedTime!).format("YYYY-MM-DD")}
              </span>
            </div>
            <div className="post-banner">
              <Link
                className="post-banner-link"
                href={"/posts/" + post.slug}
                title={post.title}
              >
                <ImageWithFalldown
                  objectPosition={post?.coverFit}
                  className="post-banner-img"
                  src={
                    post.bannerImg ? post.bannerImg : siteConfigs.falldownImg
                  }
                  alt={post.title!}
                  falldownImg={siteConfigs.falldownImg}
                />
              </Link>
            </div>
            <div className="post-info">
              <Link
                className="post-title"
                href={"/posts/" + post.slug}
                title={post.title}
              >
                {post.title}
              </Link>
              <div className="post-content">
                {post.description ? post.description : post.plainContent}
              </div>
              <div className="post-metas">
                <Link
                  className="post-category"
                  href={"/categories/" + post.category}
                  title={post.category}
                >
                  {post.category}
                </Link>
                <div className="post-meta post-publishdate">
                  <Icon icon="solar:calendar-bold" />
                  <span className="post-meta-content">
                    {"发表于 " +
                      dayjs.unix(post.publishTime!).format("YYYY-MM-DD")}
                  </span>
                </div>
                <div className="post-meta post-lastupdatedate">
                  <Icon icon="solar:calendar-bold" />
                  <span className="post-meta-content">
                    {"更新于 " +
                      dayjs.unix(post.lastUpdatedTime!).format("YYYY-MM-DD")}
                  </span>
                </div>
                <div className="post-meta post-tags">
                  <Icon icon="solar:tag-bold" />
                  <span className="post-meta-content">
                    {[...new Set(post.tags ?? [])].slice(0, 5).map((tag) => {
                      return (
                        <Link
                          key={tag}
                          href={"/tags/" + encodeURIComponent(tag)}
                        >
                          {tag}
                        </Link>
                      );
                    })}
                  </span>
                </div>
                <div className="post-meta post-commentcount">
                  <Icon icon="solar:chat-square-dots-bold" />
                  <span className="post-meta-content">{"条评论"}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <nav className="post-card-pgwrap" aria-label="文章列表分页">
        <div className="post-card-pgsummary">
          第 <strong>{page}</strong> / {maxPage} 页 · 共 {postTotal} 篇文章
        </div>
        <div className="post-card-pgcontrols">
          {page > 1 ? (
            <Link
              className="post-card-pgbtn post-card-pgstep"
              href={pageHref(page - 1)}
              rel="prev"
              aria-label="上一页"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m14 6-6 6 6 6" />
              </svg>
            </Link>
          ) : (
            <span
              className="post-card-pgbtn post-card-pgstep disabled"
              aria-disabled="true"
              aria-label="上一页"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m14 6-6 6 6 6" />
              </svg>
            </span>
          )}
          <div className="post-card-pgpages">
            {pagination.map((n) =>
              typeof n === "string" ? (
                <span
                  className="post-card-pgellipsis"
                  key={n}
                  aria-label="省略的页码"
                >
                  …
                </span>
              ) : n === page ? (
                <span
                  className="post-card-pgbtn current"
                  key={n}
                  aria-current="page"
                  aria-label={`第 ${n} 页，当前页`}
                >
                  {n}
                </span>
              ) : (
                <Link
                  className="post-card-pgbtn"
                  key={n}
                  href={pageHref(n)}
                  aria-label={`第 ${n} 页`}
                >
                  {n}
                </Link>
              ),
            )}
          </div>
          {page < maxPage ? (
            <Link
              className="post-card-pgbtn post-card-pgstep"
              href={pageHref(page + 1)}
              rel="next"
              aria-label="下一页"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m10 6 6 6-6 6" />
              </svg>
            </Link>
          ) : (
            <span
              className="post-card-pgbtn post-card-pgstep disabled"
              aria-disabled="true"
              aria-label="下一页"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m10 6 6 6-6 6" />
              </svg>
            </span>
          )}
        </div>
      </nav>
      <PostCardParallax />
      <TwikooCountHome />
    </div>
  );
}
