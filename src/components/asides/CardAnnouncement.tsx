"use client";
import "styles/ASide/global.css";
import { Icon } from "@iconify/react";
import "styles/ASide/Announcement.css";
import { ReactElement, useEffect, useRef, useState } from "react";

export default function CardAnnouncement({
  content,
}: {
  content: ReactElement;
}) {
  const [annoContent, setAnnoContent] = useState<ReactElement | string>(
    content,
  );
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    // 移动端（<=900px）侧栏公告处于 display:none，无需在首屏发起无意义请求
    if (!el || getComputedStyle(el).display === "none") return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/announcement");
        if (!res.ok) return;
        const data = await res.json();
        if (alive && typeof data.text === "string" && data.text) {
          setAnnoContent(data.text);
        }
      } catch {
        // 保持服务端给的默认文案
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div ref={cardRef} className="card-widget card-aside card-announcement">
      <div className="card-headline">
        <Icon icon="solar:notification-unread-lines-bold" />
        <span className="card-title">公告</span>
      </div>
      <div className="card-body">
        <p>{annoContent}</p>
      </div>
    </div>
  );
}
