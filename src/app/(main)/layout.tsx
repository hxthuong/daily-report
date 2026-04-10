"use client";

import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import { Notification } from "@/context/notification";
import { useScreen } from "@/hooks/useScreen";
import { loadDataWithTTL } from "@/utils/secureStorage";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@/types/user";
import Cookies from "js-cookie";

type Action = "view" | "create" | "edit" | "delete";

type PermissionState = Record<
  string,
  {
    label: string;
    actions: Action[];
  }
>;

const initPermissions: PermissionState = {
  work: { label: "Công việc", actions: [] },
  file: { label: "File", actions: [] },
  user: { label: "Người dùng", actions: [] },
  role: { label: "Phân quyền", actions: [] },
};

const SIDEBAR_WIDTH = 260;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] =
    useState<PermissionState>(initPermissions);
  const [loaded, setLoaded] = useState(false);

  const { width } = useScreen();
  const pathname = usePathname();
  const router = useRouter();

  const dataLogin = loadDataWithTTL("KEY_LOGIN") as User;
  const supabase = createClient();

  // Auth
  useEffect(() => {
    if (!dataLogin || pathname === "/login") {
      Cookies.remove("permissions", { path: "/" });
      router.push("/login");
    }
  }, [dataLogin, pathname, router]);

  // Fetch permission
  useEffect(() => {
    if (!dataLogin) return;

    const fetchPermission = async () => {
      try {
        const { data, error } = await supabase.rpc("spu_dr_roles_gets", {
          p_id: dataLogin.roleid,
        });

        if (error) return;

        if (data?.length > 0) {
          setPermissions(data[0].permissions || initPermissions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoaded(true);
      }
    };

    fetchPermission();
  }, [dataLogin]);

  // Cookie
  useEffect(() => {
    if (!loaded) return;

    Cookies.set("permissions", JSON.stringify(permissions), {
      path: "/",
      sameSite: "strict",
    });
  }, [permissions, loaded]);

  const isDesktop = width > 940;

  return (
    <main className="min-h-screen bg-gray-200 dark:bg-black">
      {/* SIDEBAR */}
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        permissions={permissions}
        loaded={loaded}
      />

      {/* OVERLAY MOBILE */}
      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* HEADER */}
      <div
        className="fixed top-0 z-50 flex items-center justify-between bg-blue-950 pr-6 shadow-md transition-all duration-300"
        style={{
          left: isDesktop && open ? SIDEBAR_WIDTH : 0,
          width: isDesktop && open ? `calc(100% - ${SIDEBAR_WIDTH}px)` : "100%",
        }}
      >
        <div
          className="p-3 text-white hover:bg-blue-500 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </div>
        <Header />
      </div>

      {/* CONTENT */}
      <div
        className="pt-16 p-3 transition-all duration-300"
        style={{
          marginLeft: isDesktop && open ? SIDEBAR_WIDTH : 0,
        }}
      >
        <div className="rounded-2xl bg-white p-4 min-h-[calc(100vh-80px)] shadow-sm">
          {children}
        </div>
      </div>

      <Notification />
    </main>
  );
}
