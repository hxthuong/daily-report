"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CustomImage from "../image";
import { Briefcase, FileUp, PieChart, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type Action = "view" | "create" | "edit" | "delete";

type PermissionState = Record<
  string,
  {
    label: string;
    actions: Action[];
  }
>;

const menuSidebar = [
  { id: "1", name: "Dashboard", href: "/", icon: <PieChart /> },
  {
    id: "2",
    name: "Công việc",
    href: "/tasks",
    icon: <Briefcase />,
    permissionKey: "work",
  },
  {
    id: "3",
    name: "File",
    href: "/files",
    icon: <FileUp />,
    permissionKey: "file",
  },
  {
    id: "4",
    name: "Cấu hình",
    href: "/config",
    icon: <Settings />,
    permissionKey: "role",
  },
];

export default function Sidebar({
  open,
  onClose,
  permissions,
  loaded,
}: {
  open: boolean;
  onClose: () => void;
  permissions: PermissionState;
  loaded: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [currentId, setCurrentId] = useState<string>("1");

  // ✅ Filter menu theo permission
  const filteredMenu = useMemo(() => {
    if (!loaded) return [];

    return menuSidebar.filter((item) => {
      if (!item.permissionKey) return true;

      return permissions[item.permissionKey]?.actions?.includes("view");
    });
  }, [permissions, loaded]);

  // ✅ Active menu theo route
  useEffect(() => {
    const found = filteredMenu.find((x) => x.href === pathname);
    if (found) setCurrentId(found.id);
  }, [pathname, filteredMenu]);

  // ✅ ESC để đóng
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // ✅ Click outside để đóng
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!open) return;

      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      className="fixed top-0 left-0 h-full z-[60] bg-blue-950 shadow-lg transition-transform duration-300 ease-in-out will-change-transform"
      style={{
        width: 260,
        transform: open ? "translateX(0)" : "translateX(-100%)",
      }}
    >
      {/* ================= LOGO ================= */}
      <div className="flex flex-col items-center py-6">
        <CustomImage
          src="/images/logo.png"
          width={120}
          height={120}
          className="rounded-full"
        />
      </div>

      {/* ================= MENU ================= */}
      <div className="px-3">
        {/* Loading */}
        {!loaded && <div className="text-white text-sm px-2">Loading...</div>}

        {/* No permission */}
        {loaded && filteredMenu.length === 0 && (
          <div className="text-white text-sm px-2">⚠️ Không có quyền</div>
        )}

        {/* Menu items */}
        {filteredMenu.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setCurrentId(item.id);
              router.push(item.href);
              onClose();
            }}
            className={`px-3 py-2 mb-2 rounded flex items-center cursor-pointer font-semibold transition-colors ${
              currentId === item.id
                ? "bg-blue-100 text-blue-950"
                : "text-white hover:bg-blue-100 hover:text-blue-950"
            }`}
          >
            <div className="mr-2">{item.icon}</div>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
