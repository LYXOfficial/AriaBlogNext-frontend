"use client";
import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";
import { siteConfigs } from "@/config";
import { Category } from "interfaces/category";
import "styles/PostCategoryBar.css";

export default function PostCategoryBar({ data }: { data: Category[] }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    barRef.current?.addEventListener("wheel", (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      barRef.current!.scrollLeft += e.deltaY;
    });
  }, []);
  return (
    <div id="posts-categories-bar" className="card-widget">
      <Icon icon="fa6-solid:list-ul" />
      <div id="posts-categories-bars-container" ref={barRef}>
        {data.map((item: any) => {
          return (
            <div className="posts-categories-bar-item" key={item.name}>
              <span className="posts-categories-bar-item-name">
                {item.name}
              </span>
              <span className="posts-categories-bar-item-count">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
