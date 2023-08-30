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

export default function DatePicker({ value, onChange, disabled, fromYear, toYear, mode = "single" }) {
  const defaultMonth = mode === "single" ? dayjs(value).toUtcLocally().toDate() : dayjs(value?.from).toUtcLocally().toDate();
  const selected =
    mode === "single"
      ? dayjs(value).toUtcLocally().toDate()
      : { from: value?.from ? dayjs(value?.from).toUtcLocally().toDate() : undefined, to: value?.to ? dayjs(value?.to).toUtcLocally().toDate() : undefined };

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
      onSelect={(date) => onChange(dayjs(date).toUtc().toDate())}
    />
  );
}
