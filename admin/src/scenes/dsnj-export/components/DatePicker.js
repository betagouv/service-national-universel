import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
registerLocale("fr", fr);

function MyDatePicker({ value, onChange = () => {}, className = "", disabled = false, isOpen = false, setOpen = () => {}, label, minDate = undefined }) {
  return (
    <div className={`flex ${className}`}>
      <label className="mr-1 text-[#738297]">{`${label} :`}</label>
      <div>
        <DatePicker
          minDate={minDate}
          onClickOutside={() => {
            setOpen(false);
          }}
          onInputClick={() => {
            setOpen(true);
          }}
          open={isOpen}
          locale="fr"
          selected={value}
          onChange={(value) => {
            onChange(value);
            setOpen(false);
          }}
          placeholderText={"jj/mm/aaaa"}
          disabled={disabled}
          className="w-full bg-[transparent]"
          dateFormat="dd/MM/yyyy"
        />
      </div>
    </div>
  );
}

export default MyDatePicker;
