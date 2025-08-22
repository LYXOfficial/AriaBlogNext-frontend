"use client";
import { Icon } from "@iconify/react";
import "styles/SearchBox.css";
import { useState, useRef, ReactElement } from "react";
import { siteConfigs } from "@/config";
import { Post } from "@/interfaces/post";
import moment from "moment";
import Link from "next/link";
import React from "react";

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
      const res = await fetch(
        `${siteConfigs.backEndUrl}/get/post/searchPosts?query=${query}`,
        { next: { revalidate: 7200, tags: ["posts"] } },
      );
      if (res.ok) {
        const data: Post[] = (await res.json()).data;
        setResults(
          <div id="search-box-results">
            共找到{data.length}篇文章
            {data.map((post: Post) => {
              return (
                <div className="search-box-result card-widget" key={post.slug}>
                  <Link
                    className="search-box-result-link"
                    href={`/posts/${post.slug}#:~:text=${encodeURI(query)}`}
                    onClick={() => {
                      closeFunction();
                    }}
                    dangerouslySetInnerHTML={{
                      __html: post.title!.replace(
                        new RegExp(`${query}`, "gi"),
                        (q) =>
                          `<span class="search-box-result-highlight">${q}</span>`,
                      ),
                    }}
                  />
                  <div
                    className="search-box-result-context"
                    dangerouslySetInnerHTML={{
                      __html: post.context!.replace(
                        new RegExp(`${query}`, "gi"),
                        (q) =>
                          `<span class="search-box-result-highlight">${q}</span>`,
                      ),
                    }}
                  />
                  <span className="search-box-result-time">
                    <Icon icon="fa6-solid:calendar" />
                    {moment.unix(post.publishTime!).format("YYYY-MM-DD")}
                  </span>
                </div>
              );
            })}
          </div>,
        );
      } else {
        setResults(<div id="search-box-results">搜索失败</div>);
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
            <Icon icon="fa6-solid:magnifying-glass" width="20" height="20" />
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
            <Icon icon="fa6-solid:xmark" width="20" height="20" />
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
