import React from "react";
import styled from "styled-components";

export default function DatePicker({ title, value, onChange }) {
  return (
    <div className="flex flex-wrap p-[5px] bg-white rounded-[0.4rem] box-border shadow-sm">
      <div className="flex py-[2px] px-[8px]">
        <div className="flex justify-between items-center pr-[5px] text-brand-darkPurple text-[0.8rem]">{title} :</div>
        <input className="cursor-pointer text-[0.8rem]" type="date" value={value} onChange={onChange}></input>
      </div>
    </div>
  );
}
