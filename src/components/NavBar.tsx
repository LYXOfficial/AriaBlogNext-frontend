"use client"

import {EventHandler, MouseEventHandler, useState} from "react";
import "src/styles/NavBar.css";
import { Icon } from '@iconify/react';
import Link from "next/link";
import { menuItems,siteInfos } from "public/config";
import { menuButtons } from "public/config_adv";

export default function NavBar() {
    const [hoveringElement,setHoveringElement]=useState("");
    return (
        <nav id="navbar">
            <Link id="site-name" href="/">{siteInfos.title}</Link>
            <div id="menu-items">
                {menuItems.map((item)=>{
                    return (
                        <div className="menu-item" key={item.name}
                            onMouseEnter={()=>setHoveringElement(item.name)} onMouseLeave={()=>setHoveringElement("")}>
                                <Link className="site-page" href={item.link}>
                                    {item.icon}
                                    <span>{" "+item.name}</span>
                                </Link>
                                {item.childs.length?
                                    <div className={"site-page-childs "+(hoveringElement==item.name?"show":"hide")}>
                                        {item.childs.map((child)=>{
                                            return (
                                                <Link href={child.link} key={child.name} className="site-page-child">
                                                    {child.icon}
                                                    <div>{child.name}</div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                :""
                                }
                        </div>
                    )
                })}
            </div>
            <div id="menu-buttons">
                {menuButtons.map((item)=>{
                    return (
                        <button className="menu-button" key={item.name} title={item.name} onClick={item.method}>
                            {item.icon}
                        </button>
                    )
                })}
            </div>
        </nav>
    );
}