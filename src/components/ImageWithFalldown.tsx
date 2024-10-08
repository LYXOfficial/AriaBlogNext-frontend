"use client";
import Image from "next/image";
import { useState } from "react";
export default function ImageWithFalldown({className,src,alt,falldownImg,dataSrc,objectPosition="center"}:{className:string,dataSrc?:string,src:string,alt:string,falldownImg:string,objectPosition?:string}) {
    const [srcNow,setSrcNow]=useState(src);
    return (
        <Image 
            fill={true} 
            objectPosition={objectPosition} 
            className={className} 
            src={srcNow}
            data-src={dataSrc}
            overrideSrc={src} 
            alt={alt} 
            onError={()=>{
                setSrcNow(falldownImg);
            }} 
            blurDataURL="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
        />
    );
}
export function ImgWithFalldown({className,src,alt,dataSrc,falldownImg}:{className:string,dataSrc?:string,src:string,alt:string,falldownImg:string}) {
    const [srcNow,setSrcNow]=useState(src);
    return (
        <img 
            className={className} 
            src={srcNow} 
            data-src={dataSrc} 
            alt={alt}
            onError={()=>{
                setSrcNow(falldownImg);
            }}
        />
    );
}