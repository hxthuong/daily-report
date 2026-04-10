"use client";

import { Button } from "@/components/button";
import CustomImage from "@/components/image";
import { Notification, useNotification } from "@/context/notification";
import { User } from "@/types/user";
import { clearData, saveDataWithTTL } from "@/utils/secureStorage";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const notify = useNotification();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState<User | null>();
  const router = useRouter();
  const supabase = createClient();
  const KEY_LOGIN = "KEY_LOGIN";

  const handleLogin = async () => {
    clearData(KEY_LOGIN);

    if (!username.trim()) {
      notify.warning("Vui lòng nhập tên đăng nhập");
      return;
    }

    if (!password.trim()) {
      notify.warning("Vui lòng nhập mật khẩu");
      return;
    }

    // setLoading(true);

    const { data: dataLogin, error } = await supabase.rpc(
      "spu_dr_users_login",
      {
        p_username: username.trim(),
        p_password: password.trim(),
      },
    );

    if (error) {
      console.error("SUPABASE ERROR:", error);
      notify.error("Lỗi load dữ liệu");
      // setLoading(false);
      return;
    }

    const user = !dataLogin || dataLogin.length === 0 ? null : dataLogin[0];
    if (!user) {
      notify.error("Sai mật khẩu hoặc sai tên đăng nhập!");
      setPassword("");
      return;
    }

    setLogin(user);
    saveDataWithTTL(KEY_LOGIN, user, 1800);
    notify.success("Đăng nhập thành công!");
    router.push("/");
    // setLoading(false);
  };

  return (
    <>
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{
          backgroundImage: "url('/images/bg-login.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="bg-cyan-100/30 w-100 py-5 rounded-xl flex flex-col items-center justify-center">
          <CustomImage src="/images/logo.png" width={130} height={130} alt="" />
          <div
            className="mt-5 space-y-3 px-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          >
            <input
              className={`form-input`}
              value={username}
              placeholder="Tên đăng nhập"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className={`form-input`}
              value={password}
              type="password"
              placeholder="Mật khẩu"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              className="w-full bg-blue-700 text-white rounded-xl py-3 mt-5 font-semibold"
              onClick={handleLogin}
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </div>
      <Notification />
    </>
  );
}
