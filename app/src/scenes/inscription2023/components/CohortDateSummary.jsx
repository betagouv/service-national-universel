import React from "react";
import dayjs from "dayjs";

export default function CohortDateSummary({ departureDate, returnDate, className }) {
  return (
    <div className={`flex flex-col items-center rounded-xl bg-gray-50 py-2 px-3 md:flex-row ${className}`}>
      <DateSummary type="Aller" date={departureDate} className="mb-8 md:mb-0 md:mr-8" />
      <DateSummary type="Retour" date={returnDate} />
    </div>
  );
}

function DateSummary({ date, type, className }) {
  const d = dayjs(date).locale("fr");
  return (
    <div className={`flex w-full items-center md:w-auto ${className}`}>
      <div className="mr-2 rounded-xl bg-[#FFFFFF] px-2 py-1 shadow">
        <div className="text-center text-[10px] font-medium uppercase text-[#EC6316]">{d.format("MMM")}</div>
        <div className="text-center text-lg font-bold text-[#3F444A]">{d.format("DD")}</div>
      </div>
      <div className="">
        <div className="text-sm text-gray-500">{type}</div>
        <div className="text-lg font-bold text-gray-800">
          <span className="capitalize">{d.format("dddd")}</span> <span>{d.format("D MMMM")}</span>
        </div>
      </div>
    </div>
  );
}
