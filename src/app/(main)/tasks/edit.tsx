"use client";

import { useEffect, useState } from "react";
import { Option } from "@/types/dropdown";
import Dropdown from "@/components/dropDown";
import { Button } from "@/components/button";
import { Task } from "@/types/task";
import DateTimePicker from "@/components/datetimePicker";
import TimeInput from "@/components/timeInput";
import { User } from "@/types/user";
import RadioButton from "@/components/radioButton";
import { toHHmm } from "@/utils/dateTime";
import { useNotification } from "@/context/notification";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";

export default function TaskEditPage({
  UserID,
  data,
  fetchDataFn,
  onClose,
}: {
  UserID?: string | null;
  data: Task | null;
  fetchDataFn: (
    strSearch?: string,
    from?: Date | null,
    to?: Date | null,
  ) => void;
  onClose: () => void;
}) {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [employee, setEmployee] = useState<string>();
  const [workDate, setWorkDate] = useState<Date | null>(new Date());
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [workAt, setWorkAt] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [handling, setHandling] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [status, setStatus] = useState<string>("completed");
  const supabase = createClient();

  useEffect(() => {
    if (!data) return;

    setEmployee(data.userid ?? null);
    setWorkDate(new Date(data.workdate));
    setStartTime(data.starttime || "");
    setEndTime(data.endtime || "");
    setWorkAt(data.workat ?? "");
    setContent(data.content ?? "");
    setHandling(data.handlingdirection ?? "Đã xong");
    setResult(
      data.status && data.status !== "completed" && data.status !== "incomplete"
        ? data.status
        : "",
    );
    setStatus(
      data.status !== "completed" && data.status !== "incomplete"
        ? "other"
        : data.status,
    );
  }, [data]);

  const fetchEmployees = async () => {
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
  };

  useEffect(() => {
    setTimeout(() => fetchEmployees(), 0);
  }, []);

  const clearInput = () => {
    setEmployee("");
    setWorkDate(null);
    setStartTime("");
    setEndTime("");
    setWorkAt("");
    setContent("");
    setHandling("");
    setResult("");
    setStatus("completed");
  };

  const handleSave = async () => {
    if (!employee || employee === undefined) {
      notify.warning("Vui lòng chọn nhân viên");
      return;
    }

    if (!workAt.trim()) {
      notify.warning("Vui lòng nhập khoa/phòng yêu cầu");
      return;
    }

    if (!content.trim()) {
      notify.warning("Vui lòng nhập nội dung công việc");
      return;
    }

    if (!workDate) {
      notify.warning("Vui lòng nhập ngày thực hiện");
      return;
    }

    if (!startTime || startTime === "__:__") {
      notify.warning("Vui lòng nhập thời gian bắt đầu");
      return;
    }

    if (status !== "completed" && status !== "incomplete" && !result.trim()) {
      notify.warning(
        "Vui lòng chọn lại trạng thái hoặc nhập nội dung trạng thái khác",
      );
      return;
    }

    const handlingStr =
      (!handling.trim() &&
        (status === "completed" ? "Đã xong" : "Tiếp tục xử lý")) ||
      handling.trim();

    setLoading(true);

    const { error } = await supabase.rpc("spu_dr_reports_addedit", {
      p_id: data?.id || null,
      p_userid: employee, // ✅ phải tồn tại trong dr_users
      p_workdate: workDate ? format(workDate, "yyyy-MM-dd") : null,
      p_workat: workAt.trim(),
      p_content: content.trim(),
      p_starttime: startTime ? `${startTime}` : null,
      p_endtime: endTime && endTime !== "__:__" ? `${endTime}` : null,
      p_handlingdirection: handlingStr,
      p_status: status === "other" ? result.trim() : status,
      p_modifiedby: UserID,
    });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      notify.error(error.message);
      setLoading(false);
      return;
    }

    onClose();
    clearInput();
    setLoading(false);
    fetchDataFn();
  };

  return (
    <div className="grid grid-cols-7 gap-3 task-container">
      <div className="col-span-7">
        <p className="form-label">Tên nhân viên</p>
        {employees.length > 0 ? (
          <Dropdown
            className="hover:border-blue-400 form-input"
            hasSearch
            placeholder="---- Chọn nhân viên ----"
            options={employees}
            value={employee} // guaranteed to match an id in categories
            onSelect={(option) =>
              setEmployee(Array.isArray(option) ? "" : String(option?.id))
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
      <div className="col-span-7">
        <p className="form-label">Khoa/phòng yêu cầu</p>
        <input
          className="form-input"
          value={workAt}
          // placeholder="Nhập từ khóa tìm kiếm"
          onChange={(e) => setWorkAt(e.target.value)}
        />
      </div>
      <div className="col-span-7">
        <p className="form-label">Nội dung công việc</p>
        <textarea
          className="form-input"
          value={content}
          rows={4}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="col-span-3">
        <p className="form-label">Ngày thực hiện</p>
        <DateTimePicker selectedDate={workDate} setSelectedDate={setWorkDate} />
      </div>
      <div className="col-span-2">
        <p className="form-label">Thời gian bắt đầu</p>
        <TimeInput
          mask="00:00"
          value={startTime}
          onAccept={(value: string) => setStartTime(value)}
        />
      </div>
      <div className="col-span-2">
        <p className="form-label">Kết thúc</p>
        <TimeInput
          mask="00:00"
          value={endTime}
          onAccept={(value: string) => setEndTime(value)}
        />
      </div>
      <div className="col-span-7">
        <p className="form-label">Hướng xử lý</p>
        <textarea
          className="form-input"
          value={handling}
          rows={3}
          onChange={(e) => setHandling(e.target.value)}
        />
      </div>
      <div className="col-span-7">
        <p className="form-label">Kết quả thực hiện</p>
        <div className="flex items-center space-x-3 task-result">
          <RadioButton
            label="Hoàn thành"
            value={"completed"}
            checked={status === "completed"}
            onChange={(e) => {
              setStatus(e.target.value);
              setResult("");
            }}
          />
          <RadioButton
            label="Chưa hoàn thành"
            value={"incomplete"}
            checked={status === "incomplete"}
            onChange={(e) => {
              setStatus(e.target.value);
              setResult("");
            }}
          />
          <RadioButton
            label="Khác (có thể nhập)"
            value={"other"}
            checked={status === "other"}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
        {/* Fade input */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            status === "other"
              ? "opacity-100 max-h-20 mt-3"
              : "opacity-0 max-h-0"
          }`}
        >
          <input
            type="text"
            placeholder="Nhập trạng thái khác..."
            className="form-input w-full"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          />
        </div>
      </div>
      <div className="col-span-7 flex items-end justify-end space-x-3 border-t border-t-gray-300 pt-4">
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
