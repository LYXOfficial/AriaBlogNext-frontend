"use client";

import { useId, useState, type ReactNode } from "react";

export default function CollectionSwitcher({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`collection-switcher${open ? " is-open" : ""}`}>
      <button
        className="collection-switcher-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {label}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="m6 9 6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className="collection-switcher-panel"
        id={id}
        inert={!open}
        aria-hidden={!open}
      >
        <div className="collection-switcher-inner">
          <div className="collection-switcher-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
