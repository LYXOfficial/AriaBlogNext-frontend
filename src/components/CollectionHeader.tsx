import "styles/Collections.css";
import type { ReactNode } from "react";

export default function CollectionHeader({
  eyebrow,
  title,
  extra,
}: {
  eyebrow: string;
  title: string;
  extra?: ReactNode;
}) {
  return (
    <header className="collection-header">
      <div className="collection-heading">
        <span className="collection-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {extra && <div className="collection-header-extra">{extra}</div>}
    </header>
  );
}
