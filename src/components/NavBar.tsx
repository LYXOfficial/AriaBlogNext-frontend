"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import "styles/NavBar.css";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { MenuItems, siteConfigs } from "config";
import { fetchPostSlugs } from "utils/api";
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
  // 当前分组由 MenuItems 推导：菜单项自身 + 子菜单里的站内链接，再加上 activeMatch
  // 里补充的路径（/page 归首页、/posts 归文章）。外链不参与匹配，避免离开站点后
  // 站内分组还亮着。新增页面只要进 config，顶栏高亮会自动跟上。
  // 注意：首页静态预渲染时 usePathname() 可能为空（线上首次进首页踩过），
  // 不归一成 "/" 的话首屏的当前分组下划线会不渲染。
  const currentPath = pathName || "/";
  const isCurrentPath = (path: string) =>
    path.startsWith("/") &&
    (currentPath === path || currentPath.startsWith(`${path}/`));
  const activeMenu =
    MenuItems.find((item) =>
      [
        item.link,
        ...item.childs.map((child) => child.link ?? ""),
        ...(item.activeMatch ?? []),
      ].some(isCurrentPath),
    )?.name ?? "";

  const menuItemsRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLSpanElement>(null);
  // 记录「下划线当前是为哪个分组摆的」。切分组时布局也会触发 ResizeObserver，
  // 若让它先按新位置直接落位，就轮不到动画了，所以分组没落位前先跳过被动重排。
  const activeMenuRef = useRef(activeMenu);
  activeMenuRef.current = activeMenu;
  const positionedMenuRef = useRef<string | null>(null);
  // 横向位置走 transform（要平移），纵向位置走 top。分开存是为了：
  // 切页时顶栏高度/边框变化只会改 y，别顺手把正在平移的 x 也重设成终点。
  const lastXRef = useRef<number | null>(null);
  const lastYRef = useRef<number | null>(null);
  // 下划线做成独立元素，切分组时只平移 transform；不跟着 aria-current 换节点，
  // 否则旧线瞬间消失、新线瞬间出现，没有过渡。
  const positionCurrentLine = useCallback((animate: boolean) => {
    const wrap = menuItemsRef.current;
    const line = currentLineRef.current;
    if (!wrap || !line) return;
    const active = wrap.querySelector<HTMLElement>(".site-page[aria-current]");
    if (!active) {
      line.removeAttribute("data-visible");
      return;
    }
    const wrapRect = wrap.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    // 18px 线宽，-9 让它中心对准入口中心；贴着入口底部 2px。
    const x = activeRect.left - wrapRect.left + activeRect.width / 2 - 9;
    const y = activeRect.bottom - wrapRect.top - 4;
    const xChanged =
      lastXRef.current === null || Math.abs(x - lastXRef.current) > 0.01;
    const yChanged =
      lastYRef.current === null || Math.abs(y - lastYRef.current) > 0.01;
    if (!animate && !xChanged && !yChanged) return;
    const shouldAnimate =
      animate && xChanged && line.dataset.visible === "true";
    // 首次落位、字体/图标重排直接跳过去，不走过渡；
    // 先关掉 transition、写完 transform 再强制重排，避免过渡属性与位移同帧生效而不触发动画。
    if (xChanged && !shouldAnimate) line.style.transition = "none";
    if (xChanged) line.style.transform = `translate3d(${x}px, 0, 0)`;
    line.style.top = `${y}px`;
    if (xChanged && !shouldAnimate) {
      void line.offsetWidth;
      line.style.transition = "";
    }
    lastXRef.current = x;
    lastYRef.current = y;
    line.dataset.visible = "true";
  }, []);

  useEffect(() => {
    positionCurrentLine(true);
    positionedMenuRef.current = activeMenu;
  }, [activeMenu, positionCurrentLine]);

  useEffect(() => {
    // 图标/字体/窗口尺寸变化会改入口宽度，跟随重排；这类被动变化不播动画。
    const wrap = menuItemsRef.current;
    if (!wrap) return;
    const reposition = () => {
      if (positionedMenuRef.current !== activeMenuRef.current) return;
      positionCurrentLine(false);
    };
    const observer = new ResizeObserver(reposition);
    // 入口宽度由图标和字体决定：图标是客户端补渲染的，只观察容器（宽度被 flex-grow
    // 拉满，几乎不变）会漏掉图标落位后的偏移，所以三个入口也要观察。
    wrap.querySelectorAll(".site-page").forEach((item) => observer.observe(item));
    observer.observe(wrap);
    document.fonts?.ready.then(reposition).catch(() => {});
    return () => observer.disconnect();
  }, [positionCurrentLine]);

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
      const res = await fetchPostSlugs();
      if (res.ok) {
        const posts: string[] = res.data ?? [];
        // Math.round(random * length) 会取到 length（越界）→ /posts/undefined；
        // 空列表也直接跳过，别把随机跳转变成 404
        if (posts.length === 0) return;
        const randomIndex = Math.floor(Math.random() * posts.length);
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
        {/* 顶栏左侧的凹槽位：音乐播放器挂在这里（MusicPlayer 用 portal 注入）。
            绝对定位而不是 flex 项，这样强行插一块也不会把居中的菜单顶偏。 */}
        <div id="nav-music-slot" />
        <div id="menu-center">
          <div
            id="menu-items"
            ref={menuItemsRef}
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
                    <Link
                      className="site-page"
                      href={item.link}
                      aria-current={
                        activeMenu === item.name ? "true" : undefined
                      }
                    >
                      {item.icon}
                      <span>{" " + item.name}</span>
                    </Link>
                  ) : (
                    <span
                      className="site-page"
                      aria-current={
                        activeMenu === item.name ? "true" : undefined
                      }
                    >
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
            <span
              id="nav-current-line"
              ref={currentLineRef}
              aria-hidden="true"
            />
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
