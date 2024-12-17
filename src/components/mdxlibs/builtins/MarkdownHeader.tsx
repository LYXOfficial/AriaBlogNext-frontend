"use client";
import { createElement, ReactNode, useRef } from "react"

export function MarkdownHeaderH1({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <MarkdownHeader level={1}>{children}</MarkdownHeader>
  );
}
export function MarkdownHeaderH2({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <MarkdownHeader level={2}>{children}</MarkdownHeader>
  );
}
export function MarkdownHeaderH3({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <MarkdownHeader level={3}>{children}</MarkdownHeader>
  );
}
export function MarkdownHeaderH4({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <MarkdownHeader level={4}>{children}</MarkdownHeader>
  );
}
export function MarkdownHeaderH5({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <MarkdownHeader level={5}>{children}</MarkdownHeader>
  );
}
export function MarkdownHeaderH6({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <MarkdownHeader level={6}>{children}</MarkdownHeader>
  );
}

export default function MarkdownHeader({ level, children }: { level: number, children: ReactNode }) {
  const thisRef = useRef<HTMLAnchorElement>(null);
  return (
    <a
      className="heading-link"
      ref={thisRef}
      onClick={(e) => {
        e.preventDefault();
        if (thisRef.current)
          document.documentElement.scroll({
            top: thisRef.current.offsetTop - 70,
            behavior: 'smooth'
          });
      }}
    >
      {
        createElement(`h${level}`, {
          children: (
            { children }
          ),
          id: "title-"
        })
      }
    </a>
  );
}