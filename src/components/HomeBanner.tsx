"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { siteConfigs } from "@/config";
import "styles/HomeBanner.css";

/** Distance kept between the navigation bar and the content top when snapped. */
const CONTENT_GAP = 16;
/** How long a snap animation takes, in milliseconds. */
// 600ms：用户嫌 420ms 的上下翻太快（2026-10 调慢）；settle 纠偏的 340ms 是
// 甩动绕过处理器时的一次性修正，保持不变
const SNAP_DURATION = 600;
const HOME_REGION_KEY = "aria:home-region";

export default function HomeBanner({ children }: { children?: ReactNode }) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
    const images = siteConfigs.homeBanner.images
      .map((image) => image.trim())
      .filter(Boolean);
    // 挂载后再随机，避免服务端与客户端选到不同图片造成水合不一致，
    // 也避免先请求列表首图、再请求随机图而浪费流量。
    setBackgroundImage(
      images.length
        ? images[Math.floor(Math.random() * images.length)]
        : siteConfigs.falldownImg.trim() || null,
    );
  }, []);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;

    // The homepage may stream in after the shared navigation has mounted.
    window.dispatchEvent(new Event("scroll"));

    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* ---------------- mouse parallax ---------------- */

    const motion = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const resetParallax = () => {
      banner.style.setProperty("--banner-x", "0px");
      banner.style.setProperty("--banner-y", "0px");
    };
    let lastPointerX = -1;
    const parallax = (event: PointerEvent) => {
      lastPointerX = event.clientX;
      if (!motion.matches || event.pointerType !== "mouse") return;
      if (event.buttons !== 0) {
        resetParallax();
        return;
      }
      const bounds = banner.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        resetParallax();
        return;
      }
      // Keep movement inside the background's overscan, including on wide screens.
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * -2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -2;
      banner.style.setProperty(
        "--banner-x",
        `${x * Math.min(18, bounds.width * 0.02)}px`,
      );
      banner.style.setProperty(
        "--banner-y",
        `${y * Math.min(18, bounds.height * 0.02)}px`,
      );
    };

    /* ---------------- whole-block snap scrolling ---------------- */

    let frame = 0;
    let animating = false;
    let quietUntil = 0;
    // Manual mode (native scrollbar drags) opts out of every snap and settle.
    let manual = false;
    let settleTimer = 0;
    let releaseTimer = 0;
    let lastScrollY = window.scrollY;
    // 1 = moving down the page, -1 = moving up, used to pick the snap target.
    let scrollDirection = 1;
    // Touch scrolls must never be mistaken for a desktop scrollbar drag.
    let lastTouchAt = 0;
    let touching = false;
    let touchOwned = false;
    let touchConsumed = false;
    let touchEligible = false;
    let touchX = 0;
    let touchY = 0;
    let nativeContentGesture = false;
    let nativeBoundarySettled = false;
    let lastWheelAt = -Infinity;
    let wheelFromContent = false;
    const supportsScrollEnd = "onscrollend" in document;
    const scheduleNativeSettle = () => {
      window.clearTimeout(settleTimer);
      // Prefer the browser's actual momentum completion, not a brief pause in
      // scroll events (which can occur while the compositor is still moving).
      if (!supportsScrollEnd && !nativeBoundarySettled)
        settleTimer = window.setTimeout(settle, 500);
    };

    const previousScrollBehavior = root.style.scrollBehavior;
    // Snap animations own their easing; native input must not inherit smooth scrolling.
    root.style.scrollBehavior = "auto";

    const contentTop = () => {
      const content = document.getElementById("main-container");
      if (!content) return null;
      const navHeight =
        document.getElementById("navbar")?.getBoundingClientRect().height ?? 62;
      return Math.max(
        0,
        content.getBoundingClientRect().top +
          window.scrollY -
          navHeight -
          CONTENT_GAP,
      );
    };

    // 只记区域，不沿用浏览器返回时的正文深处坐标；存储受限时仍能正常浏览。
    let restoring = !window.location.hash;
    let restoreFrame = 0;
    const rememberRegion = () => {
      if (restoring || window.location.pathname !== "/") return;
      const top = contentTop();
      if (top === null) return;
      try {
        sessionStorage.setItem(
          HOME_REGION_KEY,
          window.scrollY >= top - 2 ? "content" : "banner",
        );
      } catch {
        // 隐私模式可能禁用存储，不影响滚动。
      }
    };
    if (restoring) {
      let region = "banner";
      try {
        region = sessionStorage.getItem(HOME_REGION_KEY) || region;
      } catch {}
      // 等 App Router 完成导航滚动和首页布局，再恢复一次；不持续锁定视口。
      restoreFrame = requestAnimationFrame(() => {
        restoreFrame = requestAnimationFrame(() => {
          const destination = region === "content" ? contentTop() : 0;
          if (destination !== null) {
            window.scrollTo({ top: destination, behavior: "instant" });
            lastScrollY = window.scrollY;
          }
          restoring = false;
          banner.closest<HTMLElement>("[data-home-restoring]")?.style.removeProperty("visibility");
          window.dispatchEvent(new Event("scroll"));
        });
      });
    }
    if (!restoring) {
      banner.closest<HTMLElement>("[data-home-restoring]")?.style.removeProperty("visibility");
    }
    window.addEventListener("scroll", rememberRegion, { passive: true });
    // 在站内导航改变布局前读取位置，避免卸载时把文章页的坐标记成首页坐标。
    const rememberBeforeNavigation = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (
        !link || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        link.target === "_blank" || link.hasAttribute("download")
      ) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      rememberRegion();
      // App Router 可能先重置滚动、后卸载首页，不能把导航产生的 scroll 写回存储。
      restoring = true;
    };
    document.addEventListener("click", rememberBeforeNavigation, true);
    window.addEventListener("pagehide", rememberRegion);

    function enterManual() {
      cancelAnimationFrame(frame);
      animating = false;
      quietUntil = 0;
      window.clearTimeout(settleTimer);
      manual = true;
      root.setAttribute("data-home-manual-scroll", "");
    }

    function leaveManual() {
      if (!manual) return;
      manual = false;
      root.removeAttribute("data-home-manual-scroll");
      // Never retroactively snap the position a drag ended on.
      quietUntil = performance.now() + 250;
    }

    const animateTo = (destination: number, duration: number) => {
      cancelAnimationFrame(frame);
      const start = window.scrollY;
      const now = performance.now();
      const distance = destination - start;

      if (reducedMotion.matches || Math.abs(distance) < 2) {
        window.scrollTo({ top: destination, behavior: "instant" });
        animating = false;
        quietUntil = performance.now() + 320;
        return;
      }

      animating = true;
      let expected = start;
      const tick = (time: number) => {
        // A scrollbar drag can move the viewport without dispatching pointer events.
        if (Math.abs(window.scrollY - expected) > 4) {
          animating = false;
          if (lastPointerX >= root.clientWidth - 24) {
            enterManual();
          } else {
            // Another input moved the viewport; let the settle pass finish the snap.
            quietUntil = performance.now() + 200;
            window.clearTimeout(settleTimer);
            settleTimer = window.setTimeout(settle, 200);
          }
          return;
        }
        const progress = Math.min(1, (time - now) / duration);
        const eased = 1 - (1 - progress) ** 3;
        window.scrollTo({ top: start + distance * eased, behavior: "instant" });
        expected = window.scrollY;
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          animating = false;
          quietUntil = performance.now() + 320;
        }
      };
      frame = requestAnimationFrame(tick);
    };

    // Safety net for input that bypasses the wheel handler (fast flicks, trackpad
    // momentum, touch swipes, keyboard paging). Only runs once scrolling rests.
    const settle = () => {
      if (manual || animating || touching) return;
      const top = contentTop();
      if (top === null) return;
      const position = window.scrollY;
      if (nativeContentGesture) {
        // A native swipe owns its entire momentum phase. Correct only once,
        // after it has stopped, even if that correction is interrupted.
        if (nativeBoundarySettled || position >= top - 1) return;
        nativeBoundarySettled = true;
        animateTo(top, 340);
        return;
      }
      // Legal stops: the banner top or anything inside the content.
      if (position <= 1 || position >= top - 1) return;
      // A guard from the previous snap must delay this pass, never cancel it.
      const wait = quietUntil - performance.now();
      if (wait > 0) {
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(settle, Math.min(wait + 40, 900));
        return;
      }
      // Follow the swipe direction: down enters the content, up returns to the
      // banner. A swipe never strands the page between the two blocks.
      // 正文开始的同一轮滚轮惯性即使跨过边界，也只能补齐到正文顶。
      animateTo(wheelFromContent ? top : scrollDirection < 0 ? 0 : top, 340);
    };

    const onScroll = () => {
      if (manual) return;
      const position = window.scrollY;
      // Observing native momentum must never write a new scroll position.
      // Each momentum event postpones the single settle pass instead.
      if (nativeContentGesture) {
        lastScrollY = position;
        scheduleNativeSettle();
        return;
      }
      if (position !== lastScrollY) {
        scrollDirection = position > lastScrollY ? 1 : -1;
        lastScrollY = position;
      }
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 150);
    };

    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      // Leave menus, dialogs, inputs and independently scrolling panels alone.
      const target = event.target instanceof Element ? event.target : null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable], [role='dialog'], #navbar, #search-box, #homespeaks-container, #posts-categories-bar",
        )
      ) {
        return;
      }
      for (let el = target; el && el !== document.body; el = el.parentElement) {
        const overflow = getComputedStyle(el).overflowY;
        if (
          /(auto|scroll)/.test(overflow) &&
          el.scrollHeight > el.clientHeight + 1
        ) {
          return;
        }
      }

      // Any deliberate wheel gesture ends manual scrollbar/touch mode.
      nativeContentGesture = false;
      nativeBoundarySettled = false;
      leaveManual();

      const top = contentTop();
      if (top === null) return;

      const now = performance.now();
      const current = window.scrollY;
      // 以整轮输入而非吸附动画时长区分回程，不能把惯性尾段当成第二次操作。
      if (now - lastWheelAt > 240 && !animating) {
        wheelFromContent = current > top + 2;
      }
      lastWheelAt = now;
      if (event.deltaY < 0 && wheelFromContent && current <= top + 2) {
        event.preventDefault();
        return;
      }
      // The landing guard only prevents another upward section transition.
      // Scrolling down into the content must always remain available.
      if (
        (animating || now < quietUntil) &&
        !(event.deltaY > 0 && current >= top - 2)
      ) {
        event.preventDefault();
        return;
      }
      if (animating || now < quietUntil) cancelAnimation();

      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1);

      let destination: number | null = null;
      if (event.deltaY > 0) {
        // Downwards: the first block always stops at the content top.
        if (current < top - 2) destination = top;
      } else if (current > top + 2) {
        // Upwards from inside the content: approach, then land on the content top.
        if (current - top <= Math.max(160, Math.abs(delta) * 1.5))
          destination = top;
      } else if (current > 0) {
        // Already at the content top: the next gesture returns to the banner.
        destination = 0;
      }

      if (destination === null) return;
      event.preventDefault();
      quietUntil = now + 320;
      animateTo(destination, SNAP_DURATION);
    };

    const cancelAnimation = () => {
      cancelAnimationFrame(frame);
      animating = false;
      quietUntil = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      // Taps/clicks take priority over pending snaps; never stop their events.
      cancelAnimation();
      window.clearTimeout(settleTimer);
      nativeBoundarySettled = true;
      // Native scrollbar drags start in the right gutter, and they are always a
      // mouse gesture. Touching the same edge on a phone is an ordinary swipe.
      if (event.pointerType !== "mouse") return;
      if (event.clientX >= root.clientWidth - 16) enterManual();
    };
    const onMouseMove = (event: MouseEvent) => {
      if (event.buttons === 0 || performance.now() - lastTouchAt < 1000) return;
      if (event.clientX >= root.clientWidth - 24) enterManual();
    };
    const onTouchStart = (event: TouchEvent) => {
      const now = performance.now();
      lastTouchAt = now;
      touching = true;
      touchOwned = false;
      touchConsumed = false;
      nativeContentGesture = false;
      nativeBoundarySettled = false;
      const point = event.touches[0];
      touchEligible = event.touches.length === 1 && !!point;
      const target = event.target instanceof Element ? event.target : null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable], [role='dialog'], #navbar, #search-box, #homespeaks-container",
        )
      )
        touchEligible = false;
      for (let el = target; el && el !== document.body; el = el.parentElement) {
        if (
          /(auto|scroll)/.test(getComputedStyle(el).overflowY) &&
          el.scrollHeight > el.clientHeight + 1
        )
          touchEligible = false;
      }
      if (!touchEligible || !point) return;
      touchX = point.clientX;
      touchY = point.clientY;
      const top = contentTop();
      // Only section transitions own gestures; content panning remains native.
      nativeContentGesture = top !== null && window.scrollY > top + 3;
      // Every new finger gets control immediately. Do not inherit a consumed
      // gesture or block a complete swipe merely because a timer is running.
      cancelAnimation();
      if (manual) {
        manual = false;
        root.removeAttribute("data-home-manual-scroll");
      }
      window.clearTimeout(settleTimer);
    };
    const onTouchMove = (event: TouchEvent) => {
      const now = performance.now();
      lastTouchAt = now;
      if (!touchEligible || event.touches.length !== 1) return;
      if (touchConsumed) {
        if (event.cancelable) event.preventDefault();
        return;
      }
      const point = event.touches[0];
      const delta = touchY - point.clientY;
      const dx = point.clientX - touchX;
      if (!touchOwned && Math.abs(delta) <= Math.max(6, Math.abs(dx))) return;
      const top = contentTop();
      if (top === null) return;
      const current = window.scrollY;
      if (nativeContentGesture) {
        // No preventDefault, scrollTo or synthetic momentum inside the content.
        touchY = point.clientY;
        touchX = point.clientX;
        return;
      }
      // Downward page panning at the content top is normal content scrolling.
      if (current >= top - 2 && delta > 0) {
        nativeContentGesture = true;
        touchY = point.clientY;
        return;
      }
      let destination: number | null = null;
      if (delta > 0 && current < top - 2) destination = top;
      else if (delta < 0 && current > 0 && current <= top + 3) destination = 0;
      if (destination === null || !event.cancelable) return;
      event.preventDefault();
      touchOwned = true;
      touchConsumed = true;
      animateTo(destination, SNAP_DURATION);
    };
    const onTouchEnd = () => {
      lastTouchAt = performance.now();
      touching = false;
      if (nativeContentGesture) scheduleNativeSettle();
      if (!touchOwned) return;
      if (touchConsumed) {
        // End this gesture here; its remaining momentum cannot trigger stage 2.
        quietUntil = Math.max(quietUntil, performance.now() + 500);
      }
      touchEligible = false;
      touchOwned = false;
    };
    const onTouchCancel = () => {
      touching = false;
      touchEligible = false;
      touchOwned = false;
      touchConsumed = false;
    };
    const onPointerUp = () => {
      if (!manual) return;
      // Give the drag time to finish its final scroll, then hand control back.
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(leaveManual, 600);
    };

    const onScrollEnd = () => {
      if (
        nativeContentGesture &&
        !touching &&
        !manual &&
        !animating &&
        !nativeBoundarySettled
      )
        settle();
    };

    document.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("wheel", wheel, { passive: false, capture: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });
    window.addEventListener("keydown", cancelAnimation);
    // Window delivery also covers the navigation floating above the banner.
    window.addEventListener("pointermove", parallax, { passive: true });
    window.addEventListener("blur", resetParallax);
    root.addEventListener("pointerleave", resetParallax);
    motion.addEventListener("change", resetParallax);

    return () => {
      cancelAnimationFrame(restoreFrame);
      window.removeEventListener("scroll", rememberRegion);
      document.removeEventListener("click", rememberBeforeNavigation, true);
      window.removeEventListener("pagehide", rememberRegion);
      cancelAnimation();
      window.clearTimeout(settleTimer);
      window.clearTimeout(releaseTimer);
      root.style.scrollBehavior = previousScrollBehavior;
      root.removeAttribute("data-home-manual-scroll");
      document.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("wheel", wheel, true);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("keydown", cancelAnimation);
      window.removeEventListener("pointermove", parallax);
      window.removeEventListener("blur", resetParallax);
      root.removeEventListener("pointerleave", resetParallax);
      motion.removeEventListener("change", resetParallax);
    };
  }, []);

  return (
    <section
      ref={bannerRef}
      className="home-banner"
      data-home-banner
      aria-label="首页欢迎"
    >
      <div
        className="home-banner-background"
        style={{
          backgroundImage: backgroundImage
            ? `url(${JSON.stringify(backgroundImage)})`
            : undefined,
        }}
        aria-hidden="true"
      />
      <div className="home-banner-intro">
        <a
          className="home-banner-welcome"
          href={siteConfigs.homeBanner.welcomeUrl}
        >
          {siteConfigs.homeBanner.welcome}
        </a>
        <h1 className="home-banner-headline">
          {siteConfigs.homeBanner.headline.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </h1>
        <div id="home-menu-buttons-slot" aria-hidden="true" />
      </div>
      <div className="home-banner-bottom">
        <span className="home-banner-scroll-hint" aria-label="向下滚动查看文章">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {children}
      </div>
    </section>
  );
}
