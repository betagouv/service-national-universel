import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
registerLocale("fr", fr);

export default function DatePickerList({ value, label, onChange, error = "", className = "", disabled = false }) {
  const date = new Date();
  return (
    <div className={className}>
      {label ? <label className={`my-2 whitespace-nowrap ${error ? "text-[#CE0500]" : "text-[#3A3A3A]"}`}>{label}</label> : null}
      <div className={"flex justify-between items-center gap-3 w-full bg-gray-50 px-4 py-2"}>
        <DatePicker
          locale="fr"
          selected={value}
          onChange={onChange}
          placeholderText={"jj/mm/aaaa"}
          disabled={disabled}
          className="bg-[transparent] w-full"
          dateFormat="dd/MM/yyyy"
          maxDate={date.setFullYear(date.getFullYear() + 20)}
        />
        <FiCalendar />
      </div>
      {error && <div className={"text-[#CE0500] text-sm"}>{error}</div>}
    </div>
  );
}
