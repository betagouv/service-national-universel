import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
registerLocale("fr", fr);

export default function DatePickerList({ value, label, onChange, error = "", className = "", disabled = false, fromEdition = true }) {
  const date = new Date();
  return (
    <div className={className}>
      {label ? <label className={`my-2 whitespace-nowrap ${error ? "text-[#CE0500]" : "text-[#3A3A3A]"}`}>{label}</label> : null}
      <div className={`flex w-full items-center justify-between gap-3 py-1 ${fromEdition && "bg-gray-50 px-4 py-2"}`}>
        <DatePicker
          locale="fr"
          selected={value}
          onChange={onChange}
          placeholderText={"jj/mm/aaaa"}
          disabled={disabled}
          className="w-full bg-[transparent]"
          dateFormat="dd/MM/yyyy"
          maxDate={date.setFullYear(date.getFullYear() + 20)}
        />
        <FiCalendar />
      </div>
      {error && <div className={"text-sm text-[#CE0500]"}>{error}</div>}
    </div>
  );
}
