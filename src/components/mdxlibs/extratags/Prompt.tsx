"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const VIEWPORT_MARGIN = 8;

export default function PromptTag({
  children,
  tip,
}: {
  children: React.ReactNode;
  tip: string;
}) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const pointerType = useRef("");
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  useLayoutEffect(() => {
    if (!open) return;
    const el = tooltipRef.current;
    if (!el) return;
    el.style.transform = "";
    el.classList.remove("flip-down");
    const rect = el.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    let offsetX = 0;
    if (rect.left < VIEWPORT_MARGIN) offsetX = VIEWPORT_MARGIN - rect.left;
    else if (rect.right > viewportWidth - VIEWPORT_MARGIN)
      offsetX = viewportWidth - VIEWPORT_MARGIN - rect.right;
    if (offsetX !== 0)
      el.style.transform = `translateX(calc(-50% + ${offsetX}px))`;
    if (rect.top < VIEWPORT_MARGIN) el.classList.add("flip-down");
  }, [open, tip]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !triggerRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <span
      ref={triggerRef}
      className="etag-prompt"
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-describedby={open ? tooltipId : undefined}
      onPointerDown={(event) => {
        pointerType.current = event.pointerType;
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setOpen(false);
      }}
      onClick={() =>
        setOpen((value) => (pointerType.current === "mouse" ? true : !value))
      }
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen((value) => !value);
        }
      }}
      onBlur={() => setOpen(false)}
    >
      {children}
      <svg
        className="etag-prompt-icon"
        aria-hidden="true"
        viewBox="0 0 20 20"
        width="14"
        height="14"
      >
        <circle cx="10" cy="10" r="9" fill="currentColor" />
        <path
          d="M7.5 7a2.5 2.5 0 0 1 5 0c0 1.7-2.5 1.8-2.5 3.5"
          fill="none"
          stroke="var(--aria-background, white)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="10" cy="14" r="1" fill="var(--aria-background, white)" />
      </svg>
      <span
        id={tooltipId}
        role="tooltip"
        aria-hidden={!open}
        className={`etag-prompt-tooltip ${open ? "show" : "hide"}`}
        ref={tooltipRef}
      >
        {tip}
      </span>
    </span>
  );
}
