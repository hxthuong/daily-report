"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { User } from "@/types/user";
import { useNotification } from "@/context/notification";
import { Option } from "@/types/dropdown";
import ImageUpload from "@/components/imageUpload";
import { Role } from "@/types/role";
import Dropdown from "@/components/dropDown";
import RadioButton from "@/components/radioButton";
import { clearData, saveDataWithTTL } from "@/utils/secureStorage";
import { createClient } from "@/utils/supabase/client";

export default function UserEditPage({
  UserID,
  data,
  isChangePass = true,
  fetchDataFn,
  onClose,
}: {
  UserID?: string | null;
  data: User | null;
  isChangePass?: boolean;
  fetchDataFn?: (
    strSearch?: string,
    from?: Date | null,
    to?: Date | null,
  ) => void;
  onClose: () => void;
}) {
  const notify = useNotification();
  // const [loading, setLoading] = useState(false);
  const [list, setList] = useState<User[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [roles, setRoles] = useState<Option[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<string>("1");
  const [file, setFile] = useState<File | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      // setLoading(true);

      const { data: dataUser, error } = await supabase.rpc(
        "spu_dr_users_gets",
        {
          p_pageindex: 0,
          p_pagesize: 0,
        },
      );

      if (error) {
        console.error("SUPABASE ERROR:", error);
        notify.error("Lỗi load dữ liệu");
        // setLoading(false);
        return;
      }
      setList(dataUser || []);
      // setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!data) return;

    setUsername(data.username || "");
    setFullName(data.fullname || "");
    setEmail(data.email || "");
    setPassword("xxxxxxxxxxxxxxxxxxxxx");
    setAvatar(data.avatar || null);
    setRole(data.role || "user");
    setIsActive(data.isactive === true ? "1" : "0");
  }, [data]);

  const fetchRoles = async () => {
    // setLoading(true);

    const { data: dataRole, error } = await supabase.rpc("spu_dr_roles_gets");

    if (error) {
      console.error("SUPABASE ERROR:", error);
      notify.error("Lỗi load dữ liệu");
      // setLoading(false);
      return;
    }

    const list = dataRole
      ? dataRole.map((item: Role) => ({
          id: item.rolename, // lấy ID uuid hoặc integer
          label: item.description, // hoặc item.Description nếu muốn hiển thị
        }))
      : [];

    setRoles(list);

    // match roleid nếu có
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (data && list.some((x: any) => x.id === data?.role)) {
      setRole(data.role!); // gán đúng ID
    } else {
      setRole("user"); // mặc định role đầu tiên hoặc null
    }
  };

  useEffect(() => {
    setTimeout(() => fetchRoles(), 0);
  }, []);

  const clearInput = () => {
    setUsername("");
    setFullName("");
    setEmail("");
    setPassword("");
    setAvatar(null);
    setRole("user");
    setIsActive("1");
  };

  const handleSave = async () => {
    if (!username.trim()) {
      notify.warning("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!password.trim() && !data) {
      notify.warning("Vui lòng nhập mật khẩu");
      return;
    }
    if (!fullName.trim()) {
      notify.warning("Vui lòng nhập họ và tên");
      return;
    }
    const duplicate = list.some(
      (x) =>
        x.username?.toLowerCase() === username.trim().toLowerCase() &&
        (!data || x.id !== data?.id),
    );
    if (duplicate) {
      notify.warning("Tên đăng nhập đã tồn tại");
      return;
    }

    try {
      let avatarUrl = avatar;

      // Upload avatar nếu có file
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars") // bucket phải tồn tại
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarUrl = publicData.publicUrl;
      }

      // RPC create/update user
      const { data: result, error } = await supabase.rpc(
        "spu_dr_users_addedit",
        {
          p_id: data?.id ?? null,
          p_username: username.trim(),
          p_fullname: fullName.trim(),
          p_email: email?.trim() ?? null,
          p_password:
            !data || password !== "xxxxxxxxxxxxxxxxxxxxx" ? password : null,
          p_avatar: !avatarUrl?.trim() ? "" : avatarUrl,
          p_role: role ?? roles[0]?.id ?? "user",
          p_isactive: isActive === "1",
          p_userid: UserID || null,
        },
      );

      if (error) throw error;

      if (fetchDataFn) await fetchDataFn();

      // Update local storage
      if (result) {
        const login = {
          id: result.id,
          username: result.username,
          fullname: result.fullname,
          email: result.email,
          role: result.role,
          isactive: result.isactive,
          avatar: result.avatar,
        };
        clearData("KEY_LOGIN");
        saveDataWithTTL("KEY_LOGIN", login, 1800);
      }

      notify.success(!data ? "Thêm mới thành công" : "Cập nhật thành công");
      onClose();
      clearInput();
    } catch (err) {
      console.error(err);
      notify.error(!data ? "Thêm mới thất bại" : "Cập nhật thất bại");
    }
  };

  return (
    <div className="w-full grid grid-cols-7 gap-y-1 gap-x-4 ">
      <div className="col-span-2">
        <p className="form-label">Ảnh đại diện</p>
        <div className="max-w-50 max-h-50">
          <ImageUpload
            preview={avatar || ""}
            onFileChange={(f) => {
              setFile(f);
              if (!f) {
                setAvatar(null); // 👈 reset avatar khi X
              }
            }}
          />
        </div>
      </div>
      <div className="col-span-5 grid grid-col-2 gap-x-3 edit-user">
        <div className="col-span-1">
          <p className="form-label">Tên đăng nhập</p>
          <input
            className="form-input disabled:bg-gray-100!"
            disabled={data !== null}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <p className="form-label">Mật khẩu</p>
          <input
            className="form-input disabled:bg-gray-100!"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!isChangePass}
          />
        </div>
        <div className="col-span-1">
          <p className="form-label">Họ và tên</p>
          <input
            className="form-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <p className="form-label">Vai trò</p>
          {roles.length > 0 ? (
            <Dropdown
              className="hover:border-blue-400 form-input"
              options={roles}
              value={String(role)} // guaranteed to match an id in categories
              onSelect={(option) =>
                setRole(Array.isArray(option) ? "" : String(option?.id))
              }
            />
          ) : (
            <input
              className="form-input"
              disabled
              placeholder="Đang tải danh sách nhân viên..."
            />
          )}
        </div>
        <div className="col-span-2">
          <p className="form-label">Email</p>
          <input
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <p className="form-label">Trạng thái</p>
          <div className="flex items-center space-x-3">
            <RadioButton
              label="Hoạt động"
              value={"1"}
              checked={isActive === "1"}
              onChange={(e) => {
                setIsActive(e.target.value);
              }}
            />
            <RadioButton
              label="Vô hiệu"
              value={"0"}
              checked={isActive === "0"}
              onChange={(e) => {
                setIsActive(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <div className="col-span-7 flex items-end justify-end space-x-3 border-t border-t-gray-300 pt-4 mt-3">
        <Button
          className="text-white bg-blue-700 font-semibold p-3 rounded-xl border border-blue-700 min-w-30"
          onClick={handleSave}
        >
          Lưu
        </Button>
        <Button
          className="text-gray-500! bg-transparent font-semibold p-3 rounded-xl min-w-30 border border-gray-500 hover:bg-transparent!"
          onClick={onClose}
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}
