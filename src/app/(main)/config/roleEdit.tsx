"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import RadioButton from "@/components/radioButton";
import { useNotification } from "@/context/notification";
import CheckBoxButton from "@/components/checkboxButton";
import { Role } from "@/types/role";
import { createClient } from "@/utils/supabase/client";
import { useScreen } from "@/hooks/useScreen";
import { Info, UserKey } from "lucide-react";

type PermissionState = Record<
  string,
  {
    label: string;
    actions: Action[];
  }
>;

const initPermissions = {
  work: { label: "Công việc", actions: [] },
  file: { label: "File", actions: [] },
  user: { label: "Người dùng", actions: [] },
  role: { label: "Phân quyền", actions: [] },
};

type Action = "view" | "create" | "edit" | "delete";

const ALL_ACTIONS: Action[] = ["view", "create", "edit", "delete"];

const ACTIONS: { key: Action; label: string }[] = [
  { key: "view", label: "Xem" },
  { key: "create", label: "Thêm" },
  { key: "edit", label: "Sửa" },
  { key: "delete", label: "Xóa" },
];

export default function RoleEditPage({
  data,
  fetchDataFn,
  onClose,
}: {
  data: Role | null;
  fetchDataFn: (
    strSearch?: string,
    from?: Date | null,
    to?: Date | null,
  ) => void;
  onClose: () => void;
}) {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);

  const [list, setList] = useState<Role[]>([]);
  const [roleName, setRoleName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("1");
  const [permissions, setPermissions] =
    useState<PermissionState>(initPermissions);

  const permissionArray = Object.entries(permissions).map(([key, value]) => ({
    key,
    ...value,
  }));

  const supabase = createClient();
  const { width } = useScreen();

  useEffect(() => {
    (async () => {
      const { data: dataRole, error } = await supabase.rpc("spu_dr_roles_gets");

      if (error) {
        console.error("SUPABASE ERROR:", error);
        notify.error("Lỗi load dữ liệu");
        return;
      }

      setList(dataRole || []);
    })();
  }, []);

  useEffect(() => {
    if (!data) {
      clearInput();
      return;
    }

    setRoleName(data.rolename ?? "");
    setDescription(data.description ?? "");
    setIsActive(data.isactive === true ? "1" : "0");
    setPermissions(!data.permissions ? initPermissions : data.permissions);
  }, [data]);

  const clearInput = () => {
    setRoleName("");
    setDescription("");
    setIsActive("1");
    setPermissions(initPermissions);
  };

  // ROW: toggle 1 action
  const toggleAction = (key: string, action: Action, checked: boolean) => {
    setPermissions((prev) => {
      const current = prev[key].actions;

      const newActions = checked
        ? [...new Set([...current, action])]
        : current.filter((a) => a !== action);

      return {
        ...prev,
        [key]: {
          ...prev[key],
          actions: newActions,
        },
      };
    });
  };

  // ROW: toggle all
  const toggleRowAll = (key: string, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        actions: checked ? ALL_ACTIONS : [],
      },
    }));
  };

  // COLUMN: toggle
  const toggleColumn = (action: Action, checked: boolean) => {
    setPermissions((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        const current = updated[key].actions;

        updated[key].actions = checked
          ? [...new Set([...current, action])]
          : current.filter((a) => a !== action);
      });

      return updated;
    });
  };

  // TABLE: toggle all
  const toggleAll = (checked: boolean) => {
    setPermissions((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        updated[key].actions = checked ? ALL_ACTIONS : [];
      });

      return updated;
    });
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      notify.warning("Vui lòng nhập vai trò");
      return;
    }

    if (!description.trim()) {
      notify.warning("Vui lòng nhập mô tả");
      return;
    }

    const duplicate = list.some(
      (x) =>
        x.rolename?.toLowerCase() === roleName.trim().toLowerCase() &&
        (!data || x.id !== data?.id),
    );

    if (duplicate) {
      notify.warning("Vai trò đã tồn tại");
      return;
    }

    try {
      const { error } = await supabase.rpc("spu_dr_roles_addedit", {
        p_id: data?.id ?? null,
        p_rolename: roleName.trim(),
        p_description: description.trim(),
        p_permissions: permissions || initPermissions,
        p_isactive: isActive === "1",
      });

      if (error) throw error;

      if (fetchDataFn) {
        await fetchDataFn(); // ✅ đợi insert xong rồi mới reload
      }

      notify.success(!data ? "Thêm mới thành công" : "Cập nhật thành công");

      clearInput();
      onClose();
    } catch (err) {
      console.error(err);
      notify.error(!data ? "Thêm mới thất bại" : "Cập nhật thất bại");
    }
  };

  return (
    <div className="grid grid-cols-6 gap-3 edit-role">
      {width > 768 ? (
        <>
          <div className="col-span-6 grid grid-cols-6 gap-x-3 items-start mb-1">
            <div className="col-span-2">
              <p className="form-label">Vai trò</p>
              <input
                className="form-input"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <p className="form-label">Mô tả</p>
              <input
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <p className="form-label">Trạng thái</p>
              <div className="flex items-center space-x-3 mt-2">
                <RadioButton
                  label="Sử dụng"
                  value={"1"}
                  checked={isActive === "1"}
                  onChange={(e) => setIsActive(e.target.value)}
                />
                <RadioButton
                  label="Vô hiệu"
                  value={"0"}
                  checked={isActive === "0"}
                  onChange={(e) => setIsActive(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="col-span-6">
            {/* <p className="form-label">Phân quyền</p> */}
            <div className="space-y-4 mt-2">
              {/* HEADER */}
              <div className="grid grid-cols-7 font-semibold items-center bg-blue-100 py-2.5 rounded-lg">
                <div className="col-span-2"></div>

                {/* ALL */}
                <CheckBoxButton
                  label="Tất cả"
                  value="all"
                  checked={Object.values(permissions).every(
                    (p) => p.actions.length === ALL_ACTIONS.length,
                  )}
                  onChange={(checked) => toggleAll(checked)}
                />

                {ACTIONS.map((action, idx) => (
                  <CheckBoxButton
                    key={idx}
                    label={action.label}
                    value={action.key}
                    checked={Object.values(permissions).every((p) =>
                      p.actions.includes(action.key),
                    )}
                    onChange={(checked) => toggleColumn(action.key, checked)}
                  />
                ))}
              </div>

              {/* BODY */}
              {permissionArray.map((item) => {
                const actions = permissions[item.key].actions;

                return (
                  <div
                    key={item.key}
                    className="grid grid-cols-7 items-center border-b border-b-gray-300 pb-3"
                  >
                    {/* LABEL */}
                    <div className="col-span-2 font-semibold pl-3">
                      {item.label}
                    </div>

                    {/* ROW ALL */}
                    <CheckBoxButton
                      label=""
                      value="all"
                      checked={actions.length === ALL_ACTIONS.length}
                      onChange={(checked) => toggleRowAll(item.key, checked)}
                    />

                    {ACTIONS.map((action, idx) => (
                      <CheckBoxButton
                        key={idx}
                        label=""
                        value={action.key}
                        checked={actions.includes(action.key)}
                        onChange={(checked) =>
                          toggleAction(item.key, action.key, checked)
                        }
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-6 mt-15 flex items-end justify-end space-x-3">
            <Button
              className="text-white bg-blue-700 font-semibold p-3 rounded-xl border border-blue-700 min-w-30"
              onClick={handleSave}
            >
              Lưu
            </Button>
          </div>
        </>
      ) : (
        <>
          <div
            className={`col-span-6 w-full bg-white p-4 rounded-lg gap-3 shadow-lg shadow-gray-300`}
          >
            <div className="w-full flex mb-3 border-b border-b-gray-400 pb-3 text-blue-800 space-x-2 items-center">
              <Info width={22} height={22} />
              <h3 className="text-xl font-semibold text-blue-800 pr-4">
                Thông tin cơ bản
              </h3>
            </div>
            <div className="w-full">
              <div className="col-span-6 grid grid-cols-6 gap-x-3 items-start mb-1">
                <div className={width >= 768 ? "col-span-2" : "col-span-6"}>
                  <p className="form-label">Vai trò</p>
                  <input
                    className="form-input"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>
                <div className={width >= 768 ? "col-span-2" : "col-span-6"}>
                  <p className="form-label">Mô tả</p>
                  <input
                    className="form-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className={width >= 768 ? "col-span-2" : "col-span-6"}>
                  <p className="form-label">Trạng thái</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <RadioButton
                      label="Sử dụng"
                      value={"1"}
                      checked={isActive === "1"}
                      onChange={(e) => setIsActive(e.target.value)}
                    />
                    <RadioButton
                      label="Vô hiệu"
                      value={"0"}
                      checked={isActive === "0"}
                      onChange={(e) => setIsActive(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`col-span-6 w-full gap-3 `}>
            <div className="w-full mb-3 border-b border-b-gray-400 pb-3 flex justify-between items-center-safe">
              <div className=" flex  text-blue-800 space-x-2 items-center">
                <UserKey width={22} height={22} />
                <h3 className="text-xl font-semibold text-blue-800 pr-4">
                  Phân quyền
                </h3>
              </div>
              {/* ALL */}
              <div className="font-semibold pt-1">
                <CheckBoxButton
                  label="Tất cả"
                  value="all"
                  checked={Object.values(permissions).every(
                    (p) => p.actions.length === ALL_ACTIONS.length,
                  )}
                  onChange={(checked) => toggleAll(checked)}
                />
              </div>
            </div>
            <div className="w-full">
              {/* BODY */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* 🔁 LOOP 1: MODULE */}
                {permissionArray.map((item) => {
                  const actions = permissions[item.key]?.actions || [];

                  return (
                    <div
                      key={item.key}
                      className="shadow-md p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition"
                    >
                      {/* HEADER */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{item.label}</h3>

                        {/* CHECK ALL */}
                        <CheckBoxButton
                          label=""
                          value="all"
                          checked={actions.length === ALL_ACTIONS.length}
                          onChange={(checked) =>
                            toggleRowAll(item.key, checked)
                          }
                        />
                      </div>

                      {/* ACTION LIST */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* 🔁 LOOP 2: ACTION */}
                        {ACTIONS.map((action) => (
                          <div
                            key={action.key}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition bg-blue-100"
                          >
                            <span className="font-medium">{action.label}</span>

                            <CheckBoxButton
                              label=""
                              value={action.key}
                              checked={actions.includes(action.key)}
                              onChange={(checked) =>
                                toggleAction(item.key, action.key, checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-5 flex items-end justify-end space-x-3">
              <Button
                className="text-white bg-blue-700 font-semibold p-3 rounded-xl border border-blue-700 min-w-30"
                onClick={handleSave}
              >
                Lưu
              </Button>
              <Button
                className="bg-white text-gray-500! font-semibold p-3 rounded-xl min-w-30 border border-gray-500 hover:bg-transparent!"
                onClick={onClose}
              >
                Đóng
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
