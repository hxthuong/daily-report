"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function FixedButton({
  visible,
  setVisible,
  className,
  icon,
  handleChange,
}: {
  visible: boolean;
  setVisible?: (v: boolean) => void;
  className?: string;
  icon?: React.ReactNode;
  handleChange?: () => void;
}) {
  if (!visible) return null;

  return (
    <button
      onClick={handleChange}
      className={`
        fixed bottom-25 right-6 z-50 p-3 rounded-full shadow-2xl
        bg-blue-700 text-white
        transform transition-all duration-400
        ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        }
        hover:bg-blue-300
        ${className}
      `}
    >
      {icon}
    </button>
  );
}
