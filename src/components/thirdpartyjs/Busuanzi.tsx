"use client";
import { useEffect } from "react";
import React from "react";

export default function Busuanzi() {
  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    const load = () => {
      script = document.createElement("script");
      script.src = "https://testingcf.jsdelivr.net/npm/penndu@1.0.0/bsz.js";
      script.async = true;
      document.body.appendChild(script);
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let timer = 0;
    let idle = 0;
    if (typeof w.requestIdleCallback === "function") {
      idle = w.requestIdleCallback(load, { timeout: 2000 });
    } else {
      timer = window.setTimeout(load, 800);
    }
    return () => {
      if (idle && typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
      if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);
  return <></>;
}
