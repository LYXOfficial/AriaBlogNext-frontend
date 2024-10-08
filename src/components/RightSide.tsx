"use client";
import CommentBarrage from "@/components/thirdpartyjs/CommentBarrage";
import { RightButtonsPosts, RightButtonsPages, RightButtonsHome } from 'components/RightButtons';
import { useState, useEffect } from "react";
import React from "react";

export function PostRightSide() {
    const [barrageShow,setBarrageShow]=useState(2);
    useEffect(()=>{
        if(barrageShow!=2){
            document.querySelector("#barrage-container")!.className=barrageShow?"show":"hide";
            localStorage.setItem("barrageShow",barrageShow?"true":"false");
        }
    },[barrageShow]);
    useEffect(()=>{
        if(localStorage.getItem("barrageShow")=="false")
            setBarrageShow(0);
        else setBarrageShow(1);
    },[]);
    return (<>
        <RightButtonsPosts toggleBarrage={()=>setBarrageShow(bs=>Number(!bs))}/>
        <CommentBarrage toggleBarrage={()=>setBarrageShow(bs=>Number(!bs))}/>
    </>);
}
export function PageRightSide() {
    const [barrageShow,setBarrageShow]=useState(2);
    useEffect(()=>{
        if(barrageShow!=2){
            document.querySelector("#barrage-container")!.className=barrageShow?"show":"hide";
            localStorage.setItem("barrageShow",barrageShow?"true":"false");
        }
    },[barrageShow]);
    useEffect(()=>{
        if(localStorage.getItem("barrageShow")=="false")
            setBarrageShow(0);
        else setBarrageShow(1);
    },[]);
    return (<>
        <RightButtonsPages toggleBarrage={()=>setBarrageShow(bs=>Number(!bs))}/>
        <CommentBarrage toggleBarrage={()=>setBarrageShow(bs=>Number(!bs))}/>
    </>);
}
export function HomeRightSide() {
    return <RightButtonsHome/>;
}