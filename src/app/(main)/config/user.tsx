"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  CircleX,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useNotification } from "@/context/notification";
import DateTimePicker from "@/components/datetimePicker";
import { Button } from "@/components/button";
import Loading from "@/components/loading";
import DataTable from "@/components/dataTable";
import Modal from "@/components/modal";
import UserEditPage from "./userEdit";
import { User } from "@/types/user";
import CustomImage from "@/components/image";
import ModalDelete from "@/components/modalDelete";
import { createClient } from "@/utils/supabase/client";
import { loadDataWithTTL } from "@/utils/secureStorage";
import { useScreen } from "@/hooks/useScreen";
import FixedButton from "@/components/fixedButton";

export default function UserPage() {
  const [data, setData] = useState<User[]>([]);
  const notify = useNotification();
  const [searchText, setSearchText] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [detail, setDetail] = useState<User | null>();
  const [loading, setLoading] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteData, setDeleteData] = useState<User | null>();
  const supabase = createClient();
  const { width } = useScreen();

  const columns = [
    {
      accessor: "id",
      label: "STT",
      width: "5%",
      className: "text-center",
      render: (
        row: User,
        idx: number,
        currentPage: number,
        rowsPerPage: number,
      ) => (currentPage! - 1) * rowsPerPage! + (idx ?? 0) + 1,
    },
    {
      accessor: "fullname",
      label: "Người dùng",
      width: "20%",
      className: "text-left",
      render: (row: User) => (
        <div className="flex space-x-3">
          <CustomImage
            src={row.avatar || "/avatars/face-0.jpg"}
            width={40}
            height={40}
            alt={row.fullname}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold">{row.fullname}</h3>
            <p className="text-gray-400">{row.username}</p>
          </div>
        </div>
      ),
    },
    {
      accessor: "email",
      label: "Email",
      width: "25%",
      className: "text-left",
    },
    {
      accessor: "role_description",
      label: "Vai trò",
      width: "15%",
      className: "text-center",
    },
    {
      accessor: "createdat",
      label: "Ngày tạo",
      width: "10%",
      className: "text-center",
      render: (row: User) => (
        <span>{format(row.createdat ?? "", "dd/MM/yyyy") || ""}</span>
      ),
    },
    {
      accessor: "isactive",
      label: "Trạng thái",
      width: "10%",
      className: "text-center",
      render: (row: User) => {
        if (row.isactive === true)
          return (
            <span className="px-2 py-1 bg-green-500 rounded-md text-xs text-white">
              Sử dụng
            </span>
          );
        return (
          <span className="px-2 py-1 bg-red-400 rounded-md text-xs text-white">
            Vô hiệu
          </span>
        );
      },
    },
    {
      accessor: "actions",
      label: "Hành động",
      width: "10%",
      className: "text-center",
      render: (row: User) => (
        <div className="flex items-center justify-center space-x-2">
          <Pencil
            className="text-yellow-500 w-5 h-5"
            onClick={() => handleViewDetail(row.id)}
          />
          <Trash2
            className="text-red-500 w-5 h-5"
            onClick={() => handleOpenDelete(row)}
          />
        </div>
      ),
    },
  ];

  const dataLogin = loadDataWithTTL("KEY_LOGIN") as User;

  const fetchData = async (
    strSearch?: string,
    from?: Date | null,
    to?: Date | null,
  ) => {
    setLoading(true);

    const { data: dataUser, error } = await supabase.rpc("spu_dr_users_gets", {
      p_id: null,
      p_keyword: strSearch?.trim() || null,
      p_role: null,
      p_isactive: null,
      p_fromdate: from ? format(from, "yyyy-MM-dd") : null,
      p_todate: to ? format(to, "yyyy-MM-dd") : null,
      p_pageindex: 1,
      p_pagesize: 0,
    });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      notify.error("Lỗi load dữ liệu");
      setLoading(false);
      return;
    }

    setData(dataUser || []);
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => fetchData(), 0);
  }, []);

  // Handle search
  const handleSearch = () => {
    if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
      return notify.warning("Từ ngày không được lớn hơn Đến ngày!");
    }

    fetchData(
      searchText,
      fromDate ? new Date(format(fromDate, "yyyy-MM-dd")) : null,
      toDate ? new Date(format(toDate, "yyyy-MM-dd")) : null,
    );
  };

  const handleClear = async () => {
    setSearchText("");
    setFromDate(null);
    setToDate(null);
    fetchData();
  };

  const handleViewDetail = (id: string | null = null) => {
    const item = data.find((x) => x.id === id);
    setDetail(item);
    setOpenDetail(true);
  };

  const handleOpenDelete = (data: User) => {
    setDeleteData(data);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (!deleteData?.id) {
      notify.warning("Vui lòng chọn đối tượng xóa");
      return;
    }

    const { error } = await supabase.rpc("spu_dr_users_delete", {
      p_id: encodeURIComponent(deleteData?.id),
    });

    if (error) {
      console.error(error);
      notify.error("Xóa thất bại");
      return;
    }

    notify.success(`Xóa ${deleteData?.fullname} thành công!`);
    setOpenDelete(false);
    setDeleteData(null);
    fetchData(searchText, fromDate, toDate);
  };

  return (
    <>
      <div className="mt-1">
        <div className="grid grid-cols-7 gap-3 text-black filter-container">
          <div className="col-span-2">
            <p className="form-label">Tìm kiếm</p>
            <input
              className="form-input"
              value={searchText}
              placeholder="Nhập từ khóa tìm kiếm"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <p className="form-label">Từ ngày</p>
            <DateTimePicker
              selectedDate={fromDate}
              setSelectedDate={setFromDate}
            />
          </div>
          <div className="col-span-1">
            <p className="form-label">Đến ngày</p>
            <DateTimePicker selectedDate={toDate} setSelectedDate={setToDate} />
          </div>
          <div className="col-span-3 flex items-end space-x-3 justify-end group-btn">
            <Button
              className={`text-white bg-blue-700 font-semibold p-3 rounded-xl ${width > 1024 || (width <= 768 && width >= 568) ? "min-w-30" : ""}`}
              onClick={handleSearch}
            >
              {width > 1024 || (width <= 768 && width >= 568) ? (
                <span>Tìm kiếm</span>
              ) : (
                <Search width={19} height={19} />
              )}
            </Button>
            <Button
              className={`text-blue-700 font-semibold p-3 rounded-xl border border-blue-700 ${width > 1024 || (width <= 768 && width >= 568) ? "min-w-30" : ""}`}
              onClick={handleClear}
            >
              {width > 1024 || (width <= 768 && width >= 568) ? (
                <span>Tất cả</span>
              ) : (
                <List width={19} height={19} />
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-blue-800 text-2xl font-semibold">
              Danh sách người dùng
            </h3>
            {width >= 568 && (
              <Button
                className="text-white bg-green-500 font-semibold p-3 rounded-xl min-w-30"
                onClick={() => handleViewDetail(null)}
              >
                Thêm mới
              </Button>
            )}
          </div>

          {loading ? (
            <Loading />
          ) : width > 768 ? (
            <DataTable
              data={data}
              columns={columns}
              rowsPerPage={10}
              hasSearch={false}
            />
          ) : data && data.length > 0 ? (
            data.map((item, idx) => (
              <div
                key={idx}
                className={`bg-white grid grid-cols-4 space-y-3 border border-gray-300 rounded-lg p-4 mt-3 shadow-lg 
                        shadow-gray-300 info-user border-l-4 
                        ${item.role === "admin" ? "border-l-red-500" : item.role === "editor" ? "border-l-orange-500" : "border-l-blue-800"}`}
              >
                <div className="col-span-4 name-user flex space-y-3 items-start justify-between">
                  <div className="flex space-x-2">
                    <CustomImage
                      src={item.avatar || "/images/default-avatar.png"}
                      width={44}
                      height={44}
                      alt=""
                      className="rounded-lg"
                    />
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-lg">{item.fullname}</h3>
                      <p className="text-gray-400">{item.username}</p>
                    </div>
                  </div>
                  <div className="font-semibold">
                    <div
                      className={`w-full px-2 py-1 rounded-lg ${item.role === "admin" ? "bg-red-100" : item.role === "editor" ? "bg-orange-100" : "bg-blue-100"}`}
                    >
                      <span
                        className={`font-semibold ${item.role === "admin" ? "text-red-500" : item.role === "editor" ? "text-orange-500" : "text-blue-800"}`}
                      >
                        {item.role_description}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <h3 className="text-[11px] font-semibold uppercase text-gray-400">
                    Email
                  </h3>
                  <p className="font-semibold">{item.email}</p>
                </div>
                <div className="col-span-1">
                  <h3 className="text-[11px] font-semibold uppercase text-gray-400">
                    Ngày tạo
                  </h3>
                  <p className="font-semibold">
                    {format(item.createdat, "dd/MM/yyyy")}
                  </p>
                </div>
                <div className="col-span-1">
                  <h3 className="text-[11px] font-semibold uppercase text-gray-400">
                    Trạng thái
                  </h3>
                  <p className="font-semibold">
                    {item.isactive ? (
                      <div className="w-full flex items-center space-x-1">
                        <CheckCircle
                          width={16}
                          height={16}
                          className="text-green-500"
                        />
                        <span className="font-semibold text-green-500">
                          Hoạt động
                        </span>
                      </div>
                    ) : (
                      <div className="w-full flex items-center space-x-1">
                        <CircleX
                          width={16}
                          height={16}
                          className="text-red-500"
                        />
                        <span className="font-semibold text-red-500">
                          Vô hiệu
                        </span>
                      </div>
                    )}
                  </p>
                </div>
                <div className="col-span-4 border-t border-t-gray-300 pt-3 flex items-center justify-end space-x-2">
                  <Pencil
                    className="text-yellow-500 w-5 h-5"
                    onClick={() => handleViewDetail(item.id)}
                  />
                  <Trash2
                    className="text-red-500 w-5 h-5"
                    onClick={() => handleOpenDelete(item)}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center my-3">
              <CustomImage
                src="/images/noData.jpg"
                width={130}
                height={130}
                alt=""
              />
              <p className="text-gray-400">Không có dữ liệu</p>
            </div>
          )}
        </div>

        <Modal
          openModal={openDetail}
          onClose={() => setOpenDetail(false)}
          data={[]}
          position="center"
          className={`w-full flex items-center justify-center mx-0! mb-5 min-w-[${width}px]!`}
          width={width >= 600 ? "600px" : `${width}px`}
        >
          <div className="w-full flex-col mt-5 space-y-3 px-5">
            <div className="pb-3 mb-3 flex items-start justify-between shrink-0 border-b border-b-gray-300">
              <span className="text-xl font-semibold text-blue-800 pr-4">
                {detail ? "Chỉnh sửa người dùng" : "Thêm mới người dùng"}
              </span>
              <Button onClick={() => setOpenDetail(false)}>
                <X className="text-red-400" />
              </Button>
            </div>
            <UserEditPage
              data={detail || null}
              onClose={() => setOpenDetail(false)}
              fetchDataFn={() => fetchData(searchText, fromDate, toDate)}
              UserID={dataLogin && dataLogin.id ? dataLogin.id : null}
            />
          </div>
        </Modal>
      </div>
      <ModalDelete
        openModal={openDelete}
        onClose={() => setOpenDelete(false)}
        data={deleteData}
        type="user"
        onDelete={handleDelete}
      />
      <FixedButton
        visible={width < 568}
        icon={<Plus width={24} height={24} />}
        className="bottom-10!"
        handleChange={() => handleViewDetail(null)}
      />
    </>
  );
}
