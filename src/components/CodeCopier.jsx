"use client"
import { useEffect } from 'react';

export default function CodeCopier(){
    useEffect(()=>{
        const codeBlocks=document.querySelectorAll(".hljs-folder");
        codeBlocks.forEach((block)=>{
            block.querySelector(".hljs-copy").addEventListener("click",()=>{
                let code=block.querySelector(".hljs");
                let range=document.createRange();
                let selection=document.getSelection();
                selection.removeAllRanges();
                range.selectNode(code);
                selection.addRange(range);
                document.execCommand("copy");
                selection.removeAllRanges();
            });
        })
    })
    return <></>
}