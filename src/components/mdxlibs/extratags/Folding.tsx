import { ReactElement } from "react";
import colorName from "color-name";

export default function FoldingTag({
  children,
  open,
  color,
  summary,
}: {
  children: ReactElement[] | ReactElement;
  open?: boolean;
  color?: string;
  summary: string;
}) {
  color = color ?? "gray";
  return (
    <details
      className={`etag-folding${open ? " open" : ""}`}
      style={{
        border: `2px solid rgba(${colorName[color as keyof typeof colorName]},.3)`,
      }}
    >
      <summary
        className="etag-folding-summary"
        style={{
          backgroundColor: `rgba(${colorName[color as keyof typeof colorName]},.15)`,
        }}
      >
        {summary}
      </summary>
      <div className="etag-folding-content">{children}</div>
    </details>
  );
}
