"use client";

import DataTable from "@/components/dataTable";
import DateTimePicker from "@/components/datetimePicker";
import CustomImage from "@/components/image";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import SearchInput from "@/components/searchinput";
import { useHeader } from "@/context/header";
import { Option } from "@/types/dropdown";
import { Task } from "@/types/task";
import { User } from "@/types/user";
import { formatDuration, toHHmm } from "@/utils/dateTime";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  CircleCheckBig,
  Clock,
  ClockAlert,
  Dot,
  FileText,
  Filter,
  Info,
  Plus,
  PlusCircle,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import TaskEditPage from "./tasks/edit";
import { Button } from "@/components/button";
import { loadDataWithTTL } from "@/utils/secureStorage";
import { useNotification } from "@/context/notification";
import { createClient } from "@/utils/supabase/client";
import { useScreen } from "@/hooks/useScreen";
import FixedButton from "@/components/fixedButton";

export default function Home() {
  const notify = useNotification();
  const { setHeader } = useHeader();
  const [data, setData] = useState<Task[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dataDashboard, setDataDashboard] = useState<any[]>([]);
  // const notify = useNotification();
  const [searchText, setSearchText] = useState<string>("");
  const [status, setStatus] = useState<"all" | "completed" | "incomplete">(
    "all",
  );
  const [searchDate, setSearchDate] = useState<Date | null>(new Date());
  const [employees, setEmployees] = useState<Option[]>([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [mounted, setMounted] = useState(false);
  const { width } = useScreen();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setHeader({
      title: "Dashboard",
    });
  }, []);

  const columns = [
    {
      accessor: "workdate",
      label: "Ngày",
      width: "8%",
      className: "text-center",
      render: (row: Task) => <span>{format(row.workdate, "dd/MM/yyyy")}</span>,
    },
    {
      accessor: "fullname",
      label: "Tên nhân viên",
      width: "12%",
      className: "text-left",
    },
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
      accessor: "status",
      label: "Kết quả thực hiện",
      width: "10%",
      className: "text-center",
      render: (row: Task) => {
        if (row.status === "completed")
          return (
            <span className={`p-2 bg-green-500 rounded-md text-white text-xs`}>
              Hoàn thành
            </span>
          );
        else if (row.status === "incomplete")
          return (
            <span className={`p-2 bg-yellow-400 rounded-md text-white text-xs`}>
              Đang xử lý
            </span>
          );
        return <span>{row.status}</span>;
      },
    },
  ];

  const columnsDashboard = [
    {
      accessor: "name",
      label: "",
      width: "60%",
      className: "text-left font-semibold",
    },
    {
      accessor: "today",
      label: "Trong ngày",
      width: "20%",
      className: "text-center",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (row: any) => {
        return (
          <div className="relative group inline-block">
            <span
              className={
                row.list && row.list.length > 0
                  ? "cursor-pointer text-blue-700"
                  : ""
              }
            >
              {row.today}
            </span>
            {row.list && row.list.length > 0 && (
              <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 bottom-full mb-1 z-10 min-w-30">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {row.list.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-center space-x-0.5">
                    <Dot width={16} height={16} className="min-w-4 min-h-4" />
                    <span>{item}</span>
                  </li>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessor: "total",
      label: "Tổng cộng",
      width: "20%",
      className: "text-center font-semibold",
    },
  ];

  const fetchEmployees = async () => {
    setLoading(true);

    const { data: dataUser, error } = await supabase.rpc("spu_dr_users_gets", {
      p_pageindex: 0,
      p_pagesize: 0,
    });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      notify.error("Lỗi load dữ liệu");
      setLoading(false);
      return;
    }

    const list = dataUser
      ? dataUser.map((item: User) => {
          return { id: item.id, label: item.fullname };
        })
      : [];

    setEmployees(list);
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => fetchEmployees(), 0);
  }, []);

  const fetchData = async (
    status: "all" | "completed" | "incomplete" = "all",
  ) => {
    const { data: dataReport, error } = await supabase.rpc(
      "spu_dr_reports_gets",
      {
        p_id: null,
        p_userid: null,
        p_keyword: searchText?.trim() || "",
        p_status: status === "all" ? null : status,
        p_fromdate: searchDate ? format(searchDate, "yyyy-MM-dd") : null,
        p_todate: searchDate ? format(searchDate, "yyyy-MM-dd") : null,
        p_pageindex: 0,
        p_pagesize: 0,
      },
    );

    // if (error) {
    //   console.error("SUPABASE ERROR:", error);
    //   notify.error("Lỗi load dữ liệu");
    //   setLoading(false);
    //   return;
    // }

    return dataReport || [];
  };

  useEffect(() => {
    (async () => {
      const dt = await fetchData(status);
      setData(dt);
    })();
  }, [searchText, status, searchDate]);

  useEffect(() => {
    (async () => {
      const dt = await fetchData();
      const reported = [...new Set(dt.map((x: Task) => x.fullname))];
      const completed =
        dt.filter((x: Task) => x.status === "completed").length || 0;
      const notReported = [
        ...new Set(
          employees
            .map((x) => x.label)
            .filter((item) => !new Set(reported).has(item)),
        ),
      ];
      const report = [
        {
          name: "Đã báo cáo",
          today: reported.length || 0,
          total: employees.length,
          list: reported,
        },
        {
          name: "Chưa báo cáo",
          today: employees.length - (reported.length || 0) || 0,
          total: employees.length,
          list: notReported,
        },
        { name: "Đã hoàn thành", today: completed, total: dt.length },
        {
          name: "Chưa hoàn thành",
          today: dt.length - completed || 0,
          total: dt.length,
        },
      ];

      setDataDashboard(report);
    })();
  }, [searchDate]);

  const handleChange = async (
    value: "all" | "completed" | "incomplete" = "all",
  ) => {
    setStatus(value);
    const dt = await fetchData(value);
    setData(dt);
  };

  const completed = data.filter((x) => x.status === "completed").length || 0;
  const incomplete = data.filter((x) => x.status === "incomplete").length || 0;
  const dataLogin = mounted ? (loadDataWithTTL("KEY_LOGIN") as User) : null;
  const displayName =
    dataLogin?.fullname?.split(" ")[
      dataLogin?.fullname?.split(" ").length - 1
    ] || "";

  const statusFilter = [
    {
      name: "Tất cả",
      value: "all",
      className: "border-blue-600 text-blue-600",
      icon: <Filter width={20} height={20} />,
    },
    {
      name: "Hoàn thành",
      value: "completed",
      className: "border-green-600 text-success",
      icon: <CheckCircle width={20} height={20} />,
    },
    {
      name: "Chưa hoàn thành",
      value: "incomplete",
      className: "border-yellow-400 text-warning",
      icon: <ClockAlert width={20} height={20} />,
    },
  ];

  return (
    <>
      <div
        className={`bg-white p-4 rounded-lg gap-3 shadow-lg shadow-gray-300 flex space-x-2 items-center container-dashboard`}
        style={{
          backgroundImage: "url('/images/bg2.jpg')",
        }}
      >
        <div className="font-semibold" style={{ fontFamily: "RobotoSlab" }}>
          <div className="flex items-center space-x-4 min-w-70 greeting-container">
            <h3 className="font-semibold text-2xl">Chào mừng {displayName}!</h3>
            <CustomImage
              src="/images/weather.png"
              width={28}
              height={28}
              alt=""
            />
          </div>
          <h3 className="text-[15px] mt-2">
            Hôm nay: {format(new Date(), "dd/MM/yyyy")}
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3 badge-container">
          <div className="col-span-1 badge badge-purple">
            <FileText className="badge-icon" />
            <div className="badge-content">
              <h3>Công việc</h3>
              <span className="badge-number">
                {data.length.toLocaleString("de-DE") || 0}
              </span>
            </div>
          </div>
          <div className="col-span-1 badge badge-success">
            <CircleCheckBig className="badge-icon" />
            <div className="badge-content">
              <h3>Hoàn thành</h3>
              <span className="badge-number">
                {completed.toLocaleString("de-DE") || 0}
              </span>
            </div>
          </div>
          <div className="col-span-1 badge badge-warning">
            <ClockAlert className="badge-icon" />
            <div className="badge-content">
              <h3>Chưa hoàn thành</h3>
              <span className="badge-number">
                {incomplete.toLocaleString("de-DE") || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="bg-white p-4 rounded-lg mt-4">
        {/* SEARCH + DATE */}
        {width < 940 && (
          <div className="grid grid-cols-3 space-x-3 mb-3 filter-container">
            <div className="col-span-2">
              <SearchInput
                className="main-search"
                searchValue={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="col-span-1">
              <DateTimePicker
                selectedDate={searchDate}
                setSelectedDate={setSearchDate}
              />
            </div>
          </div>
        )}
        <div className="flex justify-between border-b border-b-gray-300">
          <div className="flex items-stretch gap-4 overflow-hidden w-full">
            {/* STATUS SCROLL */}
            <div className="flex gap-3 overflow-x-auto min-w-0 w-full">
              {statusFilter.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleChange(item.value as any)}
                  className={`flex items-center gap-2 py-2 cursor-pointer shrink-0 whitespace-nowrap
                    ${
                      status === item.value
                        ? `border-b-3 ${item.className}`
                        : "text-gray-500"
                    }`}
                >
                  {item.icon}
                  <span className="font-semibold">{item.name}</span>
                </div>
              ))}
            </div>

            {/* SEARCH + DATE */}
            {width >= 940 && (
              <div className="pb-1 grid grid-cols-3 space-x-3">
                <div className="col-span-2">
                  <SearchInput
                    className="main-search"
                    searchValue={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <DateTimePicker
                    selectedDate={searchDate}
                    setSelectedDate={setSearchDate}
                  />
                </div>
              </div>
            )}
          </div>

          {/* BUTTON */}
          {width >= 940 && (
            <Button
              className="text-white bg-blue-700 font-semibold px-3 rounded-lg text-[12px] min-w-35 h-10.75 btn-report ml-3"
              onClick={() => setOpenDetail(true)}
            >
              <PlusCircle
                width={14}
                height={14}
                className="max-w-3.5 max-h-3.5"
              />
              <span className="ml-2">Báo cáo nhanh</span>
            </Button>
          )}
        </div>

        {/* TABLE */}
        <div className="grid grid-cols-6 mt-3 space-x-3 task-db-containter">
          <div className={`${width > 1024 ? "col-span-4" : "col-span-6"}`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-blue-800 text-2xl font-semibold">
                Danh sách công việc
              </h3>
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
                        shadow-gray-300 border-l-4 
                        ${item.status === "completed" ? "border-l-green-500" : item.status === "incomplete" ? "border-l-yellow-500" : "border-l-blue-700"}`}
                >
                  <div className="col-span-4 flex items-center justify-between">
                    <h3 className="px-2 py-1 bg-blue-100 rounded-lg uppercase text-blue-700 font-semibold text-xs">
                      {item.workat}
                    </h3>
                    <div className="font-semibold">
                      {item.status === "completed" ? (
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
                      ) : item.status === "incomplete" ? (
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
                            {item.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-4 mb-4">
                    <h3 className="font-semibold text-lg">{item.content}</h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-gray-400 text-xs mb-2">
                        <Clock width={15} height={15} />
                        <span>{format(item.workdate, "dd/MM/yyyy")}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400 text-xs mb-2">
                        <UserIcon width={15} height={15} />
                        <span>{item.fullname}</span>
                      </div>
                    </div>
                    <p className="text-gray-500">{item.handlingdirection}</p>
                  </div>

                  <div className="col-span-1">
                    <h3 className="text-[11px] font-semibold uppercase text-gray-400">
                      Bắt đầu
                    </h3>
                    <p className="font-semibold">
                      {item.starttime?.slice(0, 5)}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <h3 className="text-[11px] font-semibold uppercase text-gray-400">
                      Kết thúc
                    </h3>
                    <p className="font-semibold">{item.endtime?.slice(0, 5)}</p>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-[11px] font-semibold uppercase text-gray-400">
                      Tổng thời gian
                    </h3>
                    <p className="font-semibold">
                      {!item.workduration
                        ? "Chưa thực hiện"
                        : formatDuration(item.workduration ?? 0)}
                    </p>
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
          {width >= 940 && (
            <div className="col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-blue-800 text-2xl font-semibold">&nbsp;</h3>
              </div>
              {loading ? (
                <Loading />
              ) : (
                <DataTable
                  data={dataDashboard}
                  columns={columnsDashboard}
                  rowsPerPage={10}
                  hasSearch={false}
                />
              )}
            </div>
          )}
        </div>
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
              Thêm mới công việc
            </span>
            <Button onClick={() => setOpenDetail(false)}>
              <X className="text-red-400" />
            </Button>
          </div>
          <TaskEditPage
            data={null}
            onClose={() => setOpenDetail(false)}
            fetchDataFn={() => fetchData()}
          />
        </div>
      </Modal>

      <FixedButton
        visible={width < 940}
        icon={<Plus width={24} height={24} />}
        className="bottom-10!"
        handleChange={() => setOpenDetail(true)}
      />
    </>
  );
}

const TodayHeader = () => {
  const today = new Date();
  const day = today.getDate(); // 30
  const month = today.toLocaleString("en-US", { month: "short" }); // Mar

  return (
    <div className="relative w-fit">
      {/* Icon background */}
      <Calendar className="w-32 h-32 text-blue-700 opacity-20" />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm text-gray-500">{month}</span>
        <span className="text-3xl font-semibold">{day}</span>
      </div>
    </div>
  );
};
