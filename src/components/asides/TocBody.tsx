"use client";
import { TOCItem } from "./CardToc";

function scrollToElementAndWait(
  elementId: string,
  waitTime: number = 50,
): Promise<void> {
  return new Promise((resolve) => {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      resolve();
      return;
    }
    const scrollHandler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        resolve();
        window.removeEventListener("scroll", scrollHandler);
      }, waitTime);
    };
    targetElement.scrollIntoView({ behavior: "smooth" });
    let timer = setTimeout(() => {
      resolve();
      window.removeEventListener("scroll", scrollHandler);
    }, waitTime);
    window.addEventListener("scroll", scrollHandler);
  });
}

export default function TocBody({ toc }: { toc: TOCItem[] }) {
  return (
    <>
      {toc.map((item) => (
        <li className="toc-child" key={item.href}>
          {item.href ? (
            <a
              className="toc-link"
              id={`toc-${item.href}`}
              onClick={async () => {
                window.removeEventListener(
                  "scroll",
                  (window as any).tocHandleScroll,
                );
                await scrollToElementAndWait(item.href);
                (window as any).tocHandleScroll?.();
                window.addEventListener(
                  "scroll",
                  (window as any).tocHandleScroll,
                );
              }}
            >
              {item.text}
            </a>
          ) : (
            <></>
          )}
          {item.children && item.children.length > 0 ? (
            <ul className="toc-children">
              <TocBody toc={item.children} />
            </ul>
          ) : (
            <></>
          )}
        </li>
      ))}
    </>
  );
}
