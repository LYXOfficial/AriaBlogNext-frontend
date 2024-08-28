"use client"
import renderMathInText from 'katex/dist/contrib/auto-render';
import { useEffect } from "react";
import 'katex/dist/katex.min.css';

export default function KaTex(){
    useEffect(()=>{
        renderMathInText(document.body,{
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
            ],
            throwOnError : false
        });
    })
    return <></>
}