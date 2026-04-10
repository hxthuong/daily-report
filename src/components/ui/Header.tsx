"use client";

import { User as UserIcon, PencilLine, Cog, LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Listbox, ListboxButton, ListboxOptions } from "@headlessui/react";
import CustomImage from "../image";
import { useHeader } from "@/context/header";
import { clearData, loadDataWithTTL } from "@/utils/secureStorage";
import { useRouter } from "next/navigation";
import Modal from "../modal";
import { Button } from "../button";
import { User } from "@/types/user";
import { notify } from "@/context/notification";
import UserEditPage from "@/app/(main)/config/userEdit";
import { createClient } from "@/utils/supabase/client";
import Cookies from "js-cookie";
import { useScreen } from "@/hooks/useScreen";

export default function Header() {
  const { title, children } = useHeader();
  const [mounted, setMounted] = useState<boolean>(false);
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState<User | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [message, setMessage] = useState("");

  const [openInfo, setOpenInfo] = useState(false);

  const dataLogin = loadDataWithTTL("KEY_LOGIN") as User;
  const supabase = createClient();
  const { width } = useScreen();

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const handleLogOut = () => {
    clearData("KEY_LOGIN");
    if (Cookies.get("permissions")) {
      // Xóa cookie permissions
      Cookies.remove("permissions", { path: "/" });
    }
    router.push("/login");
  };

  const handleChange = async () => {
    console.log(dataLogin?.id);
    if (!oldPassword.trim()) {
      setMessage("Vui lòng nhập mật khẩu hiện tại");
      setIsValid(false);
      return;
    }

    if (!newPassword.trim()) {
      setMessage("Vui lòng nhập mật khẩu mới");
      setIsValid(false);
      return;
    }

    if (!reNewPassword.trim()) {
      setMessage("Vui lòng nhập lại mật khẩu mới");
      setIsValid(false);
      return;
    }

    if (!newPassword.trim().includes(reNewPassword.trim())) {
      setMessage("Mật khẩu mới và mật khẩu nhập lại không khớp nhau");
      setIsValid(false);
      return;
    }

    const { data: result, error } = await supabase.rpc(
      "spu_dr_users_change_password",
      {
        p_id: dataLogin?.id, // ✅ đúng tên
        p_oldpassword: oldPassword,
        p_newpassword: newPassword,
      },
    );

    if (error) {
      console.error("SUPABASE ERROR:", error);
      notify.error(error.message);
      return;
    }

    const user = result && result.length > 0 ? result[0] : null;
    if (!user) {
      setMessage("Mật khẩu hiện tại không đúng");
      setIsValid(false);
      return;
    }
    setData(user);
    setMessage("");
    setIsValid(true);
    notify.success("Đổi mật khẩu thành công");

    setOldPassword("");
    setNewPassword("");
    setReNewPassword("");
    setOpenModal(false);
  };

  if (!mounted) return null;

  return (
    <>
      <div
        className={`relative w-full flex items-center justify-between banner-container text-blue-900`}
      >
        <h3 className="ml-3 text-white font-semibold text-lg">{title}</h3>
        <div className="flex items-center space-x-2 text-white ">
          <Listbox>
            <ListboxButton>
              <CustomImage
                src={dataLogin?.avatar || "/avatars/face-0.jpg"}
                width={60}
                height={60}
                className="rounded-full p-2"
              />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom"
              className="relative border border-gray-300 rounded-lg py-2 space-y-2 focus:ring-0 outline-none bg-white hover:cursor-pointer w-full"
              style={{ width: 200 }}
            >
              <div className="flex flex-col">
                <Link
                  className="p-3 flex items-center space-x-2 text-gray-500 hover:bg-blue-100"
                  href={"/"}
                  onClick={() => setOpenInfo(true)}
                >
                  <UserIcon className="w-4 h-4" /> <span>Thông tin</span>
                </Link>
                <Link
                  className="p-3 flex items-center space-x-2 text-gray-500 hover:bg-blue-100"
                  href={"/"}
                  onClick={() => setOpenModal(true)}
                >
                  <PencilLine className="w-4 h-4" /> <span>Đổi mật khẩu</span>
                </Link>
                {/* <Link
                  className="p-3 flex items-center space-x-2 text-gray-500 hover:bg-blue-100"
                  href={"/"}
                >
                  <Cog className="w-4 h-4" /> <span>Cài đặt</span>
                </Link> */}
                <Link
                  className="p-3 flex items-center space-x-2 text-gray-500 hover:bg-blue-100"
                  href={"/"}
                  onClick={handleLogOut}
                >
                  <LogOut className="w-4 h-4" /> <span>Đăng xuất</span>
                </Link>
              </div>
            </ListboxOptions>
          </Listbox>
        </div>
      </div>

      {/* Modal đổi mật khẩu */}
      <Modal
        openModal={openModal}
        onClose={() => setOpenModal(false)}
        data={[]}
        position="center"
        className={`w-full flex items-center justify-center mx-0! mb-5 min-w-[${width}px]`}
        width={width >= 400 ? "400px" : `${width}px`}
      >
        <div className="w-full flex-col px-5">
          <div className="pb-3 mb-3 flex items-start justify-between shrink-0 border-b border-b-gray-300">
            <span className="text-xl font-semibold text-blue-800 pr-4">
              Đổi mật khẩu
            </span>
            <Button onClick={() => setOpenModal(false)}>
              <X className="text-red-400" />
            </Button>
          </div>
          <div className="w-full flex-col space-y-3 px-10">
            <div>
              <p className="form-label">Mật khẩu hiện tại</p>
              <input
                className={`form-input`}
                value={oldPassword}
                type="password"
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div>
              <p className="form-label">Mật khẩu mới</p>
              <input
                className={`form-input`}
                value={newPassword}
                type="password"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <p className="form-label">Nhập lại mật khẩu mới</p>
              <input
                className={`form-input`}
                value={reNewPassword}
                type="password"
                onChange={(e) => setReNewPassword(e.target.value)}
              />
            </div>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden text-red-500 ${
                !isValid ? "opacity-100 max-h-20" : "opacity-0 max-h-0"
              }`}
            >
              {message}
            </div>
            <Button
              className="w-full bg-blue-700 text-white rounded-xl py-3 font-semibold"
              onClick={handleChange}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal thông tin */}
      <Modal
        openModal={openInfo}
        onClose={() => setOpenInfo(false)}
        data={[]}
        position="center"
        className={`w-full flex items-center justify-center mx-0! mb-5 min-w-[${width}px]`}
        width={width >= 600 ? "600px" : `${width}px`}
      >
        <div className="w-full flex-col mt-5 space-y-3 px-5">
          <div className="pb-3 mb-3 flex items-start justify-between shrink-0 border-b border-b-gray-300">
            <span className="text-xl font-semibold text-blue-800 pr-4">
              Chỉnh sửa thông tin
            </span>
            <Button onClick={() => setOpenInfo(false)}>
              <X className="text-red-400" />
            </Button>
          </div>
          <UserEditPage
            data={dataLogin || null}
            onClose={() => setOpenInfo(false)}
            isChangePass={false}
          />
        </div>
      </Modal>
    </>
  );
}
