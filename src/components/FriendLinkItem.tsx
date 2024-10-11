"use client";
import { Icon } from "@iconify/react";
import { ReactElement, useRef } from "react";
import { FriendLink } from "interfaces/friendlink";
import { siteConfigs } from "@/config";

export function FriendLinkItem({link}:{link:FriendLink}) {
    const imageRef=useRef<HTMLImageElement>(null);
    let latencyIcon:ReactElement=<></>;
    if(link.latency!>0){
        if(link.latency!<=1)
            latencyIcon=<Icon icon="system-uicons:signal-full"/>;
        else if(link.latency!<=2)
            latencyIcon=<Icon icon="system-uicons:signal-medium"/>;
        else if(link.latency!<=3)
            latencyIcon=<Icon icon="system-uicons:signal-low"/>;
        else
            latencyIcon=<Icon icon="system-uicons:signal-none"/>;
    }
    else latencyIcon=<Icon icon="system-uicons:close" className="flink-none-icon"/>;
    return (
        <a 
            className="flink-item cf-friends-link" 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            id={`flink-${link.id}`}
        >
            <style>
                {`
                    #flink-${link.id}{
                        background-color:${link.color??"#888888"};
                        background-color:color-mix(in srgb,${link.color??"#888888"},transparent 25%);
                        color:white;
                    }
                `}
            </style>
            <div className="flink-avatar">
                <img 
                    className="flink-avatar-img lazy-img cf-friends-avatar" 
                    src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" 
                    data-src={link.avatar} 
                    alt={link.name} 
                    ref={imageRef}
                    onError={()=>imageRef.current!.src=siteConfigs.falldownAvatar}
                />
            </div>
            <span className="flink-name cf-friends-name">{link.name}</span>
            <span className="flink-desc">{link.description}</span>
            <span className="flink-status" title={link.latency!>0?"加载: "+Math.round(link.latency!*1000)+"ms":"不可达"}>
                {latencyIcon}
                {/* {link.latency!>0?`${link.latency}s`:""} */}
            </span>
        </a>
    );
}