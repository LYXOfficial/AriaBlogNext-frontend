"use client"

import {EventHandler, MouseEventHandler, useState} from "react";
import "src/styles/NavBar.css";
import { Icon } from '@iconify/react';
import Link from "next/link";

const MENU_ITEMS=[
    {
        name: "首页",
        link: "/",
        icon: <Icon icon="fa6-solid:house-chimney"/>,
        childs: []
    },
    {
        name: "文章",
        link: "#",
        icon: <Icon icon="fa6-solid:newspaper"/>,
        childs: [
            {
                name: "随便逛逛",
                link: "/randomPost",
                icon: <Icon icon="fa6-solid:paper-plane"/>,
            },
            {
                name: "归档",
                link: "/archives",
                icon: <Icon icon="fa6-solid:box-archive"/>,
            },
            {
                name: "标签",
                link: "/tags",
                icon: <Icon icon="fa6-solid:tags"/>,
            },
            {
                name: "分类",
                link: "/categories",
                icon: <Icon icon="fa6-solid:folder-open"/>,
            }
        ]
    },
    {
        name: "本站",
        link: "#",
        icon: <Icon icon="fa6-solid:sitemap"/>,
        childs: [
            {
                name: "首页",
                link: "https://yaria.top",
                icon: <Icon icon="fa6-solid:house"/>,
            },
            {
                name: "友链",
                link: "/links",
                icon: <Icon icon="fa6-solid:link"/>,
            },
            {
                name: "朋友圈",
                link: "/fcircle",
                icon: <Icon icon="fa6-solid:circle-nodes"/>,
            },
            {
                name: "关于我",
                link: "/about",
                icon: <Icon icon="fa6-solid:circle-info"/>,
            },
            {
                name: "日志",
                link: "/update",
                icon: <Icon icon="fa6-solid:calendar"/>,
            },
            {
                name: "声明",
                link: "/license",
                icon: <Icon icon="fa6-solid:bell"/>,
            },
            {
                name: "留言板",
                link: "/messageboard",
                icon: <Icon icon="fa6-solid:chalkboard"/>,
            },
        ]
    },
]

const MENU_BUTONS=[
    {
        name: "搜索",
        icon: <Icon icon="fa6-solid:magnifying-glass"/>,
        method:()=>{

        }
    },
    {
        name: "随便逛逛",
        icon: <Icon icon="fa6-solid:paper-plane"/>,
        method:()=>{

        }
    },
    {
        name: "开往",
        icon: <Icon icon="fa6-solid:train-subway"/>,
        method:()=>{

        }
    }
]
export default function NavBar() {
    const [hoveringElement,setHoveringElement]=useState("");
    return (
        <nav id="navbar">
            <Link id="site-name" href="/">Ariasakaの小窝</Link>
            <div id="menu-items">
                {MENU_ITEMS.map((item)=>{
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
                {MENU_BUTONS.map((item)=>{
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