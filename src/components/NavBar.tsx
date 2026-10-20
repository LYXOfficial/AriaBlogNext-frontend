"use client";
import { useState, useEffect } from "react";
import "styles/NavBar.css";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { MenuItems, siteConfigs } from "config";
import { useRouter } from "nextjs-toploader/app";
import throttle from "lodash/throttle";
import { usePathname } from "next/navigation";
import SearchBox from "components/SearchBox";
import MenuButtons from "components/MenuButtons";
import { MenuItem, MenuItemChild } from "@/interfaces/menuitem";
import React from "react";

export default function NavBar() {
  const router = useRouter();
  const [trans, setTrans] = useState(false);
  const [onTop, setOnTop] = useState(true);
  const [searchBoxShow, setSearchBoxShow] = useState(false);
  const pathName = usePathname();
  const scrollHandler = throttle(() => {
    if (window.location.pathname === "/") {
      const banner = document.querySelector("[data-home-banner]");
      const content = document.getElementById("main-container");
      setTrans(
        !!banner &&
          (content
            ? content.getBoundingClientRect().top > 80
            : banner.getBoundingClientRect().bottom > 62),
      );
      setOnTop(!!content && content.getBoundingClientRect().top >= 70);
      return;
    }
    const hasBanner = window.location.pathname.startsWith("/posts/");
    if (window.innerWidth <= 768) {
      setOnTop(true);
      if (hasBanner) {
        if (document.documentElement.scrollTop < 60) {
          setTrans(true);
        } else {
          setTrans(false);
        }
      } else {
        setTrans(false);
      }
      return;
    }
    if (hasBanner) {
      setOnTop(false);
      if (document.documentElement.scrollTop < 60) {
        setTrans(true);
      } else {
        setTrans(false);
      }
    } else {
      setTrans(false);
      if (document.documentElement.scrollTop < 60) {
        setOnTop(true);
      } else {
        setOnTop(false);
      }
    }
  }, 100);
  useEffect(() => {
    (window as any).toRandomPost = async () => {
      const res = await fetch(`${siteConfigs.backEndUrl}/get/post/postSlugs`, {
        next: { revalidate: 7200, tags: ["posts"] },
      });
      if (res.ok) {
        const posts: string[] = (await res.json()).data;
        const randomIndex: number = Math.round(Math.random() * posts.length);
        router.push(`/posts/${posts[randomIndex]}`);
      }
    };
    scrollHandler();
    window.addEventListener("scroll", scrollHandler);
    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);
  useEffect(scrollHandler, [pathName]);
  const [hoveringElement, setHoveringElement] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    // 顶栏跨路由复用，不能让旧页面的悬浮菜单状态带到新页面。
    setMobileMenuOpen(false);
    setHoveringElement("");
  }, [pathName]);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setSearchBoxShow(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  return (
    <>
      <nav
        id="navbar"
        data-home={pathName === "/" ? "true" : undefined}
        className={trans ? "trans" : onTop ? "ontop" : ""}
      >
        <Link id="site-name" href="/">
          <img
            id="site-name-icon"
            src={siteConfigs.titleIcon}
            title={siteConfigs.title}
            alt=""
          />
        </Link>
        <div id="menu-center">
          <div
            id="menu-items"
            className={
              mobileMenuOpen ? "mobile-menu-open" : "mobile-menu-close"
            }
            onClick={(event) => {
              const link = (event.target as Element).closest("a");
              if (link) {
                // 指针点击不保留焦点高亮；键盘激活仍保留可见焦点。
                if (event.detail > 0) link.blur();
                // 同路由链接及功能型菜单项也要立即收起，不只依赖 pathname 变化。
                setMobileMenuOpen(false);
                setHoveringElement("");
              }
            }}
          >
            <div className="mobile-menu-heading">
              <span>去哪里逛逛？</span>
            </div>
            {MenuItems.map((item) => {
              return (
                <div
                  className="menu-item"
                  key={item.name}
                  onMouseEnter={() => setHoveringElement(item.name)}
                  onMouseLeave={() => setHoveringElement("")}
                  onFocus={() => setHoveringElement(item.name)}
                  onBlur={(event) => {
                    if (
                      !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                      )
                    ) {
                      setHoveringElement("");
                    }
                  }}
                >
                  {item.link ? (
                    <Link className="site-page" href={item.link}>
                      {item.icon}
                      <span>{" " + item.name}</span>
                    </Link>
                  ) : (
                    <span className="site-page">
                      {item.icon}
                      <span>{" " + item.name}</span>
                    </span>
                  )}
                  {item.childs.length ? (
                    <div
                      className={
                        "site-page-childs " +
                        (hoveringElement == item.name ? "show" : "hide")
                      }
                    >
                      {item.childs.map((child: MenuItemChild) => {
                        if (child.link)
                          return (
                            <Link
                              href={child.link}
                              key={child.name}
                              className="site-page-child"
                            >
                              {child.icon}
                              <div>{child.name}</div>
                            </Link>
                          );
                        else
                          return (
                            <a
                              onClick={child.func!}
                              key={child.name}
                              className="site-page-child"
                            >
                              {child.icon}
                              <div>{child.name}</div>
                            </a>
                          );
                      })}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div id="menu-buttons">
          <div id="nav-menu-buttons-slot" aria-hidden="true" />
          <button
            className="menu-button menu-button-mobmenu"
            title={mobileMenuOpen ? "收起菜单" : "展开菜单"}
            aria-expanded={mobileMenuOpen}
            aria-controls="menu-items"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            <Icon icon="fa6-solid:bars" />
          </button>
        </div>
      </nav>
      <div
        id="sidebar-mask"
        className={mobileMenuOpen ? "active" : "disactive"}
        onClick={() => {
          setMobileMenuOpen(false);
        }}
      />
      <MenuButtons
        pathname={pathName}
        transparent={trans}
        hidden={false}
        onSearch={() => {
          setSearchBoxShow(true);
          setTimeout(
            () => document.getElementById("search-box-input")?.focus(),
            10,
          );
        }}
        onRandom={() => (window as any).toRandomPost()}
      />
      <SearchBox show={searchBoxShow} closeFunction={setSearchBoxShow} />
    </>
  );
}
