"use client";

import { MenuProps } from "@/types/menu";
import findItemByID from "@/utils/findItemByID";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ModalProps {
  data: MenuProps[];
  openModal: boolean;
  onClose: () => void;
  position?: "left" | "right" | "center";
  width?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function Modal({
  data,
  openModal,
  onClose,
  position = "left",
  width = "300px",
  className = "",
  children,
}: ModalProps) {
  const [visible, setVisible] = useState(false); // controls mounting
  const [slideIn, setSlideIn] = useState(false); // controls slide transform
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [stack, setStack] = useState<number[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const hasOverlay = !className.includes("no-overlay");
  const hasClickOutside = className.includes("clickout");

  function handleClose() {
    setSlideIn(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // match CSS transition duration
  }

  // animate when openModal changes
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (openModal) {
      setTimeout(() => setVisible(true), 0);
      timeout = setTimeout(() => setSlideIn(true), 20);
    } else {
      setTimeout(() => setSlideIn(false), 0);
      timeout = setTimeout(() => setVisible(false), 300);
    }

    return () => clearTimeout(timeout);
  }, [openModal]);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!hasOverlay) return;
    function onClick(e: MouseEvent) {
      if (!openModal) return;
      if (!panelRef.current) return;
      // if (!panelRef.current.contains(e.target as Node)) {
      //   handleClose();
      // }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openModal]);

  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // cleanup khi component unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [openModal]);

  const currentNode = currentId ? findItemByID(data, currentId) : null;
  const items = currentNode?.children || data;

  const handleBack = () => {
    const prev = stack.pop()!;
    setStack([...stack]);
    setCurrentId(prev === null ? null : prev);
  };

  if (!visible) return null;

  // extract bg-* class if exists
  const bgClass = className.split(" ").find((cls) => cls.startsWith("bg-"));
  const minWClass = className
    .split(" ")
    .find((cls) => cls.startsWith("min-w-"));

  // determine panel classes
  const panelClasses =
    position === "left" || position === "right"
      ? `fixed top-0 z-[70] h-full ${
          bgClass ?? "bg-white"
        } shadow-lg transform transition-transform duration-300 ease-in-out ${position === "right" ? "right-0" : "left-0"} flex flex-col ${
          position === "right"
            ? slideIn
              ? "translate-x-0"
              : "translate-x-full"
            : slideIn
              ? "translate-x-0"
              : "-translate-x-full"
        }`
      : `fixed top-1/2 left-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 transform transition-transform duration-300 ease-in-out bg-white ${minWClass ? minWClass : "min-w-[400px]"} min-h-[200px] rounded-xl ${
          slideIn ? "opacity-100" : "opacity-0 fade-out"
        }`;

  return (
    <>
      {/* Overlay */}
      {hasOverlay && (
        <div
          className={`fixed inset-0 z-60 transition-opacity duration-300 ${
            slideIn
              ? "opacity-60 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          } bg-black`}
          aria-hidden={!slideIn}
          onClick={(e) => {
            if (hasClickOutside) handleClose();
            e.stopPropagation();
          }}
          // onClick={handleClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        ref={panelRef}
        className={panelClasses}
        style={{ width }}
        aria-hidden={!slideIn}
      >
        {/* Header */}
        {currentNode?.name && (
          <div className="p-4 border-b flex items-center gap-2 shrink-0">
            {stack.length > 0 && (
              <button onClick={handleBack}>
                <ChevronLeft />
              </button>
            )}
            <span className="text-xl font-semibold">{currentNode.name}</span>
          </div>
        )}

        {/* Body */}
        <div className={`${className} flex-1 overflow-auto m-2.5`}>
          {stack.length === 0 && children}

          {items.map((item) => (
            <div
              key={item.id}
              className="p-2 rounded hover:bg-blue-100 text-lg flex justify-between cursor-pointer"
              onClick={() => {
                if (item.children && item.children.length > 0) {
                  setStack([...stack, Number(currentId) ?? null]);
                  setCurrentId(Number(item.id));
                } else if (item.href) {
                  handleClose();
                }
              }}
            >
              {item.href && !item.children ? (
                <Link href={item.href}>{item.name}</Link>
              ) : (
                <>
                  <span>{item.name}</span>
                  {item.children && <ChevronRight />}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
