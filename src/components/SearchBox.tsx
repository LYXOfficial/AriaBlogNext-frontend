"use client";
import { Icon } from "@iconify/react";
import "styles/SearchBox.css"

export default function SearchBox({show,closeFunction}:{closeFunction:Function,show:boolean}) {
    return (
        <>
            <div id="search-box" className={`card-widget${show?" show":" hide"}`}>
                <div id="search-box-header">
                    <button id="search-box-searchbtn">
                        <Icon icon="fa6-solid:magnifying-glass" width="20" height="20" />
                    </button>
                    <input type="text" placeholder="搜索博文..." id="search-box-input" />
                    <button id="search-box-close" onClick={()=>{closeFunction(!show)}}>
                        <Icon icon="fa6-solid:xmark" width="20" height="20" />
                    </button>
                </div>
                <div id="search-box-results">
                    
                </div>
            </div>
            <div id="search-box-mask" className={`${show?"show":"hide"}`} onClick={()=>{closeFunction(!show)}}/>
        </>
    );
}