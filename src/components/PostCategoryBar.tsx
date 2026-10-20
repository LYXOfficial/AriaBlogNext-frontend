"use client";
import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";
import { Category } from "interfaces/category";
import "styles/PostCategoryBar.css";
import Link from "next/link";

export default function PostCategoryBar({
  data,
  type,
  current = "",
  wrap = false,
}: {
  data: Category[];
  type: "categories" | "tags";
  current: string;
  wrap: boolean;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const bar = barRef.current;
    if (wrap || !bar) return;
    const onWheel = (event: WheelEvent) => {
      // 缩放手势交给浏览器；其余滚轮即使到达两端，也不穿透到页面。
      if (event.ctrlKey || event.metaKey) return;
      event.stopPropagation();
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const scale = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? bar.clientWidth : 1;
      bar.scrollBy({ left: delta * scale, behavior: "instant" });
    };
    bar.addEventListener("wheel", onWheel, { passive: false });
    return () => bar.removeEventListener("wheel", onWheel);
  }, [wrap]);
  return (
    <div id="posts-categories-bar" className="card-widget">
      <Link className="post-categories-bar-icon-link" href="/page/1" aria-label="全部文章">
        <Icon
          icon={type == "categories" ? "solar:list-bold" : "solar:tag-horizontal-bold"}
        />
      </Link>
      <div
        id="posts-categories-bar-container"
        ref={barRef}
        style={{ flexWrap: wrap ? "wrap" : "nowrap", rowGap: wrap ? 3 : 0 }}
      >
        {(data ?? []).map((item: Category) => {
          return (
            <Link
              className={`posts-categories-bar-item${item.name == current ? " current" : ""}`}
              key={item.name}
              href={`/${type}/${encodeURIComponent(item.name)}`}
              aria-current={item.name === current ? "page" : undefined}
              ref={item.name == current ? currentRef : null}
            >
              <span className="posts-categories-bar-item-name">
                {item.name}
              </span>
              <span className="posts-categories-bar-item-count">
                {item.count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
