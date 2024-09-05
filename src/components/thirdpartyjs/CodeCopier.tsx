"use client";
import { useEffect,useCallback } from'react';
import { debounce }from'lodash';

export default function CodeCopier(){
    const handleCopyClick=useCallback(debounce((block)=>{
        const code=block.querySelector(".hljs");
        const range=document.createRange();
        const selection=document.getSelection();
        selection!.removeAllRanges();
        range.selectNode(code);
        selection!.addRange(range);
        document.execCommand("copy");
        selection!.removeAllRanges();
    },100),[]);
    const handleWrapperClick=useCallback(debounce((block)=>{
        const code=block.querySelector(".hljs");
        code.classList.toggle("wrap");
        const button=block.querySelector(".hljs-wrapper");
        button.classList.toggle("wrap");
    },200),[]);
    useEffect(()=>{
        const codeBlocks=document.querySelectorAll(".hljs-folder");
        codeBlocks.forEach((block)=>{
            const copyButton=block.querySelector(".hljs-copy");
            const wrapper=block.querySelector(".hljs-wrapper");
            if(copyButton) copyButton.addEventListener("click",()=>handleCopyClick(block));
            if(wrapper) wrapper.addEventListener("click",()=>handleWrapperClick(block));
        });
        return()=>{
            codeBlocks.forEach((block)=>{
                const copyButton=block.querySelector(".hljs-copy");
                const wrapper=block.querySelector(".hljs-wrapper");
                if(copyButton) copyButton.removeEventListener("click",()=>handleCopyClick(block));
                if(wrapper) wrapper.removeEventListener("click",()=>handleWrapperClick(block));
            });
        };
    },[handleCopyClick,handleWrapperClick]);
    return <></>;
}
