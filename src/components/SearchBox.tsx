"use client";
import { Icon } from "@iconify/react";
import "styles/SearchBox.css";
import { useState, useRef, ReactElement } from "react";
import { searchPosts, SemanticHit } from "@/utils/api";
import dayjs from "dayjs";
import Link from "next/link";
import React from "react";

/** 把用户输入当字面量匹配（高亮用），避免 c++ / .* 这类输入构造出非法正则 */
function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function SearchBox({
  show,
  closeFunction,
}: {
  closeFunction: Function;
  show: boolean;
}) {
  const [results, setResults] = useState<ReactElement>();
  const inputRef = useRef<HTMLInputElement>(null);
  const processResults = async () => {
    const query = inputRef.current?.value.trim();
    if (query) {
      setResults(<div id="search-box-results">搜索中...</div>);
      const res = await searchPosts(query);
      if (res.ok) {
        const data: SemanticHit[] = res.data ?? [];
        // 搜索词是用户输入，可能含正则元字符（c++、.*），必须转义后再高亮
        const highlight = (text: string) =>
          text.replace(
            new RegExp(escapeRegExp(query), "gi"),
            (q) => `<span class="search-box-result-highlight">${q}</span>`,
          );
        setResults(
          <div id="search-box-results">
            共找到{data.length}篇文章
            {data.map((post: SemanticHit) => {
              return (
                <div className="search-box-result card-widget" key={post.slug}>
                  <Link
                    className="search-box-result-link"
                    href={`/posts/${post.slug}#:~:text=${encodeURI(query)}`}
                    onClick={() => {
                      closeFunction();
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlight(post.title ?? ""),
                    }}
                  />
                  <div
                    className="search-box-result-context"
                    dangerouslySetInnerHTML={{
                      // 语义命中也可能没有片段（例如只命中标题），别对 null 调 replace
                      __html: highlight(post.context ?? ""),
                    }}
                  />
                  <span className="search-box-result-time">
                    <Icon icon="solar:calendar-bold" />
                    {dayjs.unix(post.publishTime).format("YYYY-MM-DD")}
                  </span>
                </div>
              );
            })}
          </div>,
        );
      } else {
        // 后端 message 是面向用户的中文（关键词超长、限流等），比「搜索失败」有用
        setResults(<div id="search-box-results">{res.message}</div>);
      }
    }
  };
  const searchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") processResults();
  };
  return (
    <>
      <div id="search-box" className={`card-widget${show ? " show" : " hide"}`}>
        <div id="search-box-header">
          <button id="search-box-searchbtn" onClick={processResults}>
            <Icon icon="solar:magnifer-linear" width="20" height="20" />
          </button>
          <input
            autoComplete="off"
            ref={inputRef}
            type="text"
            placeholder="搜索博文..."
            id="search-box-input"
            onKeyDown={searchEnter}
          />
          <button
            id="search-box-close"
            onClick={() => {
              closeFunction(!show);
            }}
          >
            <Icon icon="solar:close-circle-bold" width="20" height="20" />
          </button>
        </div>
        {results}
      </div>
      <div
        id="search-box-mask"
        className={`${show ? "show" : "hide"}`}
        onClick={() => {
          closeFunction(!show);
        }}
      />
    </>
  );
}
