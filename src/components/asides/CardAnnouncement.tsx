"use client"
import "src/styles/ASide/global.css"
import { Icon } from '@iconify/react';
import "src/styles/ASide/Announcement.css"
import { ReactElement,useEffect,useState } from 'react';
import { annogen } from "src/utils/annogen"

export default function CardInfo({content}:{content:ReactElement}){
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
                <p>{annoContent}</p>
            </div>
        </div>
    );
}