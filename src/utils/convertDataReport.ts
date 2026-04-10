import { Task } from "@/types/task";
import { format } from "date-fns";
import { formatDuration } from "./dateTime";
export default function convertDataReport(
  data: Task[],
  fromDate: string,
  toDate: string,
) {
  // Nhóm theo nhân viên
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employeesMap: any = {};

  data.forEach((task) => {
    const name = task.fullname || "Không xác định";
    if (!employeesMap[name]) {
      employeesMap[name] = {
        userid: task.userid,
        name,
        avatar: task.avatar,
        totalMinutes: 0,
        tasks: [],
      };
    }

    const result =
      task.status === "completed"
        ? "Hoàn thành"
        : task.status === "incomplete"
          ? "Chưa hoàn thành"
          : task.status;

    employeesMap[name].tasks.push({
      id: task.id,
      stt: employeesMap[name].tasks.length + 1,
      department: task.workat,
      content: task.content,
      date: format(task.workdate, "dd/MM/yyyy"),
      start: task.starttime?.slice(0, 5) || "",
      end: task.endtime?.slice(0, 5) || "",
      duration: formatDuration(task.workduration ?? 0),
      solution: task.handlingdirection,
      result: result,
    });

    employeesMap[name].totalMinutes += task.workduration;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employees = Object.values(employeesMap).map((e: any) => ({
    userid: e.userid,
    name: e.name,
    avatar: e.avatar,
    totalTime: formatDuration(e.totalMinutes),
    tasks: e.tasks,
  }));

  return {
    fromDate: fromDate,
    toDate: toDate,
    employees,
  };
}
