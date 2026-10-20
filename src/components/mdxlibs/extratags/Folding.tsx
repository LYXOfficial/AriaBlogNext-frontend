import { ReactElement } from "react";
import colorName from "color-name";
import AnimatedDetails from "../builtins/AnimatedDetails";

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
    <AnimatedDetails
      className="etag-folding"
      defaultOpen={open}
      style={{
        border: `2px solid rgba(${colorName[color as keyof typeof colorName]},.3)`,
      }}
      summary={
        <span
          className="etag-folding-summary"
          style={{
            backgroundColor: `rgba(${colorName[color as keyof typeof colorName]},.15)`,
          }}
        >
          <svg
            className="etag-folding-arrow"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path
              d="m9 6 6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {summary}
        </span>
      }
    >
      <div className="etag-folding-content">{children}</div>
    </AnimatedDetails>
  );
}
