"use client";

import { LazyLoadImage } from "react-lazy-load-image-component";
import { useFallbackImage } from "./ImageWithFalldown";

export function LazyImageWithFalldown({
  className,
  src,
  alt,
  falldownImg,
  dataSrc,
  objectPosition = "center",
  style,
}: {
  className?: string;
  dataSrc?: string;
  src?: string | null;
  alt: string;
  falldownImg?: string;
  objectPosition?: string;
  style?: React.CSSProperties;
}) {
  const { srcNow, onError } = useFallbackImage(src, falldownImg);
  return (
    <LazyLoadImage
      className={className}
      src={srcNow}
      data-src={dataSrc}
      alt={alt}
      onError={onError}
      effect="blur"
      wrapperProps={{
        style: { transitionDelay: "1s" },
      }}
      style={{ ...style, objectPosition: objectPosition }}
    />
  );
}
