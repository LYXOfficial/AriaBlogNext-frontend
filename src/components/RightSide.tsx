"use client";
import dynamic from "next/dynamic";
import {
  RightButtonsPosts,
  RightButtonsPages,
  RightButtonsHome,
} from "components/RightButtons";
import { useState, useEffect } from "react";
import React from "react";

// 仅在文章页和带评论弹幕的独立页按需加载，避免全站 13 个仅用 HomeRightSide
// 的页面（首页、分页、归档、分类、标签、友链、留言板等）连带打包 swiper 与 lodash。
const CommentBarrage = dynamic(
  () => import("@/components/thirdpartyjs/CommentBarrage"),
  { ssr: false },
);

export function PostRightSide() {
  const [barrageShow, setBarrageShow] = useState(2);
  useEffect(() => {
    if (barrageShow != 2) {
      localStorage.setItem("barrageShow", barrageShow ? "true" : "false");
    }
  }, [barrageShow]);
  useEffect(() => {
    if (localStorage.getItem("barrageShow") == "false") setBarrageShow(0);
    else setBarrageShow(1);
  }, []);
  return (
    <>
      <RightButtonsPosts
        toggleBarrage={() => setBarrageShow((bs) => Number(!bs))}
      />
      <CommentBarrage
        show={barrageShow !== 0}
        toggleBarrage={() => setBarrageShow((bs) => Number(!bs))}
      />
    </>
  );
}
export function PageRightSide() {
  const [barrageShow, setBarrageShow] = useState(2);
  useEffect(() => {
    if (barrageShow != 2) {
      localStorage.setItem("barrageShow", barrageShow ? "true" : "false");
    }
  }, [barrageShow]);
  useEffect(() => {
    if (localStorage.getItem("barrageShow") == "false") setBarrageShow(0);
    else setBarrageShow(1);
  }, []);
  return (
    <>
      <RightButtonsPages
        toggleBarrage={() => setBarrageShow((bs) => Number(!bs))}
      />
      <CommentBarrage
        show={barrageShow !== 0}
        toggleBarrage={() => setBarrageShow((bs) => Number(!bs))}
      />
    </>
  );
}
export function HomeRightSide() {
  return <RightButtonsHome />;
}
