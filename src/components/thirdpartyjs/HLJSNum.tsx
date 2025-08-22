"use client";
import { useEffect } from "react";
import React from "react";
export default function HLJSNum() {
  useEffect(() => {
    (async () => {
      const hljslm = require("utils/highlightjs-line-number");
      Array.from(document.querySelectorAll(".hljs code")).map((block) => {
        if (block.getAttribute("numbered")) return;
        block.setAttribute("numbered", "true");
        hljslm.lineNumbersBlock(block);
      });
    })();
  }, []);
  return <></>;
}
