"use client";

import { Clock } from "lucide-react";
import { IMaskInput } from "react-imask";
import IMask from "imask";

export default function TimeInput({ ...props }) {
  return (
    <div className="form-input relative">
      <IMaskInput
        // mask="HH:mm aa"
        // blocks={{
        //   HH: {
        //     mask: IMask.MaskedRange,
        //     from: 1,
        //     to: 12,
        //     maxLength: 2,
        //   },
        //   mm: {
        //     mask: IMask.MaskedRange,
        //     from: 0,
        //     to: 59,
        //   },
        //   aa: {
        //     mask: IMask.MaskedEnum,
        //     enum: ["SA", "CH"],
        //   },
        // }}
        lazy={false} // luôn hiển thị placeholder
        overwrite={true} // ghi đè cho mượt hơn
        placeholder="--:-- --"
        prepare={(str) => {
          const upper = str.toUpperCase();

          if (upper === "S") return "SA";
          if (upper === "C") return "CH";

          return upper;
        }}
        className="form-input-mask pl-5 pr-2 outline-none w-full bg-transparent"
        {...props}
      />

      <Clock
        width={16}
        height={16}
        className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
      />
    </div>
  );
}
