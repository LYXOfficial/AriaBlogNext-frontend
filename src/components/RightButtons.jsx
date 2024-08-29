"use client";
import "src/styles/RightButtons.css";
import { Icon } from "@iconify/react";
import { useEffect,useState } from "react";

export function RightButtonsPages(){
    const [rbHide,setRbHide]=useState(false);
    const [tocHide,setTocHide]=useState(true);
    useEffect(()=>{
        document.addEventListener("scroll",()=>{
            if(document.documentElement.scrollTop>100)
                setRbHide(false);
            else setRbHide(true);
        })
    });
    function scrollToTop(){
        document.documentElement.scroll({behavior:"smooth",top:0});
    }
    function scrollToComments(){
        document.documentElement.scroll({behavior:"smooth",top:document.querySelector("#post-comment-container").offsetTop-80});
    }
    function setToc(){
        setTocHide(!tocHide);
        if(tocHide) document.querySelector(".card-toc").className="card-widget card-aside card-toc";
        else document.querySelector(".card-toc").className="card-widget card-aside card-toc mobile-show";
    }
    return (<div id="rightbuttons" className={rbHide?"rb-hide":"rb-show"}>
        <button className="rightbutton rightbutton-toc" title="文章目录" onClick={setToc}>
            <Icon icon="fa6-solid:align-left" />
        </button>
        <button className="rightbutton rightbutton-toTop" title="回到顶部" onClick={scrollToTop}>
            <Icon icon="fa6-solid:arrow-up" />
        </button>
        <button className="rightbutton rightbutton-toComment" title="空降评论" onClick={scrollToComments}>
            <Icon icon="fa6-solid:comments" />
        </button>
    </div>);
}
export function RightButtonsHome(){
    const [rbHide,setRbHide]=useState(false);
    useEffect(()=>{
        document.addEventListener("scroll",()=>{
            if(document.documentElement.scrollTop>100)
                setRbHide(false);
            else setRbHide(true);
        })
    });
    function scrollToTop(){
        document.documentElement.scroll({behavior:"smooth",top:0});
    }
    return (<div id="rightbuttons" className={rbHide?"rb-hide":"rb-show"}>
        <button className="rightbutton rightbutton-toTop" title="回到顶部" onClick={scrollToTop}>
            <Icon icon="fa6-solid:arrow-up" />
        </button>
    </div>);
}