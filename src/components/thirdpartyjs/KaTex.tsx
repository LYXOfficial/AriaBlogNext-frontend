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
      // 不在 KaTeX 内部盒子上滚动：字形的细小溢出会让短公式也出现滚动条。
      document
        .querySelectorAll<HTMLElement>("#post-maincontent .katex")
        .forEach((formula) => {
          if (formula.closest(".katex-display, .aria-math-inline")) return;
          const wrapper = document.createElement("span");
          wrapper.className = "aria-math-inline";
          formula.replaceWith(wrapper);
          wrapper.append(formula);
        });
    })();
  }, []);
  return <></>;
}
