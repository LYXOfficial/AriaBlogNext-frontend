"use client";

import { useEffect } from "react";

/** 增强卡片与封面视差，不把文章数据搬进客户端，也不创建常驻动画。 */
export default function PostCardParallax() {
  useEffect(() => {
    const root = document.getElementById("recent-posts");
    if (!root) return;
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let active: HTMLElement | null = null;
    let rect: DOMRect | null = null;
    let frame = 0;
    let x = 0;
    let y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      active?.style.removeProperty("--card-parallax-x");
      active?.style.removeProperty("--card-parallax-y");

      active = null;
      rect = null;
    };
    const move = (event: PointerEvent) => {
      if (!pointer.matches || motion.matches || event.pointerType !== "mouse")
        return;
      const card =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(".post-card")
          : null;
      if (!card || !root.contains(card)) {
        reset();
        return;
      }
      if (card !== active) {
        reset();
        active = card;
        // 每次进入卡片仅测一次，滚动/尺寸变化时重置，避免逐帧强制布局。
        rect = card.getBoundingClientRect();
      }
      if (!rect) return;
      x =
        Math.max(
          -1,
          Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
        ) * 2;
      y =
        Math.max(
          -1,
          Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
        ) * 1.5;
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          active?.style.setProperty("--card-parallax-x", `${x.toFixed(2)}px`);
          active?.style.setProperty("--card-parallax-y", `${y.toFixed(2)}px`);
        });
    };
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", reset);
    window.addEventListener("scroll", reset, { passive: true });
    window.addEventListener("resize", reset);
    window.addEventListener("blur", reset);
    pointer.addEventListener("change", reset);
    motion.addEventListener("change", reset);
    return () => {
      reset();
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", reset);
      window.removeEventListener("resize", reset);
      window.removeEventListener("blur", reset);
      pointer.removeEventListener("change", reset);
      motion.removeEventListener("change", reset);
    };
  }, []);
  return null;
}
