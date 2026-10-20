"use client";
import Image from "next/image";
import { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

const TRANSPARENT_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function useFallbackImage(src?: string | null, falldownImg?: string | null) {
  const primary = src?.trim() || "";
  const fallback = falldownImg?.trim() || TRANSPARENT_IMAGE;
  const [failure, setFailure] = useState({ primary, fallback, stage: 0 });
  // 地址变化后立即重试新图；不能等 onError 才兜底空地址，React/Next 会先报错。
  const sourceChanged =
    failure.primary !== primary || failure.fallback !== fallback;
  if (sourceChanged) {
    setFailure({ primary, fallback, stage: 0 });
  }
  const stage = sourceChanged ? 0 : failure.stage;
  const srcNow =
    stage >= 2
      ? TRANSPARENT_IMAGE
      : primary && stage === 0
        ? primary
        : fallback;

  return {
    srcNow,
    onError: () => {
      // 备用图也可能失效，最后用内嵌透明图，避免反复请求坏图。
      if (srcNow === TRANSPARENT_IMAGE) return;
      setFailure({ primary, fallback, stage: srcNow === fallback ? 2 : 1 });
    },
  };
}
export default function ImageWithFalldown({
  className,
  src,
  alt,
  falldownImg,
  dataSrc,
  objectPosition = "center",
  sizes = "100vw",
  quality,
  optimize = false,
}: {
  className?: string;
  dataSrc?: string;
  src?: string | null;
  alt: string;
  falldownImg?: string;
  objectPosition?: string;
  sizes?: string;
  quality?: number;
  /** 只有小图才设为 true：走 Next 图片优化；大图保持直接引用原图 */
  optimize?: boolean;
}) {
  const { srcNow, onError } = useFallbackImage(src, falldownImg);
  return (
    <Image
      fill={true}
      className={className}
      src={srcNow}
      data-src={dataSrc}
      sizes={sizes}
      quality={quality}
      unoptimized={!optimize}
      alt={alt}
      onError={onError}
      style={{
        objectPosition: objectPosition,
      }}
      blurDataURL="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
    />
  );
}

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
export function ImgWithFalldown({
  className,
  src,
  alt,
  dataSrc,
  falldownImg,
}: {
  className: string;
  dataSrc?: string;
  src?: string | null;
  alt?: string;
  falldownImg?: string;
}) {
  const { srcNow, onError } = useFallbackImage(src, falldownImg);
  return (
    <img
      className={className}
      src={srcNow}
      data-src={dataSrc}
      alt={alt ?? ""}
      onError={onError}
    />
  );
}
