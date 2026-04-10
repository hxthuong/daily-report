"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useNotification } from "@/context/notification";
import { Button } from "@/components/button";
import RoleEditPage from "./roleEdit";
import ModalDelete from "@/components/modalDelete";
import { Role } from "@/types/role";
import { createClient } from "@/utils/supabase/client";
import { useScreen } from "@/hooks/useScreen";

export default function RolePage() {
  const notify = useNotification();
  const [data, setData] = useState<Role[]>([]);
  const [detail, setDetail] = useState<Role | null>();
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteData, setDeleteData] = useState<Role | null>();
  const supabase = createClient();
  const { width } = useScreen();

  const fetchData = async (strSearch?: string) => {
    // setLoading(true);

    const { data: dataRole, error } = await supabase.rpc("spu_dr_roles_gets", {
      p_id: 0,
      p_keyword: strSearch?.trim() || null,
    });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      notify.error("Lỗi load dữ liệu");
      // setLoading(false);
      return;
    }

    setData(dataRole || []);
  };

  useEffect(() => {
    setTimeout(() => fetchData(), 0);
  }, []);

  // const handleClear = async () => {
  //   setSearchText("");
  //   setFromDate(null);
  //   setToDate(null);
  //   fetchData();
  // };

  const handleViewDetail = (id: number | null = null) => {
    const item = data.find((x) => x.id === id);
    setDetail(item);
    if (width <= 768) setOpenDetail(true);
  };

  const handleOpenDelete = (data: Role) => {
    setDeleteData(data);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (!deleteData?.id) {
      notify.warning("Vui lòng chọn đối tượng xóa");
      return;
    }

    const { error } = await supabase.rpc("spu_dr_roles_delete", {
      p_id: encodeURIComponent(deleteData?.id),
    });

    if (error) {
      console.error(error);
      notify.error("Xóa thất bại");
      return;
    }

    notify.success(`Xóa ${deleteData?.description} thành công!`);
    setOpenDelete(false);
    setDeleteData(null);
    fetchData();
  };

  return (
    <>
      <div className="grid grid-cols-8 gap-x-3 mt-3 p-3 pt-0 role-container gap-y-3">
        <div
          className={`col-span-2 w-full bg-white p-4 rounded-lg gap-3 shadow-lg shadow-gray-300`}
        >
          <div className="w-full flex items-end justify-between mb-3 border-b border-b-gray-400 pb-3">
            <h3 className="text-xl font-semibold text-blue-800 pr-4">
              Vai trò
            </h3>
            <Button
              className="text-blue-800 p-0! font-semibold rounded-xl"
              onClick={() => handleViewDetail(null)}
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </Button>
          </div>
          <div className="space-y-4">
            {data &&
              data.length > 0 &&
              data.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between font-semibold rounded-lg 
                    ${detail?.id === item.id ? "text-blue-700" : ""}`}
                >
                  <span>{item.description}</span>
                  <div className="flex items-center justify-center space-x-2">
                    <Pencil
                      className="text-yellow-500 w-4 h-4"
                      onClick={() => handleViewDetail(item.id)}
                    />
                    <Trash2
                      className="text-red-500 w-4 h-4"
                      onClick={() => handleOpenDelete(item)}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {width > 768 ? (
          <div
            className={`col-span-6 w-full bg-white p-4 rounded-lg gap-3 shadow-lg shadow-gray-300`}
          >
            <div className="w-full flex flex-col mb-3 border-b border-b-gray-400 pb-3">
              <h3 className="text-xl font-semibold text-blue-800 pr-4">
                Phân quyền
              </h3>
            </div>
            <div className="w-full">
              <RoleEditPage
                data={detail || null}
                fetchDataFn={() => fetchData()}
                onClose={() => setDetail(null)}
              />
            </div>
          </div>
        ) : (
          <div
            className={`col-span-6 transition-all duration-300 ease-in-out overflow-hidden ${
              openDetail ? "opacity-100 max-h-auto mt-3" : "opacity-0 max-h-0"
            }`}
          >
            <RoleEditPage
              data={detail || null}
              fetchDataFn={() => fetchData()}
              onClose={() => {
                setDetail(null);
                setOpenDetail(false);
              }}
            />
          </div>
        )}
      </div>

      <ModalDelete
        openModal={openDelete}
        onClose={() => setOpenDelete(false)}
        data={deleteData}
        type="role"
        onDelete={handleDelete}
      />
    </>
  );
}
