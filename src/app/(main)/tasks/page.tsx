"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDuration, toHHmm } from "@/utils/dateTime";
import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  ClockAlert,
  FileDown,
  Info,
  Pencil,
  Plus,
  List,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Task } from "@/types/task";
import { useNotification } from "@/context/notification";
import { useHeader } from "@/context/header";
import DateTimePicker from "@/components/datetimePicker";
import { Button } from "@/components/button";
import Loading from "@/components/loading";
import DataTable from "@/components/dataTable";
import Modal from "@/components/modal";
import TaskEditPage from "./edit";
import ModalDelete from "@/components/modalDelete";
import convertDataReport from "@/utils/convertDataReport";
import { loadDataWithTTL } from "@/utils/secureStorage";
import { User } from "@/types/user";
import { createClient } from "@/utils/supabase/client";
import Cookies from "js-cookie";
import { useScreen } from "@/hooks/useScreen";
import CustomImage from "@/components/image";
import FixedButton from "@/components/fixedButton";

type Action = "view" | "create" | "edit" | "delete";

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

export default function TaskPage() {
  const { setHeader } = useHeader();
  const [data, setData] = useState<Task[]>([]);
  const notify = useNotification();
  const [searchText, setSearchText] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [detail, setDetail] = useState<Task | null>();
  const [loading, setLoading] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteData, setDeleteData] = useState<Task | null>();

  const [permissions, setPermissions] =
    useState<PermissionState>(initPermissions);
  const { width } = useScreen();

  const supabase = createClient();

  const [loaded, setLoaded] = useState(false); // ⭐ quan trọng

  const dataLogin = loadDataWithTTL("KEY_LOGIN") as User;
  // ✅ fetch permission
  useEffect(() => {
    const cookie = Cookies.get("permissions");
    if (!cookie) return;
    setPermissions(JSON.parse(cookie) || {});
  }, []);

  const canEdit = useMemo(() => {
    if (!loaded) return []; // ⭐ chặn render sớm

    return permissions["work"]?.actions?.includes("edit");
  }, [permissions, loaded]);

  const canDelete = useMemo(() => {
    if (!loaded) return []; // ⭐ chặn render sớm

    return permissions["work"]?.actions?.includes("delete");
  }, [permissions, loaded]);

  const columns = [
    {
      accessor: "id",
      label: "STT",
      width: "5%",
      className: "text-center",
      render: (
        row: Task,
        idx: number,
        currentPage: number,
        rowsPerPage: number,
      ) => (currentPage! - 1) * rowsPerPage! + (idx ?? 0) + 1,
    },
    // {
    //   accessor: "FullName",
    //   label: "Tên nhân viên",
    //   width: "12%",
    //   className: "text-left",
    // },
    {
      accessor: "workat",
      label: "Khoa yêu cầu",
      width: "15%",
      className: "text-left",
    },
    {
      accessor: "content",
      label: "Nội dung công việc",
      width: "15%",
      className: "text-left",
    },
    {
      accessor: "starttime",
      label: "Thời gian bắt đầu",
      width: "8%",
      className: "text-center",
      render: (row: Task) => (
        <span>{!row.starttime ? "" : row.starttime.slice(0, 5)}</span>
      ),
    },
    {
      accessor: "endtime",
      label: "Thời gian kết thúc",
      width: "8%",
      className: "text-center",
      render: (row: Task) => (
        <span>{!row.endtime ? "" : row.endtime.slice(0, 5)}</span>
      ),
    },
    {
      accessor: "workduration",
      label: "Tổng thời gian thực hiện",
      width: "10%",
      className: "text-center",
      render: (row: Task) => {
        return (
          <span>
            {!row.workduration
              ? "Chưa thực hiện"
              : formatDuration(row.workduration ?? 0)}
          </span>
        );
      },
    },
    {
      accessor: "handlingdirection",
      label: "Hướng xử lý",
      width: "9%",
      className: "text-left",
    },
    {
      accessor: "status",
      label: "Kết quả thực hiện",
      width: "10%",
      className: "text-center",
      render: (row: Task) => {
        if (row.status === "completed")
          return (
            <span className="p-2 bg-green-500 rounded-md text-xs text-white">
              Hoàn thành
            </span>
          );
        else if (row.status === "incomplete")
          return (
            <span className="p-2 bg-yellow-400 rounded-md text-xs text-white">
              Đang xử lý
            </span>
          );
        return <span>{row.status}</span>;
      },
    },
    {
      accessor: "actions",
      label: "Hành động",
      width: "10%",
      className: "text-center",
      render: (row: Task) => {
        const isMe = dataLogin && dataLogin?.id === row.userid;
        return (
          <div className="flex items-center justify-center space-x-2">
            {(isMe || canEdit) && (
              <Pencil
                className="text-yellow-500 w-5 h-5"
                onClick={() => handleViewDetail(row.id)}
              />
            )}
            {(isMe || canDelete) && (
              <Trash2
                className="text-red-500 w-5 h-5"
                onClick={() => handleOpenDelete(row)}
              />
            )}
          </div>
        );
      },
    },
  ];

  // Set header
  useEffect(() => {
    setHeader({ title: "Công việc" });
  }, []);

  const fetchData = async (
    strSearch?: string,
    from?: Date | null,
    to?: Date | null,
  ) => {
    setLoading(true);

    const { data: dataReport, error } = await supabase.rpc(
      "spu_dr_reports_gets",
      {
        p_id: null,
        p_userid: null,
        p_keyword: strSearch?.trim() || null,
        p_fromdate: from ? format(from, "yyyy-MM-dd") : null,
        p_todate: to ? format(to, "yyyy-MM-dd") : null,
        // p_status: null,
        p_pageindex: 0,
        p_pagesize: 0,
      },
    );

    if (error) {
      console.error("SUPABASE ERROR:", error);
      notify.error("Lỗi load dữ liệu");
      setLoading(false);
      return;
    }

    let dt = dataReport || [];

    // giữ logic filter theo role
    if (dataLogin && dataLogin?.role === "user") {
      dt = dt.filter((x: Task) => x.userid === dataLogin?.id);
    }

    setData(dt);
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => fetchData("", fromDate, toDate), 0);
  }, [fromDate, toDate]);

  // Handle search
  const handleSearch = () => {
    if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
      return notify.warning("Từ ngày không được lớn hơn Đến ngày!");
    }

    fetchData(searchText, fromDate, toDate);
  };

  const handleClear = async () => {
    setSearchText("");
    setFromDate(new Date());
    setToDate(new Date());
    fetchData();
  };

  const handleViewDetail = (id: string | null = null) => {
    const item = data.find((x) => x.id === id);
    setDetail(item);
    setOpenDetail(true);
  };

  const handleOpenDelete = (data: Task | undefined) => {
    if (!data) return;
    setDeleteData(data);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (!deleteData?.id) {
      notify.warning("Vui lòng chọn đối tượng xóa");
      return;
    }

    const { error } = await supabase.rpc("spu_dr_reports_delete", {
      p_id: encodeURIComponent(deleteData?.id),
      p_userid: null,
    });

    if (error) {
      console.error(error);
      notify.error("Xóa thất bại");
      return;
    }

    notify.success(
      `Xóa ${deleteData?.content} (${deleteData?.fullname}) thành công!`,
    );
    setOpenDelete(false);
    setDeleteData(null);
    fetchData(searchText, fromDate, toDate);
  };

  const exportFile = async () => {
    const dataExport = convertDataReport(
      data,
      format(fromDate ?? "", "dd/MM/yyyy"),
      format(toDate ?? "", "dd/MM/yyyy"),
    );
    const res = await fetch("/api/export-word", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataExport),
    });
    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "bao-cao-cong-viec.docx";

    document.body.appendChild(a);
    a.click();

    a.remove();
  };

  const dataExport = convertDataReport(
    data,
    format(fromDate ?? "", "dd/MM/yyyy"),
    format(toDate ?? "", "dd/MM/yyyy"),
  );

  return (
    <>
      <div>
        <div className={`grid grid-cols-7 gap-3 text-black filter-container`}>
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
            <Button
              className={`text-green-600 font-semibold p-3 rounded-xl border border-green-600 ${width > 1024 || (width <= 768 && width >= 568) ? "min-w-30" : ""}`}
              onClick={exportFile}
            >
              {width > 1024 || (width <= 768 && width >= 568) ? (
                <span>Xuất file</span>
              ) : (
                <FileDown width={19} height={19} />
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-blue-800 text-2xl font-semibold">
              Danh sách công việc
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
              rowGroup={true}
              nameRowGroup="fullname"
            />
          ) : dataExport && dataExport.employees.length > 0 ? (
            dataExport.employees.map((item, idx) => (
              <div
                key={idx}
                className="bg-blue-100/50 space-y-3 border border-gray-300 rounded-lg p-4 mt-3 shadow-md shadow-gray-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex space-x-2">
                    <CustomImage
                      src={item.avatar}
                      width={44}
                      height={44}
                      alt=""
                      className="rounded-lg"
                    />
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                  </div>
                </div>
                {item.tasks &&
                  item.tasks.length > 0 &&
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  item.tasks.map((task: any, index: number) => {
                    const isMe = dataLogin && dataLogin?.id === task.userid;
                    const dt = data.find((x) => x.id === task.id);
                    return (
                      <div
                        key={index}
                        className={`bg-white grid grid-cols-4 space-y-3 border border-gray-300 rounded-lg p-4 mt-3 shadow-lg 
                        shadow-gray-300 border-l-4 
                        ${task.result === "Hoàn thành" ? "border-l-green-500" : task.result === "Chưa hoàn thành" ? "border-l-yellow-500" : "border-l-blue-700"}`}
                      >
                        <div className="col-span-4 flex items-center justify-between">
                          <h3 className="px-2 py-1 bg-blue-100 rounded-lg uppercase text-blue-700 font-semibold text-xs">
                            {task.department}
                          </h3>
                          <div className="font-semibold text-xs">
                            {task.result === "Hoàn thành" ? (
                              <div className="w-full flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-lg">
                                <CheckCircle
                                  width={16}
                                  height={16}
                                  className="text-green-500"
                                />
                                <span className="font-semibold text-green-500">
                                  Hoàn thành
                                </span>
                              </div>
                            ) : task.result === "Chưa hoàn thành" ? (
                              <div className="w-full flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-lg">
                                <ClockAlert
                                  width={16}
                                  height={16}
                                  className="text-yellow-500"
                                />
                                <span className="font-semibold text-yellow-500">
                                  Đang xử lý
                                </span>
                              </div>
                            ) : (
                              <div className="w-full flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-lg">
                                <Info
                                  width={16}
                                  height={16}
                                  className="text-blue-500"
                                />
                                <span className="font-semibold text-blue-700">
                                  {task.result}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-span-4 mb-4">
                          <h3 className="font-semibold text-lg">
                            {task.content}
                          </h3>
                          <div className="flex items-center space-x-1 text-gray-400 text-xs mb-2">
                            <Clock width={15} height={15} />
                            <span>{task.date}</span>
                          </div>
                          <p className="text-gray-500">{task.solution}</p>
                        </div>

                        <div className="col-span-1">
                          <h3 className="text-[11px] font-semibold uppercase text-gray-400">
                            Bắt đầu
                          </h3>
                          <p className="font-semibold">
                            {task.start?.slice(0, 5)}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <h3 className="text-[11px] font-semibold uppercase text-gray-400">
                            Kết thúc
                          </h3>
                          <p className="font-semibold">
                            {task.end?.slice(0, 5)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <h3 className="text-[11px] font-semibold uppercase text-gray-400">
                            Tổng thời gian
                          </h3>
                          <p className="font-semibold">
                            {!task.duration
                              ? "Chưa thực hiện"
                              : (task.duration ?? 0)}
                          </p>
                        </div>
                        <div className="col-span-4 border-t border-t-gray-300 pt-3 mt-4">
                          <div className="flex items-center justify-end space-x-3">
                            {(isMe || canEdit) && (
                              <Pencil
                                className="text-yellow-500 w-5 h-5"
                                onClick={() => handleViewDetail(task.id)}
                              />
                            )}
                            {(isMe || canDelete) && (
                              <Trash2
                                className="text-red-500 w-5 h-5"
                                onClick={() => handleOpenDelete(dt)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
          position="right"
          className={`p-4 pt-0 max-w-200 w-full bg-white min-w-[${width}px]!`}
          width={width >= 800 ? "800px" : `${width}px`}
        >
          <div>
            <div className="pb-3 mb-3 flex items-start justify-between shrink-0 border-b border-b-gray-300">
              <span className="text-xl font-semibold text-blue-800 pr-4">
                {detail ? "Chỉnh sửa công việc" : "Thêm mới công việc"}
              </span>
              <Button onClick={() => setOpenDetail(false)}>
                <X className="text-red-400" />
              </Button>
            </div>
            <TaskEditPage
              data={detail || null}
              onClose={() => setOpenDetail(false)}
              fetchDataFn={() => fetchData(searchText, fromDate, toDate)}
              UserID={dataLogin && dataLogin?.id ? dataLogin?.id : null}
            />
          </div>
        </Modal>
      </div>
      <ModalDelete
        openModal={openDelete}
        onClose={() => setOpenDelete(false)}
        data={deleteData}
        type="report"
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
