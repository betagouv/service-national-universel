import React from "react";

export default function DayTile({ date1, date2 }) {
  const months = ["janv", "fevr", "mars", "avril", "mai", "juin", "juil", "aout", "sept", "oct", "nov", "dec"];
  const currentYear = new Date().getFullYear();

  const getInfosDate = (date) => {
    const d = new Date(date);
    const monthNum = d.getMonth();
    const monthString = months[monthNum];
    const dayNum = d.getDate();
    const yearNum = d.getFullYear();
    return {
      monthNum,
      dayNum,
      yearNum,
      monthString,
    };
  };

  const infosDate1 = getInfosDate(date1);
  const infosDate2 = getInfosDate(date2);

  const showYears = infosDate1.yearNum !== infosDate2.yearNum || infosDate1.yearNum !== currentYear || infosDate2.yearNum !== currentYear;

  return (
    <div className="bg-white rounded-lg shadow-nina flex min-h-[44px] w-24">
      <div className="flex flex-1 flex-col items-center justify-around p-[2px]">
        <div className="text-[10px] text-[#EC6316] font-medium uppercase leading-3">{infosDate1.monthString}</div>
        <div className="text-[19px] text-[#3F444A] font-bold leading-4">{infosDate1.dayNum}</div>
        {showYears ? <div className="mt-1 text-[9px] text-[#3F444A] font-medium uppercase leading-3">{infosDate1.yearNum}</div> : null}
      </div>
      <div className="py-2">
        <div className="bg-gray-200 w-[1px] h-full" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-around p-[2px]">
        <div className="text-[10px] text-[#EC6316] font-medium uppercase leading-3">{infosDate2.monthString}</div>
        <div className="text-[19px] text-[#3F444A] font-bold leading-4">{infosDate2.dayNum}</div>
        {showYears ? <div className="mt-1 text-[9px] text-[#3F444A] font-medium uppercase leading-3">{infosDate2.yearNum}</div> : null}
      </div>
    </div>
  );
}
