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
  value?: { from?: Date; to?: Date } | Date;
  onChange: (date: Date | { from?: Date; to?: Date }) => void;
  disabled?: boolean;
  fromYear?: number;
  toYear?: number;
  mode?: "single" | "range";
};

export default function DatePicker({ value, onChange, disabled, fromYear, toYear, mode = "single" }: DatePickerProps) {
  const defaultMonth =
    mode === "single"
      ? value
        ? // @ts-expect-error toUtcLocally
          dayjs(value).toUtcLocally().toDate()
        : // @ts-expect-error toUtcLocally
          dayjs(new Date()).toUtcLocally().toDate()
      : // @ts-expect-error from
        value?.from
        ? // @ts-expect-error from
          dayjs(value?.from)
            // @ts-expect-error toUtcLocally
            .toUtcLocally()
            .toDate()
        : // @ts-expect-error toUtcLocally
          dayjs(new Date()).toUtcLocally().toDate();
  const selected =
    mode === "single"
      ? value
        ? // @ts-expect-error toUtcLocally
          dayjs(value).toUtcLocally().toDate()
        : undefined
      : {
          // @ts-expect-error from
          from: value?.from
            ? // @ts-expect-error from
              dayjs(value?.from)
                // @ts-expect-error toUtcLocally
                .toUtcLocally()
                .toDate()
            : undefined,
          // @ts-expect-error to
          to: value?.to
            ? // @ts-expect-error to
              dayjs(value?.to)
                // @ts-expect-error toUtcLocally
                .toUtcLocally()
                .toDate()
            : undefined,
        };

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
        // @ts-expect-error toUtc
        if (mode === "range") return onChange({ from: date?.from ? dayjs(date.from).toUtc().toDate() : undefined, to: date?.to ? dayjs(date.to).toUtc().toDate() : undefined });
        // @ts-expect-error toUtc
        onChange(date ? dayjs(date).toUtc().toDate() : undefined);
      }}
    />
  );
}
