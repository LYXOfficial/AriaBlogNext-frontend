"use client";
import { useState, useEffect } from "react";
import "styles/NavBar.css";
import { Icon } from '@iconify/react';
import Link from "next/link";
import { MenuItems,siteConfigs } from "config";
import { useRouter } from "nextjs-toploader/app";
import { throttle } from "lodash";
import { usePathname } from 'next/navigation'
import SearchBox from "components/SearchBox";
import { MenuItem, MenuItemChild } from "@/interfaces/menuitem";

export default function NavBar() {
    const router=useRouter();
    const [trans,setTrans]=useState(false);
    const [searchBoxShow,setSearchBoxShow]=useState(false);
    const pathName=usePathname();
    const scrollHandler=throttle(()=>{
        if(document.location.href.includes("/posts/")){
            if(document.documentElement.scrollTop<60){
                setTrans(true);
            }else{
                setTrans(false);
            }
        }
        else{
            setTrans(false);
        }
    },100);
    useEffect(()=>{
        (window as any).toRandomPost=async ()=>{
            const res=await fetch(`${siteConfigs.backEndUrl}/get/post/postSlugs`,{next:{tags:["posts"]}})
            if(res.ok){
                const posts:string[]=(await res.json()).data;
                const randomIndex:number=Math.round(Math.random()*posts.length);
                router.push(`/posts/${posts[randomIndex]}`);
            }
        };
        scrollHandler();
        window.addEventListener("scroll",scrollHandler);
        return ()=>{
            window.removeEventListener("scroll",scrollHandler);
        }
    },[]);
    useEffect(scrollHandler,[pathName]);
    const [hoveringElement,setHoveringElement]=useState("");
    const [mobileMenuOpen,setMobileMenuOpen]=useState(false);
    return (<>
        <nav id="navbar" className={trans?"trans":""}>
            <Link id="site-name" href="/">{siteConfigs.title}</Link>
            <div id="menu-center">
                <div id="menu-items" className={mobileMenuOpen?"mobile-menu-open":"mobile-menu-close"}>
                    {MenuItems.map((item)=>{
                        return (
                            <div className="menu-item" key={item.name}
                                onMouseEnter={()=>setHoveringElement(item.name)} onMouseLeave={()=>setHoveringElement("")}>
                                    {item.link?
                                        <Link className="site-page" href={item.link}>
                                            {item.icon}
                                            <span>{" "+item.name}</span>
                                        </Link>
                                        :
                                        <span className="site-page">
                                            {item.icon}
                                            <span>{" "+item.name}</span>
                                        </span>
                                    }
                                    {item.childs.length?
                                        <div className={"site-page-childs "+(hoveringElement==item.name?"show":"hide")}>
                                            {item.childs.map((child:MenuItemChild)=>{
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
            </div>
            <div id="menu-buttons">
                <button className="menu-button" title="搜索" onClick={()=>{
                    setSearchBoxShow(!searchBoxShow);
                }}>
                    <Icon icon="fa6-solid:magnifying-glass"/>
                </button>
                <button className="menu-button" title="随便逛逛" onClick={()=>{
                    (window as any).toRandomPost();
                }}>
                    <Icon icon="fa6-solid:paper-plane"/>
                </button>
                <button className="menu-button" title="开往" onClick={()=>{
                    window.location.href="https://travellings.cn/go.html";
                }}>
                    <Icon icon="fa6-solid:train-subway"/>
                </button>
                <button className="menu-button menu-button-mobmenu" title="展开菜单" onClick={()=>{
                    setMobileMenuOpen(!mobileMenuOpen);
                }}>
                    <Icon icon="fa6-solid:bars"/>
                </button>
            </div>
        </nav>
        <div id="sidebar-mask" className={mobileMenuOpen?"active":"disactive"} onClick={()=>{setMobileMenuOpen(false)}}/>
        <SearchBox show={searchBoxShow} closeFunction={setSearchBoxShow}/>
        </>
    );
}