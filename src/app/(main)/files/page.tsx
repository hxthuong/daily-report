"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Clock,
  Download,
  FileIcon,
  FolderArchive,
  ImageIcon,
  List,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { File } from "@/types/file";
import { useNotification } from "@/context/notification";
import { useHeader } from "@/context/header";
import DateTimePicker from "@/components/datetimePicker";
import { Button } from "@/components/button";
import Loading from "@/components/loading";
import DataTable from "@/components/dataTable";
import Modal from "@/components/modal";
import ModalDelete from "@/components/modalDelete";
import FileEditPage from "./edit";
import Link from "next/link";
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

export default function FilePage() {
  const { setHeader } = useHeader();
  const [data, setData] = useState<File[]>([]);
  const notify = useNotification();
  const [searchText, setSearchText] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [detail, setDetail] = useState<File | null>();
  const [loading, setLoading] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteData, setDeleteData] = useState<File | null>();

  const [permissions, setPermissions] =
    useState<PermissionState>(initPermissions);

  const [loaded, setLoaded] = useState(false); // ⭐ quan trọng
  const supabase = createClient();
  const { width } = useScreen();

  useEffect(() => {
    const cookie = Cookies.get("permissions");
    if (!cookie) return;
    setPermissions(JSON.parse(cookie) || {});
  }, []);

  const canDelete = useMemo(() => {
    if (!loaded) return []; // ⭐ chặn render sớm

    return permissions["file"]?.actions?.includes("delete");
  }, [permissions, loaded]);

  const columns = [
    {
      accessor: "id",
      label: "STT",
      width: "5%",
      className: "text-center",
      render: (
        row: File,
        idx: number,
        currentPage: number,
        rowsPerPage: number,
      ) => (currentPage! - 1) * rowsPerPage! + (idx ?? 0) + 1,
    },
    {
      accessor: "description",
      label: "Mô tả",
      width: "50%",
      className: "text-left",
    },
    {
      accessor: "filename",
      label: "Tên file",
      width: "25%",
      className: "text-left",
    },
    {
      accessor: "createdat",
      label: "Ngày tải lên",
      width: "10%",
      className: "text-center",
      render: (row: File) => (
        <span>{format(row.createdat ?? "", "dd/MM/yyyy") || ""}</span>
      ),
    },
    {
      accessor: "actions",
      label: "Hành động",
      width: "10%",
      className: "text-center",
      render: (row: File) => (
        <div className="flex items-center justify-center space-x-2">
          <Link href={row.filepath} target="_blank">
            <Download className="text-blue-500 w-5 h-5" />
          </Link>
          {canDelete && (
            <Trash2
              className="text-red-500 w-5 h-5"
              onClick={() => handleOpenDelete(row)}
            />
          )}
        </div>
      ),
    },
  ];

  // Set header
  useEffect(() => {
    setHeader({ title: "File" });
  }, []);

  const fetchData = async (
    strSearch?: string,
    from?: Date | null,
    to?: Date | null,
  ) => {
    setLoading(true);

    const { data: dataFile, error } = await supabase.rpc("spu_dr_files_gets", {
      p_id: null,
      p_keyword: strSearch?.trim() || null,
      p_fromdate: from ? format(from, "yyyy-MM-dd") : null,
      p_todate: to ? format(to, "yyyy-MM-dd") : null,
    });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      notify.error("Lỗi load dữ liệu");
      setLoading(false);
      return;
    }

    setData(dataFile || []);
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

    fetchData(searchText, fromDate, toDate);
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

  const handleOpenDelete = (data: File) => {
    setDeleteData(data);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (!deleteData?.id) {
      notify.warning("Vui lòng chọn đối tượng xóa");
      return;
    }

    const { error } = await supabase.rpc("spu_dr_files_delete", {
      p_id: encodeURIComponent(deleteData?.id),
    });

    if (error) {
      console.error(error);
      notify.error("Xóa thất bại");
      return;
    }

    notify.success(`Xóa ${deleteData?.filename} thành công!`);
    setOpenDelete(false);
    setDeleteData(null);
    fetchData(searchText, fromDate, toDate);
  };

  return (
    <>
      <div>
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
              Danh sách file
            </h3>
            {width >= 568 && (
              <Button
                className="text-white bg-green-500 font-semibold p-3 rounded-xl min-w-30"
                onClick={() => handleViewDetail(null)}
              >
                Tải file lên
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
            data.map((item, idx) => {
              const type = item.filename?.split(".").pop();
              const isImage = item.filetype?.includes("image/");
              const isFolder = type === "zip" || type === "rar";

              return (
                <div
                  key={idx}
                  className={`bg-white grid grid-cols-4 space-y-3 border border-gray-300 rounded-lg p-4 mt-3 shadow-lg 
                        shadow-gray-300 border-l-4 
                        ${isFolder ? "border-l-green-500" : isImage ? "border-l-red-500" : "border-l-blue-700"}`}
                >
                  <div className="col-span-4 flex items-center justify-between">
                    <div
                      className={`flex items-center space-x-1 text-xs p-2 rounded-lg
                        ${isFolder ? "bg-green-100 text-green-500" : isImage ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-800"}`}
                    >
                      {isFolder ? (
                        <FolderArchive width={26} height={26} />
                      ) : isImage ? (
                        <ImageIcon width={26} height={26} />
                      ) : (
                        <FileIcon width={26} height={26} />
                      )}
                    </div>

                    <div
                      className={`flex items-center space-x-1 p-2 rounded-lg uppercase font-semibold
                       ${isFolder ? "bg-green-100 text-green-500" : isImage ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-800"}`}
                    >
                      <span>{type}</span>
                    </div>
                  </div>
                  <div className="col-span-4 mb-4">
                    <h3 className="font-semibold text-lg">{item.filename}</h3>
                    <p className="">{item.description}</p>
                  </div>
                  <div className="col-span-4 border-t border-t-gray-300 pt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <span>{format(item.createdat ?? "", "dd/MM/yyyy")}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={item.filepath} target="_blank">
                        <Download className="text-blue-500 w-5 h-5" />
                      </Link>
                      {canDelete && (
                        <Trash2
                          className="text-red-500 w-5 h-5"
                          onClick={() => handleOpenDelete(item)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
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
          width={width >= 500 ? "500px" : `${width}px`}
        >
          <div className="w-full flex-col mt-5 space-y-3 px-5">
            <div className="pb-3 mb-3 flex items-start justify-between shrink-0 border-b border-b-gray-300">
              <span className="text-xl font-semibold text-blue-800 pr-4">
                Tải tệp lên
              </span>
              <Button onClick={() => setOpenDetail(false)}>
                <X className="text-red-400" />
              </Button>
            </div>
            <FileEditPage
              data={detail || null}
              onClose={() => setOpenDetail(false)}
              fetchDataFn={() => fetchData(searchText, fromDate, toDate)}
            />
          </div>
        </Modal>
      </div>
      <ModalDelete
        openModal={openDelete}
        onClose={() => setOpenDelete(false)}
        data={deleteData}
        type="file"
        onDelete={handleDelete}
      />
      <FixedButton
        visible={width < 568}
        icon={<Upload width={24} height={24} />}
        className="bottom-10!"
        handleChange={() => handleViewDetail(null)}
      />
    </>
  );
}
