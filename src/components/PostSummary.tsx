"use client";
import { useEffect, useState, useRef } from "react";
import { fetchPostSummary } from "@/utils/api";
import "styles/PostSummary.css";
import pangu from "pangu";
import { Icon } from "@iconify/react";

export default function PostSummary({ slug }: { slug: string }) {
  const [summary, setSummary] = useState("正在加载中...");
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const isFirstMount = useRef(true);
  const typewriterTimeout = useRef<NodeJS.Timeout>(); // 用于清理打字机效果

  // 打字机效果函数
  const typeWriter = (text: string, index: number = 0) => {
    // 清除之前的timeout
    if (typewriterTimeout.current) {
      clearTimeout(typewriterTimeout.current);
    }

    if (index < text.length) {
      setDisplayText((prev) => prev + text.charAt(index));
      typewriterTimeout.current = setTimeout(
        () => typeWriter(text, index + 1),
        30,
      );
    } else {
      setIsTyping(false);
    }
  };

  // 获取摘要（后端有缓存；首次访问时才真正生成）
  const fetchSummary = async () => {
    const res = await fetchPostSummary(slug);
    if (!res.ok) {
      // 限流时继续使用当前摘要，其它失败给提示文案
      if (res.status === 429) {
        return summary;
      }
      return "摘要加载失败了QwQ";
    }
    return pangu.spacing(res.data?.summary ?? "");
  };

  // 初始加载摘要
  useEffect(() => {
    // 只在首次挂载时执行
    if (isFirstMount.current) {
      isFirstMount.current = false;
      setIsTyping(true); // 立即设置打字状态
      (async () => {
        const newSummary = await fetchSummary();
        setSummary(newSummary);
        setDisplayText("");
        typeWriter(newSummary);
      })();
    }

    // 清理函数
    return () => {
      if (typewriterTimeout.current) {
        clearTimeout(typewriterTimeout.current);
      }
    };
  }, [slug]);

  return (
    <div className="post-summary">
      <span className="post-summary-title">
        <Icon className="post-summary-icon" icon="octicon:dependabot-16" />
        这是文章摘要！
      </span>
      <p
        className={`post-summary-content ${isTyping || displayText === "" ? "typing" : ""}`}
      >
        {displayText}
      </p>
    </div>
  );
}
