import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
registerLocale("fr", fr);

export default function DatePickerList({ value, onChange }) {
  return (
    <DatePicker
      locale="fr"
      className="flex justify-between items-center gap-3 w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]"
      selected={value}
      onChange={onChange}
    />
  );
}
