"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CircleX } from "lucide-react";

export default function ImageUpload({
  preview,
  alt = "",
  onFileChange,
}: {
  preview?: string;
  alt?: string;
  onFileChange?: (file: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState("");

  const handleClick = () => {
    ref.current?.click();
  };

  useEffect(() => {
    setTimeout(() => {
      if (preview) setImage(preview);
    }, 0);
  }, [preview]);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setImage(url);

      onFileChange?.(file);
    }
  };

  const handleClear = () => {
    setImage("");
    if (ref.current) ref.current.value = "";
    onFileChange?.(null);
  };

  return (
    <div className="relative">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <div
        className="relative w-full h-40"
        style={{
          backgroundImage: `url("/avatars/face-0.jpg")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div
          className="w-full h-40"
          style={{
            backgroundImage: `url(${image || ""})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          onClick={handleClick}
        ></div>
        {image && image !== "/avatars/face-0.jpg" && (
          <CircleX
            className="absolute right-1 top-1 text-red-500"
            onClick={handleClear}
          />
        )}
      </div>
    </div>
  );
}
