import React from "react";
import { DayPicker } from "react-day-picker";
import { MONTHS } from "snu-lib";
import dayjs from "@/utils/dayjs.utils";

const formatMonthCaption = (day) => {
  return MONTHS[day.getMonth()];
};

const formatWeekdayName = (day) => {
  return day.toLocaleDateString("fr", { weekday: "long" }).substring(0, 3);
};

type DatePickerProps = {
  value?: { from?: Date | string | null; to?: Date | string | null } | Date | string;
  onChange: (date: Date | string | { from?: Date | string | null; to?: Date | string | null }) => void;
  disabled?: boolean;
  fromYear?: number;
  toYear?: number;
  mode?: "single" | "range";
};

export default function DatePicker({ value, onChange, disabled, fromYear, toYear, mode = "single" }: DatePickerProps) {
  const defaultMonth = React.useMemo(() => {
    if (mode === "single") {
      if (value && typeof value !== "string" && !(value instanceof Date)) {
        return dayjs().toDate();
      }
      return value ? dayjs(value).toDate() : dayjs().toDate();
    } else {
      if (value && typeof value === "object" && "from" in value && value.from) {
        return dayjs(value.from).toDate();
      }
      return dayjs().toDate();
    }
  }, [value, mode]);

  const selected = React.useMemo(() => {
    if (mode === "single") {
      if (value && typeof value !== "string" && !(value instanceof Date)) {
        return undefined;
      }
      return value ? dayjs(value).toDate() : undefined;
    } else {
      return {
        from: value && typeof value === "object" && "from" in value && value.from ? dayjs(value.from).toDate() : undefined,
        to: value && typeof value === "object" && "to" in value && value.to ? dayjs(value.to).toDate() : undefined,
      };
    }
  }, [value, mode]);

  return (
    <DayPicker
      disabled={disabled}
      formatters={{ formatWeekdayName, formatMonthCaption }}
      mode={mode}
      captionLayout="dropdown-buttons"
      showOutsideDays
      weekStartsOn={1}
      defaultMonth={defaultMonth}
      fromYear={fromYear}
      toYear={toYear}
      selected={selected}
      onSelect={(date) => {
        if (mode === "range") {
          onChange(
            date
              ? {
                  from: date.from ? dayjs(date.from).toDate() : undefined,
                  to: date.to ? dayjs(date.to).toDate() : undefined,
                }
              : undefined,
          );
        } else {
          onChange(date ? dayjs(date).toDate() : undefined);
        }
      }}
    />
  );
}
