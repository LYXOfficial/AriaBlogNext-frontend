export default function ColorTextTag({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return <span style={{ color: color }}>{children}</span>;
}
