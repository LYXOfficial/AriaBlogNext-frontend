"use client";

import { useEffect, useState } from "react";
import "styles/InitialLoader.css";

// 最短展示时长：避免缓存命中时一闪而过；
// 最长等待上限：即使图床或图标 CDN 很慢/断网，也不把用户卡死在加载页。
const MIN_DISPLAY_MS = 450;
const MAX_WAIT_MS = 2800;
const LEAVE_DURATION_MS = 560;

function waitForHeroImage(): Promise<void> {
  const img = document.querySelector<HTMLImageElement>(
    ".home-banner-background, .post-banner-bg",
  );
  if (!img) return Promise.resolve();
  if (img.complete) {
    return img.naturalWidth > 0 && typeof img.decode === "function"
      ? img.decode().catch(() => {})
      : Promise.resolve();
  }
  return new Promise((resolve) => {
    const done = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", done);
      resolve();
    };
    const onLoad = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", done);
      if (typeof img.decode === "function") {
        img.decode().catch(() => {}).finally(resolve);
      } else {
        resolve();
      }
    };
    img.addEventListener("load", onLoad, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

function waitForNavIcons(): Promise<void> {
  const nav = document.getElementById("navbar");
  if (!nav || nav.querySelector("svg")) return Promise.resolve();
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (nav.querySelector("svg")) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(nav, { childList: true, subtree: true });
    // Iconify 外网超时时兜底放行，由外层 MAX_WAIT_MS 统一兜底即可
    window.setTimeout(() => {
      observer.disconnect();
      resolve();
    }, MAX_WAIT_MS);
  });
}

function waitTwoFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export default function InitialLoader() {
  const [hydrated, setHydrated] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setHydrated(true);
    let cancelled = false;
    let removeTimer = 0;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const minDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, reduced ? 0 : MIN_DISPLAY_MS);
    });
    const maxCap = new Promise<void>((resolve) => {
      window.setTimeout(resolve, MAX_WAIT_MS);
    });

    // 等待：最短展示时间 +（首屏头图解码完成 & 顶栏图标就绪 & 布局落定），
    // 任意外部资源过慢时由 MAX_WAIT_MS 兜底退出，绝不无限等待。
    const ready = Promise.all([
      waitForHeroImage(),
      waitForNavIcons(),
      waitTwoFrames(),
    ]);

    Promise.all([minDelay, Promise.race([ready, maxCap])]).then(() => {
      if (cancelled) return;
      setLeaving(true);
      removeTimer = window.setTimeout(
        () => {
          if (!cancelled) setFinished(true);
        },
        reduced ? 0 : LEAVE_DURATION_MS,
      );
    });

    return () => {
      cancelled = true;
      if (removeTimer) window.clearTimeout(removeTimer);
    };
  }, []);

  if (finished) return null;
  return (
    <div
      className={`initial-loader${hydrated ? " initial-loader-hydrated" : ""}${leaving ? " initial-loader-leaving" : ""}`}
      aria-hidden="true"
    >
      <div className="initial-loader-content">
        <span className="initial-loader-ring" />
        <span className="initial-loader-label">奋力加载中…</span>
      </div>
    </div>
  );
}
