"use client";
import { useEffect, cache } from "react";

interface TOCItem {
  href: string;
  children?: TOCItem[];
}

const flattenTOC = cache((toc: TOCItem[]) => {
  const flatList: TOCItem[] = [];
  const traverse = (items: TOCItem[]) => {
    items.forEach((item) => {
      if (item.href) {
        flatList.push(item);
      }
      if (item.children) {
        traverse(item.children);
      }
    });
  };
  traverse(toc);
  return flatList;
});

// markdown 里长得像标题、但渲染器并没有真的输出对应 <h_> 的行（例如 <Folding> 这类
// JSX 块内部的内容）会指向不存在的锚点，这里按真实 DOM 把它们隐藏掉。
// 无效项不会出现在下面的 offsets 里，因此永远不会被选中，隐藏它们是安全的。
const hideEntriesWithoutTarget = () => {
  document
    .querySelectorAll<HTMLAnchorElement>(".toc-content .toc-link")
    .forEach((link) => {
      const targetId = link.id.replace(/^toc-/, "");
      link.classList.toggle("toc-invalid", !document.getElementById(targetId));
    });
};

const calcProgress = () => {
  const postContent = document.querySelector<HTMLElement>(
    "#post-maincontent:not(#article-container.page #post-maincontent)",
  );
  const tocCounter = document.querySelector<HTMLElement>(".toc-counter-value");
  if (postContent && tocCounter) {
    const postContentRect = postContent.getBoundingClientRect();
    const windowHeight = window.innerHeight - 60;
    const scrollPercentage =
      ((windowHeight - postContentRect.top) /
        (windowHeight + postContentRect.height)) *
      100;
    const boundedScrollPercentage = Math.min(
      Math.max(scrollPercentage, 0),
      100,
    );
    tocCounter.innerText = boundedScrollPercentage.toFixed(0);
    tocCounter.closest<HTMLElement>(".card-toc")?.style.setProperty(
      "--toc-progress",
      String(boundedScrollPercentage / 100),
    );
  }
};

interface TocUpdaterProps {
  tocTree: TOCItem[];
}

export default function TocUpdater({ tocTree }: TocUpdaterProps) {
  useEffect(() => {
    calcProgress();
    const handleScroll = () => {
      const flatTOCTree = flattenTOC(tocTree);
      const offsets = flatTOCTree.flatMap((item) => {
        const element = document.getElementById(item.href);
        return element
          ? [{ id: item.href.slice(0), offsetTop: element.offsetTop }]
          : [];
      });
      const currentScrollPosition = window.scrollY + 80;
      let currentActiveId = "";
      for (let i = offsets.length - 1; i >= 0; i--) {
        if (currentScrollPosition >= offsets[i].offsetTop) {
          currentActiveId = offsets[i].id;
          break;
        }
      }
      const currentTocLink = document.getElementById(`toc-${currentActiveId}`);
      if (currentTocLink) {
        currentTocLink.classList.add("active");
        document
          .querySelectorAll(`.toc-link:not(#toc-${currentActiveId})`)
          .forEach((item) => {
            item.classList.remove("active");
          });
        if (currentTocLink) {
          const tocContent = document.querySelector(".toc-content")!;
          const bounding = currentTocLink.getBoundingClientRect();
          const tocBounding = tocContent.getBoundingClientRect();
          const isAbove = bounding.top < tocBounding.top;
          const isBelow = bounding.bottom > tocBounding.bottom;
          if (isAbove) {
            tocContent.scrollTop -= tocBounding.top - bounding.top + 10;
          } else if (isBelow) {
            tocContent.scrollTop += bounding.bottom - tocBounding.bottom + 10;
          }
        }
        let currentTopToc = currentTocLink;
        while (currentTopToc && currentTopToc.parentNode) {
          currentTopToc = currentTopToc.parentNode as HTMLElement;
          if (
            currentTopToc.parentNode &&
            (currentTopToc.parentNode as HTMLElement).className ===
              "toc-content"
          )
            break;
        }

        Array.from(
          document.querySelector(".toc-content")?.children || [],
        ).forEach((item) => {
          const children = item.children;
          if (children.length === 2) {
            if (item !== currentTopToc) {
              children[1].className = "toc-children hide";
            } else {
              children[1].className = "toc-children";
            }
          }
        });
      }
      calcProgress();
    };
    (window as any).tocHandleScroll = handleScroll;
    hideEntriesWithoutTarget();
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [tocTree]);

  return null;
}
