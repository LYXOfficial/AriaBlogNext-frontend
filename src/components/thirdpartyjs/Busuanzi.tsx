"use client";
import { useEffect } from "react";
import React from "react";

export default function Busuanzi() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn1.tianli0.top/npm/penndu@1.0.0/bsz.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return <></>;
}
