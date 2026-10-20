"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import "styles/MenuButtons.css";

export default function MenuButtons({ pathname, onSearch, onRandom, hidden, transparent }: {
  pathname: string;
  onSearch: () => void;
  onRandom: () => void;
  hidden: boolean;
  transparent: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const group = groupRef.current;
    if (!group) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let flight: Animation | null = null;
    let previousMode: boolean | null = null;
    let disposed = false;
    let bannerSlot: HTMLElement | null = null;
    let dock: HTMLElement | null = null;
    let dirty = true;
    let bannerBottom = 0;
    let bannerRect: { left: number; top: number; width: number; height: number } | null = null;
    let dockRect: DOMRect | null = null;
    let lastGeometry = "";
    const navTransitions = new Set<string>();
    const mobileQuery = matchMedia("(max-width: 768px)");
    const position = () => {
      frame = 0;
      if (!dock) return;
      const mobile = mobileQuery.matches;
      // sticky 位移与 transform 动画不会触发 ResizeObserver，停靠点必须读取当前帧。
      dockRect = dock.getBoundingClientRect();
      if (dirty) {
        const rect = bannerSlot?.getBoundingClientRect();
        bannerRect = rect ? { left: rect.left, top: rect.top + window.scrollY, width: rect.width, height: rect.height } : null;
        bannerBottom = (document.querySelector("[data-home-banner]")?.getBoundingClientRect().bottom ?? 0) + window.scrollY;
        dirty = false;
      }
      // 留一点回程余量，滚动边界附近不会反复起飞；不写入任何滚动位置。
      // 手机只切换位置，不飞行；不缓存会随导航移动的视口坐标。
      const inBanner = !!bannerRect && (mobile
        ? bannerBottom - window.scrollY > dockRect!.bottom + 16
        : window.scrollY < (previousMode === true ? 100 : 40));
      const changed = previousMode !== inBanner;
      const before = changed && previousMode !== null && !mobile && !reduced.matches ? group.getBoundingClientRect() : null;
      if (mobile || reduced.matches) flight?.cancel();
      const rect = inBanner
        ? { ...bannerRect!, top: bannerRect!.top - window.scrollY }
        : dockRect!;
      if (changed || group.dataset.mobileBanner !== String(mobile && inBanner)) {
        group.dataset.banner = String(inBanner);
        group.dataset.mobileBanner = String(mobile && inBanner);
      }
      const geometry = `${rect.left},${rect.top},${rect.width},${rect.height}`;
      if (geometry !== lastGeometry) {
        Object.assign(group.style, {
          left: `${rect.left}px`, top: `${rect.top}px`,
          width: `${rect.width}px`, height: `${rect.height}px`, visibility: "visible",
        });
        lastGeometry = geometry;
      }
      if (previousMode !== null && previousMode !== inBanner) {
        // 同一组真实按钮做 FLIP，快速反向时从当前视觉位置续接，不复制可点击元素。
        flight?.cancel();
        if (before && rect.width > 0 && rect.height > 0) {
          flight = group.animate([
            { transform: `translate(${before.left - rect.left}px, ${before.top - rect.top}px) scale(${before.width / rect.width}, ${before.height / rect.height})` },
            { transform: "translate(0, 0) scale(1, 1)" },
          ], { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
        }
      }
      previousMode = inBanner;
      if (navTransitions.size && !disposed) schedule();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(position);
    };
    const invalidate = () => { dirty = true; schedule(); };
    const observer = new ResizeObserver(invalidate);
    observer.observe(document.documentElement);
    // 只在等待流式占位时观察全页；找到后立即断开，避免评论、页脚更新触发测量。
    const discover = () => {
      dock = document.getElementById("nav-menu-buttons-slot");
      bannerSlot = pathname === "/" ? document.getElementById("home-menu-buttons-slot") : null;
      if (dock) observer.observe(dock);
      if (bannerSlot) observer.observe(bannerSlot);
      const nav = document.getElementById("navbar");
      if (nav) observer.observe(nav);
      invalidate();
      return !!dock && (pathname !== "/" || !!bannerSlot);
    };
    const mutation = new MutationObserver(() => { if (discover()) mutation.disconnect(); });
    if (!discover()) mutation.observe(document.body, { childList: true, subtree: true });
    document.fonts.ready.then(() => { if (!disposed) invalidate(); });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", invalidate);
    const nav = document.getElementById("navbar");
    // 只跟踪导航本身，避免菜单子元素的 hover 动画启动持续测量。
    const trackTransition = (event: TransitionEvent) => {
      if (event.target !== nav) return;
      if (event.type === "transitionrun") navTransitions.add(event.propertyName);
      else navTransitions.delete(event.propertyName);
      invalidate();
    };
    const navMutation = new MutationObserver(invalidate);
    if (nav) navMutation.observe(nav, { attributes: true, attributeFilter: ["class"] });
    nav?.addEventListener("transitionrun", trackTransition);
    nav?.addEventListener("transitionend", trackTransition);
    nav?.addEventListener("transitioncancel", trackTransition);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      flight?.cancel();
      nav?.removeEventListener("transitionrun", trackTransition);
      nav?.removeEventListener("transitionend", trackTransition);
      nav?.removeEventListener("transitioncancel", trackTransition);
      navMutation.disconnect();
      navTransitions.clear();
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", invalidate);
    };
  }, [mounted, pathname]);

  if (!mounted) return null;
  return createPortal(
    <div ref={groupRef} className="menu-actions" data-transparent={transparent} aria-label="快捷操作" hidden={hidden}>
      <button className="menu-actions-button" title="搜索" onClick={onSearch}>
        <Icon icon="solar:magnifer-linear" /><span>搜索</span>
      </button>
      <button className="menu-actions-button" title="随便逛逛" onClick={onRandom}>
        <Icon icon="solar:plain-2-linear" /><span>随便逛逛</span>
      </button>
      <a className="menu-actions-button" title="开往" href="https://travellings.cn/go.html">
        <Icon icon="solar:tram-linear" /><span>开往</span>
      </a>
    </div>, document.body,
  );
}
