import React from "react";

export default function DatePickerDashboard({ title, value, onChange }) {
  return (
    <div className="box-border flex flex-wrap rounded-[0.4rem] bg-white p-[5px] shadow-sm">
      <div className="flex py-[2px] px-[8px]">
        <div className="flex items-center justify-between pr-[5px] text-[0.8rem] text-brand-darkPurple">{title} :</div>
        <input className="cursor-pointer text-[0.8rem]" type="date" value={value} onChange={onChange}></input>
      </div>
    </div>
  );
}
