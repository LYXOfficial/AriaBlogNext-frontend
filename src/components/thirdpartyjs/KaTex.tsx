"use client";
import renderMathInText from "katex/contrib/auto-render";
import { useEffect } from "react";
import "katex/dist/katex.min.css";
import React from "react";

export default function KaTex() {
  useEffect(() => {
    (async () => {
      renderMathInText(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    })();
  }, []);
  return <></>;
}
