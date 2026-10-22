"use client";
import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/FriendCircle.css";
import { useEffect } from "react";
import { HomeRightSide } from "@/components/RightSide";
import { siteConfigs } from "@/config";

// fcircle 主题脚本在全局执行一次 createApp().mount("#hexo-circle-of-friends-root")，
// Vue 实例和它渲染出的 DOM 从此绑定。Next 客户端路由离开本页会连 DOM 一起卸载；
// 再次进入时动态 import 命中模块缓存、脚本不会重跑，新的空 root 没人挂载，
// 页面就停在“与主机通讯中……”（多跳几次朋友圈进不去的根因，整页刷新反而正常）。
// 解法：离开前把 Vue 的根元素摘下来挂在 window 上暂存，回到本页时插回新的空 root。
// Vue 实例闭包仍引用这个元素，插回后状态、数据缓存原样恢复，无需重新请求。
export default function Page() {
  useEffect(() => {
    window.UserConfig = {
      private_api_url: siteConfigs.fcircleUrl,
      page_init_number: 20,
      page_turning_number: 10,
      error_img: siteConfigs.falldownAvatar,
      sort_rule: "created",
      expire_days: 1,
    };
    const root = document.getElementById("hexo-circle-of-friends-root");
    const saved = (window.__fcircleSavedRoot ||= {});
    const stored = saved.root;

    if (stored instanceof Element) {
      // 复用已创建的应用：把暂存的根元素插回本页的空 root。
      root.appendChild(stored);
      // Vue 的引用已随元素回归，无需任何重挂载调用。
      return () => {
        // 离开页面时 Next 会移除整个容器；先摘出应用元素暂存，避免被销毁。
        if (saved.root.isConnected) saved.root.remove();
      };
    }

    let cancelled = false;
    import("fcircle-theme-yyyz/dist/fcircle.min").then(() => {
      if (cancelled) return;
      // mount 后 root 的子树就是 Vue 应用本身，记下来供下次复用。
      if (root.firstElementChild) saved.root = root.firstElementChild;
    });
    return () => {
      cancelled = true;
      if (saved.root && saved.root.isConnected) saved.root.remove();
    };
  }, []);
  return (
    <div className="page" id="main-container">
      <style>{`#navbar{position:fixed}`}</style>
      <title>{`朋友圈 | ${siteConfigs.title}`}</title>
      <div id="article-container" className="page flink">
        <div id="post-maincontent" className="page flink">
          <h1>朋友圈</h1>
          <div id="hexo-circle-of-friends-root" />
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
