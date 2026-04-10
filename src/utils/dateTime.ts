import { format } from "date-fns";

// /Date(1763437834623)/ => yyyy-MM-ddTHH:mm:ss
export const convertStringToDate = (dateStr: string): Date => {
  const timestamp = parseInt(dateStr.match(/\d+/)?.[0] || "0", 10);
  return new Date(timestamp);
};

export function formatDuration(totalMinutes?: number) {
  if (totalMinutes == null) return "--";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let str = hours > 0 ? `${hours} giờ` : "";
  if (minutes > 0) str += ` ${minutes} phút`;

  return str.trim();
}

export const toHHmm = (iso: string = "") => {
  if (!iso.trim()) return null;
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC", // 👈 QUAN TRỌNG
  });
};

export const buildISO = (date: Date, time: string) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${time}:00.000Z`;
};

export const to12h = (value: string) => {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;

  const [_, hh, mm] = match;
  let hour = parseInt(hh, 10);

  const period = hour >= 12 ? "CH" : "SA";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  // 👇 thêm padStart
  const hourStr = String(hour).padStart(2, "0");

  return `${hourStr}:${mm} ${period}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const to24h = (value: any) => {
  // trường hợp user nhập 13:30
  if (/^\d{1,2}:\d{2}$/.test(value)) {
    return value;
  }

  // trường hợp 1:30 CH
  const match = value.match(/^(\d{1,2}):(\d{2})\s?(SA|CH)$/i);
  if (!match) return null;

  const [_, hh, mm, period] = match;
  let hour = parseInt(hh, 10);

  if (period.toUpperCase() === "CH" && hour !== 12) hour += 12;
  if (period.toUpperCase() === "SA" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${mm}`;
};
