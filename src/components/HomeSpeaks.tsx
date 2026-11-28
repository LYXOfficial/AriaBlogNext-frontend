"use client";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { BB } from "interfaces/bb";
import relativeTime from "utils/reltime";
import "styles/HomeSpeaks.css";
import Link from "components/SmartLink";

const SLIDE_HEIGHT = 30;

export default function HomeSpeaks({
  speaksContent,
  variant = "card",
}: {
  speaksContent: BB[];
  variant?: "card" | "banner";
}) {
  const count = speaksContent.length;
  // 铺 3 份列表（[...items, ...items, ...items]），平时停在中间段 [count, 2*count - 1]，
  // 支持单次连续拖拽多行并在任意距离无缝循环。
  const [pos, setPos] = useState(count > 1 ? count : 0);
  const [animate, setAnimate] = useState(true);
  const [dragY, setDragY] = useState<number | null>(null);
  const pausedRef = useRef(false);
  const wheelLockRef = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
  const posRef = useRef(pos);
  posRef.current = pos;

  const dragRef = useRef<{
    active: boolean;
    pointerId: number;
    startY: number;
    startPos: number;
    dy: number;
    moved: boolean;
  }>({
    active: false,
    pointerId: -1,
    startY: 0,
    startPos: 0,
    dy: 0,
    moved: false,
  });

  const normalizePos = (p: number) =>
    count > 1 ? count + (((p - count) % count) + count) % count : 0;

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current || dragRef.current.active) return;
      setAnimate(true);
      setPos((prev) => {
        const base =
          prev >= count * 2 || prev < count ? normalizePos(prev) : prev;
        return base + 1;
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [count]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || count <= 1) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      const now = Date.now();
      if (now - wheelLockRef.current < 260) return;
      wheelLockRef.current = now;
      setAnimate(true);
      setPos((prev) => {
        const base =
          prev >= count * 2 || prev < count ? normalizePos(prev) : prev;
        return event.deltaY > 0 ? base + 1 : base - 1;
      });
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, [count]);

  const computeDragOffsetPx = (startPos: number, dy: number) => {
    const loopHeight = count * SLIDE_HEIGHT;
    const virtualOffset = (startPos - count) * SLIDE_HEIGHT - dy;
    const wrapped = ((virtualOffset % loopHeight) + loopHeight) % loopHeight;
    return -(count * SLIDE_HEIGHT + wrapped);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (count <= 1) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const normalized = normalizePos(posRef.current);
    if (normalized !== posRef.current) {
      setAnimate(false);
      setPos(normalized);
    }
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startY: event.clientY,
      startPos: normalized,
      dy: 0,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const dy = event.clientY - drag.startY;
    drag.dy = dy;
    if (!drag.moved && Math.abs(dy) > 4) {
      drag.moved = true;
      setAnimate(false);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {}
    }
    if (drag.moved) {
      setDragY(computeDragOffsetPx(drag.startPos, dy));
    }
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const { dy, moved, startPos } = drag;
    drag.active = false;
    drag.pointerId = -1;
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {}
    if (!moved) {
      setDragY(null);
      return;
    }
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    const currentY = computeDragOffsetPx(startPos, dy);
    const visualPos = -currentY / SLIDE_HEIGHT;
    let targetPos = Math.round(visualPos);
    const threshold = SLIDE_HEIGHT * 0.25;
    if (targetPos === startPos && Math.abs(dy) >= threshold) {
      targetPos = dy < 0 ? startPos + 1 : startPos - 1;
    }
    setDragY(null);
    setAnimate(true);
    setPos(targetPos);
  };

  const slides =
    count > 1
      ? [...speaksContent, ...speaksContent, ...speaksContent]
      : speaksContent;

  const activeRealIndex = count > 1 ? (((pos - count) % count) + count) % count : 0;
  const translateY = dragY !== null ? dragY : -pos * SLIDE_HEIGHT;

  return (
    <section
      id="homespeaks-container"
      className={variant === "banner" ? "homespeaks-glass" : "card-widget"}
      aria-label="最新说说"
    >
      <Icon
        icon="mdi:comment"
        className="homespeaks-icon left"
        width={20}
        height={20}
      />
      <div
        ref={boxRef}
        className="homespeaks-bbbox"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={(event) => {
          if (suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {slides.length > 0 && (
          <div
            className="homespeaks-track"
            style={{
              transform: `translate3d(0, ${translateY}px, 0)`,
              transition: animate ? "transform 300ms ease" : "none",
            }}
            onTransitionEnd={() => {
              if (count <= 1) return;
              if (pos >= count * 2 || pos < count) {
                setAnimate(false);
                setPos(normalizePos(pos));
              }
            }}
          >
            {slides.map((item: BB, i: number) => {
              const isClone = count > 1 && (i < count || i >= count * 2);
              const isActive = count > 1 ? i - count === activeRealIndex : i === 0;
              return (
                <div
                  key={`${item.time}-${i}`}
                  className="homespeaks-slide"
                  aria-hidden={isClone || undefined}
                >
                  <Link
                    href="/speaks"
                    prefetch={false}
                    className="homespeaks-item"
                    draggable={false}
                    tabIndex={!isClone && isActive ? 0 : -1}
                  >
                    {relativeTime(item.time) + ": " + item.plainContent}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Icon
        icon="mdi:arrow-right"
        className="homespeaks-icon right"
        width={22}
        height={22}
      />
    </section>
  );
}
