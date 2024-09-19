"use client";
import Image from "next/image";
export default function ImageWithFalldown({className,src,alt,falldownImg,objectPosition="center"}:{className:string,src:string,alt:string,falldownImg:string,objectPosition?:string}) {
    return <Image fill={true} objectPosition={objectPosition} className={className} src={src} overrideSrc={src} alt={alt} onError={(e:any)=>{e.target.src=falldownImg}} blurDataURL="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="/>;
}
export function ImgWithFalldown({className,src,alt,falldownImg}:{className:string,src:string,alt:string,falldownImg:string}) {
    return <img className={className} src={src} alt={alt} onError={(e:any)=>{e.target.src=falldownImg}}/>;
}