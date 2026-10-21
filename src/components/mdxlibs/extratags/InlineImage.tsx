import { LazyImageWithFalldown } from "@/components/ImageWithFalldown";

export default function MarkdownImage({
  src,
  alt,
  width,
}: {
  src: string;
  alt?: string;
  width?: string | number;
}) {
  return (
    <a
      href={src}
      className="fancybox-img-a inline-image"
      title="点击查看大图"
      data-fancybox="gallery"
      style={{ width }}
    >
      <LazyImageWithFalldown
        alt={alt ?? ""}
        dataSrc={src}
        src={src}
        className="fancybox-img"
        style={{ width: "100%" }}
      />
      <span className="normal-img-descr">{alt}</span>
    </a>
  );
}
