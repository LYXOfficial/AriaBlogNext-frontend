"use client";
import { useEffect,useCallback } from 'react';
import { debounce } from 'lodash';
import React from "react";

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
    const handleWrapperClick=useCallback(debounce(()=>{
        document.querySelectorAll(".hljs").forEach((code)=>{
            code.classList.toggle("wrap");
        });
        document.querySelectorAll(".hljs-wrapper").forEach((button)=>{
            button.classList.toggle("wrap");
        });
    },200),[]);
    useEffect(()=>{
        const codeBlocks=document.querySelectorAll(".hljs-folder");
        codeBlocks.forEach((block)=>{
            const copyButton=block.querySelector(".hljs-copy");
            const wrapper=block.querySelector(".hljs-wrapper");
            if(copyButton) copyButton.addEventListener("click",()=>handleCopyClick(block));
            if(wrapper) wrapper.addEventListener("click",()=>handleWrapperClick());
        });
        return()=>{
            codeBlocks.forEach((block)=>{
                const copyButton=block.querySelector(".hljs-copy");
                const wrapper=block.querySelector(".hljs-wrapper");
                if(copyButton) copyButton.removeEventListener("click",()=>handleCopyClick(block));
                if(wrapper) wrapper.removeEventListener("click",()=>handleWrapperClick());
            });
        };
    },[handleCopyClick,handleWrapperClick]);
    return <></>;
}
