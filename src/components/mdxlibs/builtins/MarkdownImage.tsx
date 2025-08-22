"use client";
import { LazyImageWithFalldown } from "../../ImageWithFalldown";

export default function MarkdownImage({
  src,
  alt,
}: {
  src: string;
  alt?: string;
}) {
  return (
    <a
      href={src}
      className="fancybox-img-a"
      title="点击查看大图"
      data-fancybox="gallery"
    >
      <LazyImageWithFalldown
        alt={alt ?? ""}
        dataSrc={src}
        src={src}
        className="fancybox-img"
      />
      <span className="normal-img-descr">{alt}</span>
    </a>
  );
}
