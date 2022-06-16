import React from "react";

export default function DayTile({ date }) {
  const d = new Date(date);
  const monthNum = d.getMonth();
  const dayNum = d.getDate();
  const yearNum = d.getFullYear();
  const currentYear = new Date().getFullYear();
  const monthString = ["janv", "fevr", "mars", "avril", "mai", "juin", "juil", "aout", "sept", "oct", "nov", "dec"][monthNum];

  return (
    <div className="bg-white rounded-lg shadow-nina flex flex-col items-center justify-around w-11 h-11 p-1">
      <div className="text-[10px] text-[#EC6316] font-medium uppercase leading-3">{monthString}</div>
      <div className="text-[19px] text-[#3F444A] font-bold leading-4">{dayNum}</div>
      {currentYear !== yearNum ? <div className="text-[9px] text-[#3F444A] font-medium uppercase leading-3">{yearNum}</div> : null}
    </div>
  );
}
