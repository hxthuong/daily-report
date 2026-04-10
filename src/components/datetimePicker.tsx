import { Calendar, Clock } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale/vi";
registerLocale("vi", vi);

export default function DateTimePicker({
  showTimeOnly = false,
  selectedDate,
  setSelectedDate,
}: {
  showTimeOnly?: boolean;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}) {
  if (showTimeOnly) {
    return (
      <DatePicker
        showIcon
        selected={selectedDate}
        onChange={setSelectedDate}
        icon={<Clock className="mt-1.25" />}
        dateFormat="HH:mm aa"
        showTimeSelect
        showTimeSelectOnly
        timeFormat="HH:mm aa"
        timeIntervals={15}
        className="form-input w-full py-2.5! pl-7.5"
        locale="vi"
      />
    );
  }

  return (
    <DatePicker
      showIcon
      selected={selectedDate}
      onChange={setSelectedDate}
      icon={<Calendar className="mt-1.25" />}
      dateFormat="dd/MM/yyyy"
      className="form-input w-full py-2.5! pl-7.5"
    />
  );
}
