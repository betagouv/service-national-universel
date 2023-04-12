import React from "react";
import { default as ReactDatePicker, registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
registerLocale("fr", fr);

const DatePicker = ({ value, label, onChange, error = "", className = "", correction = "", disabled = false }) => {
  const date = new Date();
  return (
    <div className={`mt-2 mb-4 ${className}`}>
      <label className={`my-2 whitespace-nowrap ${correction || error ? "text-[#CE0500]" : "text-[#3A3A3A]"}`}>{label}</label>
      <div
        className={`flex justify-between items-center gap-3 w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] ${
          correction || error ? "border-[#CE0500]" : "border-[#3A3A3A]"
        } rounded-t-[4px]`}>
        <ReactDatePicker
          locale="fr"
          selected={value}
          onChange={onChange}
          placeholderText={"jj/mm/aaaa"}
          disabled={disabled}
          className="bg-[#EEEEEE] w-full"
          dateFormat="dd/MM/yyyy"
          maxDate={date.setFullYear(date.getFullYear() + 20)}
        />
        <FiCalendar />
      </div>
    </div>
  );
};

export default DatePicker;
