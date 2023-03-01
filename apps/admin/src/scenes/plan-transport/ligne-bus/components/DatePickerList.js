import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
registerLocale("fr", fr);

export default function DatePickerList({ value, label, onChange, error = "", disabled = false, readOnly = false, Icon = false }) {
  return (
    <div className={`flex flex-col border-[1px] border-gray-300 w-full py-2 px-2.5 rounded-lg h-[63px] ${disabled ? "bg-gray-100" : ""} ${error ? "border-red-500" : ""}`}>
      <div className="flex items-center gap-x-2 w-full">
        {Icon ? <Icon className="text-gray-400 w-4 h-4" /> : null}
        <div className="flex flex-col w-full">
          <label className="text-xs leading-4 text-gray-500">{label}</label>
          <div className="flex justify-between items-center w-full ">
            <DatePicker
              locale="fr"
              selected={value}
              onChange={onChange}
              placeholderText={"jj/mm/aaaa"}
              disabled={disabled || !!readOnly}
              className="bg-[transparent] w-full"
              dateFormat="dd/MM/yyyy"
            />
            {(!readOnly || disabled) && <FiCalendar />}
          </div>
        </div>
      </div>
      {error && <div className={"text-[#CE0500] text-sm"}>{error}</div>}
    </div>
  );
}
