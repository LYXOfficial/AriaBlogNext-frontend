export default function NoteTag({
  children,
  type,
}: {
  children: React.ReactNode;
  type?: string;
}) {
  return <div className={`etag-note ${type ?? "info"}`}>{children}</div>;
}
