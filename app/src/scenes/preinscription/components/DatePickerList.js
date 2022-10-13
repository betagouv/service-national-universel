import React from "react";

export default function DatePickerList({ value, onChange }) {
  return (
    <div className="flex flex-wrap bg-white rounded-[0.4rem] box-border shadow-sm">
      <div className="flex py-[10px] px-[20px] w-full">
        <input className="cursor-pointer text-[14px] w-full bg-inherit" type="date" value={value} onChange={onChange}></input>
      </div>
    </div>
  );
}
