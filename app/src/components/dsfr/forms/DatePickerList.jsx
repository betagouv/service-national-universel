import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
registerLocale("fr", fr);

export default function DatePickerList({ value, onChange, disabled = false }) {
  const date = new Date();
  return (
    <div className="mt-2 flex w-full items-center justify-between gap-3 rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
      <DatePicker
        locale="fr"
        selected={value}
        onChange={onChange}
        placeholderText={"jj/mm/aaaa"}
        disabled={disabled}
        className="w-full bg-[#EEEEEE]"
        dateFormat="dd/MM/yyyy"
        maxDate={date.setFullYear(date.getFullYear() + 20)}
      />
      <FiCalendar />
    </div>
  );
}
