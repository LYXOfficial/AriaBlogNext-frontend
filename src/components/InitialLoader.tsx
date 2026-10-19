"use client";

import { useEffect, useState } from "react";
import "styles/InitialLoader.css";

export default function InitialLoader() {
  const [leaving, setLeaving] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // 根布局只挂载一次，不监听路由，也不等待图床、字体等外部资源。
    const leave = window.setTimeout(() => setLeaving(true), 600);
    const remove = window.setTimeout(() => setFinished(true), 1100);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(remove);
    };
  }, []);

  if (finished) return null;
  return (
    <div className={`initial-loader${leaving ? " initial-loader-leaving" : ""}`} aria-hidden="true">
      <div className="initial-loader-content">
        <span className="initial-loader-ring" />
        <span className="initial-loader-label">奋力加载中…</span>
      </div>
    </div>
  );
}
