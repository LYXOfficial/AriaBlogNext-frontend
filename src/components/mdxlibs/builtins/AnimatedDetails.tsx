"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

/** 原生 details 关闭会立即隐藏内容，因此先完成实际高度动画再移除 open。 */
export default function AnimatedDetails({
  summary,
  children,
  defaultOpen = false,
  ...props
}: Omit<ComponentPropsWithoutRef<"details">, "open" | "onClick"> & {
  summary: ReactNode;
  defaultOpen?: boolean;
}) {
  const root = useRef<HTMLDetailsElement>(null);
  const animation = useRef<Animation | null>(null);
  const target = useRef(defaultOpen);
  const [expanded, setExpanded] = useState(defaultOpen);
  useEffect(() => () => animation.current?.cancel(), []);
  const toggle = () => {
    const el = root.current;
    if (!el) return;
    const start = el.getBoundingClientRect().height;
    animation.current?.cancel();
    target.current = !target.current;
    setExpanded(target.current);
    el.style.height = "auto";
    el.open = true;
    const end = target.current
      ? el.getBoundingClientRect().height
      : el.querySelector("summary")!.getBoundingClientRect().height +
        el.offsetHeight -
        el.clientHeight;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.open = target.current;
      return;
    }
    // 使用真实高度，让长短内容都在同一时长内完成；与箭头共用时长令牌。
    const durationValue = getComputedStyle(el)
      .getPropertyValue("--details-duration")
      .trim();
    const duration =
      parseFloat(durationValue) * (durationValue.endsWith("ms") ? 1 : 1000) || 300;
    const current = el.animate(
      { height: [`${start}px`, `${end}px`] },
      {
        duration,
        easing:
          getComputedStyle(el).getPropertyValue("--ease-in-out").trim() ||
          "ease-in-out",
      },
    );
    animation.current = current;
    current.onfinish = () => {
      el.open = target.current;
      animation.current = null;
    };
  };
  return (
    <details {...props} ref={root} open={defaultOpen} data-expanded={expanded}>
      <summary
        onClick={(event) => {
          if ((event.target as Element).closest("button, a, input")) return;
          event.preventDefault();
          toggle();
        }}
      >
        {summary}
      </summary>
      {children}
    </details>
  );
}
