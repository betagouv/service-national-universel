import React from "react";
import ErrorMessage from "./ErrorMessage";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
registerLocale("fr", fr);

export default function DatePickerList({ value, label, onChange, error = "", className = "", correction = "", disabled = false }) {
  const date = new Date();
  return (
    <div className={`mt-2 mb-4 ${className}`}>
      <label className={`my-2 whitespace-nowrap ${correction || error ? "text-[#CE0500]" : "text-[#3A3A3A]"}`}>{label}</label>
      <div
        className={`flex w-full items-center justify-between gap-3 border-b-[2px] bg-[#EEEEEE] px-4 py-2 ${
          correction || error ? "border-[#CE0500]" : "border-[#3A3A3A]"
        } rounded-t-[4px]`}>
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
      <ErrorMessage>{error}</ErrorMessage>
      <ErrorMessage>{correction}</ErrorMessage>
    </div>
  );
}
