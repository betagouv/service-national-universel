import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
registerLocale("fr", fr);

export default function DatePickerList({ value, onChange, disabled = false }) {
  return (
    <div className="flex justify-between items-center gap-3 w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px] mt-2">
      <DatePicker locale="fr" selected={value} onChange={onChange} placeholderText={"jj/mm/aaaa"} disabled={disabled} className="bg-[#EEEEEE]" dateFormat="dd/MM/yyyy"></DatePicker>
      <FiCalendar />
    </div>
  );
}
