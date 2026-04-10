"use client";

import { useEffect, useState } from "react";
import { User, UserCog, X } from "lucide-react";
import { useHeader } from "@/context/header";
import UserPage from "./user";
import RolePage from "./role";

export default function ConfigPage() {
  const { setHeader } = useHeader();
  const [page, setPage] = useState<"user" | "role">("user");
  const [openPage, setOpenPage] = useState(false);

  // Set header
  useEffect(() => {
    setHeader({ title: "Cấu hình" });
  }, []);

  const handleChange = async (value: "user" | "role" = "user") => {
    setPage(value);
    // const dt = await fetchData(value);
    // setData(dt);
  };

  return (
    <>
      <div>
        <div className="flex items-stretch space-x-4 border-b-2 border-gray-300">
          <div
            className={`flex items-center gap-1 px-1 pb-2.5 hover:cursor-pointer ${
              page === "user"
                ? "border-b-3 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => handleChange("user")}
          >
            <User width={20} height={20} />
            <span className="font-semibold">Người dùng</span>
          </div>

          <div
            className={`flex items-center gap-1 px-1 pb-2.5 hover:cursor-pointer ${
              page === "role"
                ? "border-b-3 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => handleChange("role")}
          >
            <UserCog width={20} height={20} />
            <span className="font-semibold">Vai trò</span>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${page === "role" ? "max-h-0" : ""} ${
            page === "user" ? "opacity-100" : "opacity-0"
          }`}
          style={{}}
        >
          <UserPage />
        </div>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden bg-blue-100/40 ${page === "user" ? "h-0" : ""} ${
            page === "role" ? "opacity-100" : "opacity-0"
          }`}
        >
          <RolePage />
        </div>
      </div>
    </>
  );
}
