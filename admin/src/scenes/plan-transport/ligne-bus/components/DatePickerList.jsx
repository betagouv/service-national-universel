import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
registerLocale("fr", fr);

export default function DatePickerList({ value, label, onChange, error = "", disabled = false, readOnly = false, Icon = false }) {
  return (
    <div className={`flex w-full flex-col rounded-lg border-[1px] border-gray-300 py-2 px-2.5 ${disabled ? "bg-gray-100" : ""} ${error ? "border-red-500" : ""}`}>
      <div className="flex w-full items-center gap-x-2">
        {Icon ? <Icon className="h-4 w-4 text-gray-400" /> : null}
        <div className="flex w-full flex-col">
          <label className="text-xs leading-4 text-gray-500">{label}</label>
          <div className="flex w-full items-center justify-between ">
            <DatePicker
              locale="fr"
              selected={value}
              onChange={onChange}
              placeholderText={"jj/mm/aaaa"}
              disabled={disabled || !!readOnly}
              className="w-full bg-[transparent]"
              dateFormat="dd/MM/yyyy"
            />
            {(!readOnly || disabled) && <FiCalendar />}
          </div>
        </div>
      </div>
      {error && <div className={"text-sm text-[#CE0500]"}>{error}</div>}
    </div>
  );
}
