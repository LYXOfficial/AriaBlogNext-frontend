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
    if (!wrap)
      barRef.current?.addEventListener("wheel", (e: WheelEvent) => {
        e.stopPropagation();
        e.preventDefault();
        barRef.current!.scrollLeft += e.deltaY;
      });
  }, [wrap]);
  return (
    <div id="posts-categories-bar" className="card-widget">
      <Link className="post-categories-bar-icon-link" href={`/${type}`}>
        <Icon
          icon={type == "categories" ? "fa6-solid:list-ul" : "fa6-solid:tags"}
        />
      </Link>
      <div
        id="posts-categories-bar-container"
        ref={barRef}
        style={{ flexWrap: wrap ? "wrap" : "nowrap", rowGap: wrap ? 3 : 0 }}
      >
        {data.map((item: Category) => {
          return (
            <Link
              className={`posts-categories-bar-item${item.name == current ? " current" : ""}`}
              key={item.name}
              href={`/${type}/${item.name}`}
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
