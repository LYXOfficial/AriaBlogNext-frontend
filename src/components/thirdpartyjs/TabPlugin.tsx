"use client";
import { useEffect } from "react";

export default function TabPlugin() {
    useEffect(()=>{
        document.querySelectorAll('.etag-tab-header').forEach(header=>{
            header.addEventListener('click',function(this:HTMLDivElement){
                const index=this.dataset.index;
                document.querySelectorAll('.etag-tab-header').forEach(h=>h.classList.remove('active'));
                document.querySelectorAll('.etag-tab-body').forEach(body=>body.classList.remove('active'));
                this.classList.add('active');
                document.querySelector(`.etag-tab-body[data-index="${index}"]`)!.classList.add('active');
            });
        });
    },[]);
    return <></>;
}