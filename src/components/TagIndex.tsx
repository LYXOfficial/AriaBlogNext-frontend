"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@/interfaces/category";

export default function TagIndex({
  tags,
  type = "tags",
  current = "",
}: {
  tags: Category[];
  type?: "tags" | "categories";
  current?: string;
}) {
  const label = type === "tags" ? "标签" : "分类";
  const [sort, setSort] = useState<"name" | "count">("name");
  const ordered = [...tags].sort(
    (a, b) =>
      (sort === "count" ? b.count - a.count : 0) ||
      a.name.localeCompare(b.name, "zh-CN"),
  );
  return (
    <section aria-label={`${label}索引`}>
      <div className="tag-index-toolbar">
        <div
          className="tag-index-sort"
          role="group"
          aria-label={`${label}排序`}
        >
          <button
            type="button"
            aria-pressed={sort === "name"}
            onClick={() => setSort("name")}
          >
            按名称
          </button>
          <button
            type="button"
            aria-pressed={sort === "count"}
            onClick={() => setSort("count")}
          >
            按文章数
          </button>
        </div>
      </div>
      <ul className="tag-index-list">
        {ordered.map((tag) => (
          <li key={tag.name}>
            <Link
              className="tag-index-link"
              href={`/${type}/${encodeURIComponent(tag.name)}`}
              aria-current={current === tag.name ? "page" : undefined}
              aria-label={`${tag.name}，${tag.count} 篇文章`}
            >
              <span
                className={type === "tags" ? "tag-index-hash" : "tag-index-dot"}
                aria-hidden="true"
              >
                {type === "tags" ? "#" : ""}
              </span>
              <span className="tag-index-name">{tag.name}</span>
              <span className="tag-index-count">{tag.count}</span>
            </Link>
          </li>
        ))}
      </ul>
      {!tags.length && (
        <p className="tag-index-label">暂时没有{label}，稍后再来看看吧。</p>
      )}
    </section>
  );
}
