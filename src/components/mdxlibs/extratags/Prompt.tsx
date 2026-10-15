"use client";
import { useRef } from "react";

const VIEWPORT_MARGIN = 8;

export default function PromptTag({
  children,
  tip,
}: {
  children: React.ReactNode;
  tip: string;
}) {
  const thisRef = useRef<HTMLSpanElement>(null);

  // 提示框固定居中在触发词上方，靠页面边缘时会溢出屏幕。
  // 显示前先量一次它的位置：水平方向按视口左右边界平移，上方空间不够就翻到下方。
  const keepInViewport = () => {
    const el = thisRef.current;
    if (!el) return;

    // 先还原成 CSS 默认位置再测量，避免上一次的位移叠加
    el.style.transform = "";
    el.classList.remove("flip-down");

    const rect = el.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;

    let offsetX = 0;
    if (rect.left < VIEWPORT_MARGIN) offsetX = VIEWPORT_MARGIN - rect.left;
    else if (rect.right > viewportWidth - VIEWPORT_MARGIN)
      offsetX = viewportWidth - VIEWPORT_MARGIN - rect.right;
    if (offsetX !== 0)
      el.style.transform = `translateX(calc(-50% + ${offsetX}px))`;

    if (rect.top < VIEWPORT_MARGIN) el.classList.add("flip-down");
  };

  return (
    <span
      className="etag-prompt"
      onMouseEnter={() => {
        keepInViewport();
        thisRef.current?.classList.remove("hide");
        thisRef.current?.classList.add("show");
      }}
      onMouseLeave={() => {
        thisRef.current?.classList.remove("show");
        thisRef.current?.classList.add("hide");
      }}
    >
      {children}
      <span className="etag-prompt-tooltip hide" ref={thisRef}>
        {tip}
      </span>
    </span>
  );
}
