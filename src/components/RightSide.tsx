"use client";
import CommentBarrage from "@/components/thirdpartyjs/CommentBarrage";
import {
  RightButtonsPosts,
  RightButtonsPages,
  RightButtonsHome,
} from "components/RightButtons";
import { useState, useEffect } from "react";

export function PostRightSide() {
  const [barrageShow, setBarrageShow] = useState(2);
  function toggleBarrage() {
    setBarrageShow(barrageShow == 1 ? 0 : 1);
  }
  useEffect(() => {
    if (barrageShow != 2) {
      document.querySelector("#barrage-container")!.className = barrageShow
        ? "show"
        : "hide";
      localStorage.setItem("barrageShow", barrageShow ? "true" : "false");
    }
  }, [barrageShow]);
  useEffect(() => {
    if (localStorage.getItem("barrageShow") == "false") setBarrageShow(0);
    else setBarrageShow(1);
  }, []);
  return (
    <>
      <RightButtonsPosts toggleBarrage={toggleBarrage} />
      <CommentBarrage toggleBarrage={toggleBarrage} />
    </>
  );
}
export function PageRightSide() {
  const [barrageShow, setBarrageShow] = useState(2);
  function toggleBarrage() {
    setBarrageShow(barrageShow == 1 ? 0 : 1);
  }
  useEffect(() => {
    if (barrageShow != 2) {
      document.querySelector("#barrage-container")!.className = barrageShow
        ? "show"
        : "hide";
      localStorage.setItem("barrageShow", barrageShow ? "true" : "false");
    }
  }, [barrageShow]);
  useEffect(() => {
    if (localStorage.getItem("barrageShow") == "false") setBarrageShow(0);
    else setBarrageShow(1);
  }, []);
  return (
    <>
      <RightButtonsPages toggleBarrage={toggleBarrage} />
      <CommentBarrage toggleBarrage={toggleBarrage} />
    </>
  );
}
export function HomeRightSide() {
  return <RightButtonsHome />;
}
