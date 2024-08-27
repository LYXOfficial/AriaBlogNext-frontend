"use client"
import { useEffect } from "react";

export default function HLJSNum(){
    useEffect(()=>{
        const hljslm=require("src/utils/highlightjs-line-number")
        Array.from(document.querySelectorAll('.hljs code')).map(block=>{
                if(block.getAttribute("numbered")) return;
                block.setAttribute("numbered",true);
                hljslm.lineNumbersBlock(block);
            }
        )
    });
    return <></>;
}