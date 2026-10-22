export default function CheckBoxTag({
  children,
  checked,
}: {
  children: React.ReactNode;
  checked?: boolean;
}) {
  return (
    <label className="etag-checkbox">
      <input type="checkbox" checked={checked} disabled />
      {/* 原生勾选框的 ::after 在 iOS 上不可靠，改为自绘方框和 SVG 勾。 */}
      <span className="etag-checkbox-box" aria-hidden="true">
        <svg viewBox="0 0 16 16" focusable="false">
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
        </svg>
      </span>
      <span className="etag-checkbox-text">{children}</span>
    </label>
  );
}
