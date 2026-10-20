"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PostPageStart() {
  const pathname = usePathname();
  useEffect(() => {
    // 分页路由可能保留同布局的滚动位置；提交后回到列表开头，不干预首页 Banner。
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
}
