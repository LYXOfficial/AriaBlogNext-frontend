"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "styles/ASide/HomePanels.css";

export default function HomeAsidePanels({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState("");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const toggle = (event: Event) => {
      const name = (event as CustomEvent<string>).detail;
      setPanel((current) => current === name ? "" : name);
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!root.current?.contains(target) && !target.closest("[data-home-panel]")) setPanel("");
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel("");
    };
    window.addEventListener("home-aside-panel", toggle);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("home-aside-panel", toggle);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  useEffect(() => {
    document.querySelectorAll<HTMLButtonElement>("[data-home-panel]").forEach((button) => {
      button.setAttribute("aria-expanded", String(button.dataset.homePanel === panel));
    });
  }, [panel]);
  return <div ref={root} className="aside-sticky-container home-aside-panels" data-panel={panel}>
    {children}
  </div>;
}
