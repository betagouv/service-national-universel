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
  const defaultMonth = mode === "single" ? (value ? new Date(value) : new Date()) : value?.from ? new Date(value.from) : new Date();
  const selected = mode === "single" ? new Date(value) : { from: value?.from ? new Date(value?.from) : undefined, to: value?.to ? new Date(value?.to) : undefined };

  return (
    <DayPicker
      disabled={disabled}
      formatters={{ formatWeekdayName, formatMonthCaption }}
      mode={mode}
      captionLayout="dropdown-buttons"
      showOutsideDays={true}
      defaultMonth={defaultMonth}
      fromYear={fromYear}
      toYear={toYear}
      selected={selected}
      onSelect={(date) => onChange(dayjs(date).toUtc().toDate())}
    />
  );
}
