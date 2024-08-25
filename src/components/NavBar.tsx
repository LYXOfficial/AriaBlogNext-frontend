"use client"

import {useState} from "react";
import * as FaIcons from '@fortawesome/free-solid-svg-icons';
import "../styles/NavBar.css";
import FaIcon from './fa16';

const MENU_ITEMS=[
    {
        name: "首页",
        link: "/",
        icon: FaIcons.faHome,
        childs: []
    },
    {
        name: "文章",
        link: "#",
        icon: FaIcons.faNewspaper,
        childs: [
            {
                name: "随便逛逛",
                link: "/randomPost",
                icon: FaIcons.faPaperPlane
            },
            {
                name: "归档",
                link: "/archives",
                icon: FaIcons.faArchive
            },
            {
                name: "标签",
                link: "/tags",
                icon: FaIcons.faTags
            },
            {
                name: "分类",
                link: "/categories",
                icon: FaIcons.faFolderOpen
            }
        ]
    },
    {
        name: "本站",
        link: "#",
        icon: FaIcons.faSitemap,
        childs: [
            {
                name: "首页",
                link: "https://yaria.top",
                icon: FaIcons.faHome
            },
            {
                name: "友链",
                link: "/links",
                icon: FaIcons.faLink
            },
            {
                name: "朋友圈",
                link: "/fcircle",
                icon: FaIcons.faFutbol
            },
            {
                name: "关于我",
                link: "/about",
                icon: FaIcons.faInfoCircle
            },
            {
                name: "日志",
                link: "/update",
                icon: FaIcons.faBell
            },
            {
                name: "声明",
                link: "/license",
                icon: FaIcons.faBell
            },
            {
                name: "留言板",
                link: "/messageboard",
                icon: FaIcons.faBlackboard
            },
        ]
    },
]

const MENU_BUTONS=[
    {
        name: "搜索",
        icon: FaIcons.faSearch,
        method:(e)=>{

        }
    },
    {
        name: "随便逛逛",
        icon: FaIcons.faPaperPlane,
        method:(e)=>{

        }
    },
    {
        name: "开往",
        icon: FaIcons.faSubway,
        method:(e)=>{

        }
    }
]
export default function NavBar() {
    const [hoveringElement,setHoveringElement]=useState("");
    return (
        <nav id="navbar">
            <a id="site-name" href="/">Ariasakaの小窝</a>
            <div id="menu-items">
                {MENU_ITEMS.map((item)=>{
                    return (
                        <div className="menu-item" key={item.name}
                            onMouseEnter={()=>setHoveringElement(item.name)} onMouseLeave={()=>setHoveringElement("")}>
                                <a className="site-page" href={item.link}>
                                    <FaIcon icon={item.icon} size={18}/>
                                    <span>{" "+item.name}</span>
                                </a>
                                {item.childs.length?
                                    <div className={"site-page-childs "+(hoveringElement==item.name?"show":"hide")}>
                                        {item.childs.map((child)=>{
                                            return (
                                                <a href={child.link} key={child.name} className="site-page-child">
                                                    <FaIcon icon={child.icon} size={18}/>
                                                    <a href={child.link}>{child.name}</a>
                                                </a>
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
                            <FaIcon icon={item.icon} size={16}/>
                        </button>
                    )
                })}
            </div>
        </nav>
    );
}