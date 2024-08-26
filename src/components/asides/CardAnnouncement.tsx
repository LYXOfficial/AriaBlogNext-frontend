"use client"
import "../../styles/ASide/global.css"
import { Icon } from '@iconify/react';
import "../../styles/ASide/Announcement.css"
import { useRef,useEffect,useState } from 'react';
import annogen from "../../utils/annogen"

export default function CardInfo({content}:any){
    const annoRef=useRef(null);
    const [annoContent,setAnnoContent]=useState(content);
    useEffect(()=>{
        (async ()=>{
            setAnnoContent(await annogen());
        })();
    },[]);
    return (
        <div className="card-widget card-aside card-announcement">
            <div className="card-headline">
                <Icon icon="fa6-solid:bullhorn" />
                <span className="card-title">公告</span>
            </div>
            <div className="card-body">
                <p ref={annoRef}>{annoContent}</p>
            </div>
        </div>
    );
}