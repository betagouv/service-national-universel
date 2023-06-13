import React from "react";

export default function DatePickerList({ title, value, onChange }) {
  return (
    <div className="flex flex-wrap rounded-md border-[1px] border-[#D1D5DB] bg-white">
      <div className="flex py-[10px] px-[20px]">
        <div className="flex items-center justify-between pr-[5px] text-[14px]">{title} :</div>
        <input className="cursor-pointer text-[14px]" type="date" value={value} onChange={onChange}></input>
      </div>
    </div>
  );
}
