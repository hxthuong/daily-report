"use client";

import { Button } from "@headlessui/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPage: number;
  delta?: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPage,
  delta = 1,
  onPageChange,
}: PaginationProps) {
  if (totalPage <= 1) return null;

  // 1️⃣ Tạo danh sách trang cần hiển thị
  const pages: number[] = [];
  for (let i = 1; i <= totalPage; i++) {
    if (
      i === 1 ||
      i === totalPage ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    }
  }

  const uniquePages = Array.from(new Set(pages)).sort((a, b) => a - b);

  // 2️⃣ Xử lý ellipsis
  const useEllipsis = totalPage > delta * 2 + 3;
  const finalPages: (number | string)[] = [];

  if (!useEllipsis) {
    finalPages.push(...Array.from({ length: totalPage }, (_, i) => i + 1));
  } else {
    let last = 0;
    for (const p of uniquePages) {
      if (p - last > 1) finalPages.push("...");
      finalPages.push(p);
      last = p;
    }
  }

  // 3️⃣ Class chung cho button / link
  const baseBtnClass =
    "flex items-center justify-center w-10 h-10 rounded text-[14px] transition-colors duration-200";
  const activeClass = "bg-blue-700 text-white border-blue-700";
  const defaultClass =
    "bg-blue-100 text-blue-700 border border-gray-300 hover:bg-blue-200";
  const disabledClass = "bg-gray-300 text-gray-400 cursor-not-allowed";

  const iconClass = "w-5 h-5";

  return (
    <div className="flex items-center justify-end gap-1 flex-wrap mt-3">
      {/* First */}
      <Button
        className={`${baseBtnClass} ${
          currentPage === 1 ? disabledClass : defaultClass
        }`}
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className={iconClass} />
      </Button>

      {/* Prev */}
      <Button
        className={`${baseBtnClass} ${
          currentPage === 1 ? disabledClass : defaultClass
        }`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className={iconClass} />
      </Button>

      {/* Page Numbers */}
      {finalPages.map((p, i) =>
        p === "..." ? (
          <span key={"dots-" + i} className="px-3 py-1">
            {p}
          </span>
        ) : (
          <Button
            key={p}
            onClick={() => onPageChange(Number(p))}
            className={`${baseBtnClass} ${
              Number(p) === currentPage ? activeClass : defaultClass
            }`}
          >
            {p}
          </Button>
        )
      )}

      {/* Next */}
      <Button
        className={`${baseBtnClass} ${
          currentPage === totalPage ? disabledClass : defaultClass
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPage}
      >
        <ChevronRight className={iconClass} />
      </Button>

      {/* Last */}
      <Button
        className={`${baseBtnClass} ${
          currentPage === totalPage ? disabledClass : defaultClass
        }`}
        onClick={() => onPageChange(totalPage)}
        disabled={currentPage === totalPage}
      >
        <ChevronsRight className={iconClass} />
      </Button>
    </div>
  );
}
