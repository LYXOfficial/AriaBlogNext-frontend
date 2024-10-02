"use client";
import Image from "next/image";
import { SyntheticEvent } from "react";
export default function ImageWithFalldown({className,src,alt,falldownImg,objectPosition="center"}:{className:string,src:string,alt:string,falldownImg:string,objectPosition?:string}) {
    return (
        <Image 
            fill={true} 
            objectPosition={objectPosition} 
            className={className} 
            src={src}
            overrideSrc={src} 
            alt={alt} 
            onError={(e:SyntheticEvent<HTMLImageElement>)=>{
                (e.target as HTMLImageElement).src=falldownImg;
            }} 
            blurDataURL="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
        />
    );
}
export function ImgWithFalldown({className,src,alt,falldownImg}:{className:string,src:string,alt:string,falldownImg:string}) {
    return (
        <img 
            className={className} 
            src={src} 
            alt={alt}
            onError={(e:SyntheticEvent<HTMLImageElement>)=>{
                (e.target as HTMLImageElement).src=falldownImg;
            }}
        />
    );
}