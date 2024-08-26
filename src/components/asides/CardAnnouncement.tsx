"use client"
import "../../styles/ASide/global.css"
import { Icon } from '@iconify/react';
import "../../styles/ASide/Announcement.css"
import { useRef, useEffect } from 'react';
import annogen from "../../utils/annogen"
import Link from "next/link";

export default function CardInfo({content}:any){
    const annoRef=useRef(0);
    useEffect(()=>{
        (async ()=>{
            const annoContent=await annogen();
            document.querySelector(".card-announcement>.card-body>p").innerHTML=annoContent;
        })();
    },[])
    return (
        <div className="card-widget card-aside card-announcement">
            <div className="card-headline">
                <Icon icon="fa6-solid:bullhorn" />
                <span className="card-title">公告</span>
            </div>
            <div className="card-body">
                <p ref={annoRef}>{content}</p>
            </div>
        </div>
    );
}