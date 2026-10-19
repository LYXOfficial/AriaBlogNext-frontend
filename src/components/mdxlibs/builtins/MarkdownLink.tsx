import { ReactNode } from "react";

export default function MarkdownLink({
  children,
  href,
  title,
  className,
}: {
  children: ReactNode;
  href: string;
  title?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      // 富链接卡片也经过 a 覆盖器，不能丢掉原类名并强套普通行内链接样式。
      className={className?.split(/\s+/).includes("etag-link") ? className : ["normal-a", className].filter(Boolean).join(" ")}
      title={title}
    >
      {children}
    </a>
  );
}
