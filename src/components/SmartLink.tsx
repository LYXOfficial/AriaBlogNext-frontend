"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { type AnchorHTMLAttributes, forwardRef } from "react";

const prefetched = new Set<string>();

type SmartLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps;

/**
 * 意图预取链接：首屏不通过视口观察批量拉取重型路由依赖（prefetch={false}），
 * 在鼠标悬停、键盘聚焦或触屏按下时立即调用 router.prefetch 提前预取，
 * 兼顾首屏加载性能与后续点击的瞬时跳转体验。
 */
const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  function SmartLink(
    { href, onMouseEnter, onFocus, onTouchStart, ...rest },
    ref,
  ) {
    const router = useRouter();
    const triggerPrefetch = () => {
      if (typeof href !== "string" || !href.startsWith("/")) return;
      if (prefetched.has(href)) return;
      prefetched.add(href);
      router.prefetch(href);
    };
    return (
      <Link
        ref={ref}
        href={href}
        prefetch={false}
        onMouseEnter={(e) => {
          triggerPrefetch();
          onMouseEnter?.(e);
        }}
        onFocus={(e) => {
          triggerPrefetch();
          onFocus?.(e);
        }}
        onTouchStart={(e) => {
          triggerPrefetch();
          onTouchStart?.(e);
        }}
        {...rest}
      />
    );
  },
);

export default SmartLink;
