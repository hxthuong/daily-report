"use client";

import { useState, useMemo } from "react";
import Image, { ImageProps } from "next/image";

interface CustomImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  className?: string;
  fallbackSrcs?: string[];
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}

export default function CustomImage({
  src,
  alt,
  width,
  height,
  priority = false,
  fill = false,
  className,
  fallbackSrcs = ["/images/noImage.png"],
  onClick,
  ...props
}: CustomImageProps) {
  // Danh sách src (primary + fallback)
  const srcList = useMemo(
    () => (src ? [src, ...fallbackSrcs] : [...fallbackSrcs]),
    [src, fallbackSrcs],
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSrc = srcList[currentIndex];

  return (
    <Image
      src={currentSrc}
      alt={alt || ""}
      priority={priority} // ⭐ để Next.js tự xử lý eager/lazy
      loading={priority ? "eager" : "lazy"}
      {...(!fill
        ? {
            width: width || 0,
            height: height || 0,
          }
        : { fill: true })}
      className={className}
      onClick={onClick}
      onError={() => {
        // chuyển sang fallback tiếp theo
        if (currentIndex < srcList.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      }}
      {...props}
    />
  );
}
