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
      <span>{children}</span>
    </label>
  );
}
