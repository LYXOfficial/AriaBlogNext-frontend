import type { HTMLAttributes } from "react";

/**
 * markdown 表格包一层横向滚动容器。
 *
 * 为什么需要：列多或单元格很长时，原生 table 会把正文顶宽，而 html/body 用的是
 * overflow-x: clip——顶宽不会滚，只会被裁掉（连顶栏都可能跟着错位）。
 * 让表格自己滚就不会连累整页。样式见 styles/PostContent.css 的 .post-table-wrap。
 */
export default function MarkdownTable({
  children,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="post-table-wrap">
      <table {...props}>{children}</table>
    </div>
  );
}
