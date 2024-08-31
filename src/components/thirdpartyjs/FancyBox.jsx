"use client"
import { useEffect } from "react"
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export default function FancyBox() {
    useEffect(()=>{
        Fancybox.bind("[data-fancybox]",{
            toolbar  : true,
            smallBtn : true,});
    },[]);
    return <></>
}