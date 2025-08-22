"use client";
import { useRef } from "react";

export default function PromptTag({
  children,
  tip,
}: {
  children: React.ReactNode;
  tip: string;
}) {
  const thisRef = useRef<HTMLSpanElement>(null);
  return (
    <span
      className="etag-prompt"
      onMouseEnter={() => {
        thisRef.current?.classList.remove("hide");
        thisRef.current?.classList.add("show");
      }}
      onMouseLeave={() => {
        thisRef.current?.classList.remove("show");
        thisRef.current?.classList.add("hide");
      }}
    >
      {children}
      <span className="etag-prompt-tooltip hide" ref={thisRef}>
        {tip}
      </span>
    </span>
  );
}
