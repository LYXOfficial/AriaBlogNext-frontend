"use client"
import { BB } from "interfaces/bb";
// import 'wc-waterfall';
import { siteConfigs } from "@/config";
import relativeTime from "@/utils/reltime";
import { Icon } from "@iconify/react/dist/iconify.js";
import "styles/BB.css";
import { ReactElement, useEffect, useState } from "react";
import { throttle } from "lodash";

export function Speaks() {
    const [speakCols,setSpeakCols]=useState(1);
    const [speakContent,setSpeakContent]=useState<ReactElement[]>([]);
    useEffect(()=>{(async ()=>{
        import("wc-waterfall");
        const res=await fetch(`${siteConfigs.backEndUrl}/get/speaks/speaks?endl=40`);
        if(res.ok){
            let speaksContent:BB[]=(await res.json()).data;
            setSpeakContent(speaksContent.map((item,index)=>{
                return (
                    <div key={index} className="bb-item card-widget">
                        <div className="bb-content" 
                            dangerouslySetInnerHTML={{__html:item.content}}
                        />
                        <div className="bb-bottombar">
                            <span className="bb-time">
                                <Icon icon="fa6-solid:clock"/>
                                <span className="bb-time-text">
                                    {relativeTime(item.time)}
                                </span>
                            </span>
                            <button className="bb-comment-button">
                                <Icon icon="fa6-solid:comment"/>
                            </button>
                        </div>
                    </div>
                );
            }));
            const callBack=throttle(()=>{
                if(window.innerWidth>=900) setSpeakCols(3);
                else if(window.innerWidth>=600) setSpeakCols(2);
                else setSpeakCols(1);
            },200);
            callBack();
            window.addEventListener('resize',callBack);
            return ()=>{
                window.removeEventListener('resize',callBack);
            }
        }
    })()},[]);
    return (
        <wc-waterfall id="bb" gap={15} cols={speakCols}>
            {speakContent}
        </wc-waterfall>
    );
}