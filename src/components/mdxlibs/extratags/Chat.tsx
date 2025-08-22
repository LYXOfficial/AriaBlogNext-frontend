export default function ChatTag({
  children,
  position,
  author,
}: {
  children: React.ReactNode;
  position: "left" | "right";
  author?: string;
}) {
  return (
    <div className={`etag-chat ${position}`}>
      <div className="etag-chat-content">
        <span className="etag-chat-author">{author}</span>
        <div className="etag-chat-message">{children}</div>
      </div>
    </div>
  );
}
