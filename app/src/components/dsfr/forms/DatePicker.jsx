import React, { useEffect, useState } from "react";

export default function DatePicker({ value, onChange, disabled = false }) {
  const [day, setDay] = useState(() => (value ? value.getDate() : ""));
  const [month, setMonth] = useState(() => (value ? value.getMonth() + 1 : ""));
  const [year, setYear] = useState(() => (value ? value.getFullYear() : ""));
  const maxYear = new Date().getFullYear();
  const minYear = maxYear - 25;
  const limitRange = (value, min, max) => value && Math.min(max, Math.max(min, value));
  const limitDay = (day) => limitRange(day, 1, 31);
  const limitMonth = (month) => limitRange(month, 1, 12);
  const limitYear = (year) => limitRange(year, 20, maxYear);

  useEffect(() => {
    if (day && month && year) {
      const dayString = day.toString();
      const monthString = month.toString();
      const dateString = `${year}-${monthString.length === 1 ? `0${monthString}` : monthString}-${dayString.length === 1 ? `0${dayString}` : dayString}T00:00:00`;
      const newDate = new Date(dateString);
      onChange(newDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, month, year]);

  useEffect(() => {
    if (value && !day && !month && !year) {
      setDay(value.getDate());
      setMonth(value.getMonth() + 1);
      setYear(value.getFullYear());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleDayChange = (e) => setDay(limitDay(e.target.value));
  const handleMonthChange = (e) => setMonth(limitMonth(e.target.value));
  const handleYearChange = (e) => setYear(limitYear(e.target.value));

  const textColor = disabled ? "text-[#929292]" : "text-[#666666]";
  const borderColor = disabled ? "border-[#929292]" : "border-black";

  return (
    <div className="mt-2 flex w-full items-start justify-start gap-3 md:gap-8 flex-row">
      <div className={`flex flex-col items-start mb-2 flex-grow ${textColor}`}>
        <label htmlFor="day" className={`text-sm mb-2 ml-1 ${textColor}`}>
          Exemple : 14
        </label>
        <input
          id="day"
          className={`w-full  bg-[#EEEEEE] rounded-tl-md rounded-tr-md border-b-[2px] ${borderColor} px-4 py-2`}
          type="number"
          min="1"
          max="31"
          value={day}
          onChange={handleDayChange}
          placeholder="Jour"
          maxLength="2"
          disabled={disabled}
        />
      </div>
      <div className={`flex flex-col items-start mb-2 flex-grow ${textColor}`}>
        <label htmlFor="month" className={`text-sm mb-2 ml-1 ${textColor}`}>
          Exemple : 12
        </label>
        <input
          id="month"
          className={`w-full  bg-[#EEEEEE] rounded-tl-md rounded-tr-md border-b-[2px] ${borderColor} px-4 py-2`}
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={handleMonthChange}
          placeholder="Mois"
          maxLength="2"
          disabled={disabled}
        />
      </div>
      <div className={`flex flex-col items-start mb-2 flex-grow ${textColor}`}>
        <label htmlFor="year" className={`text-sm mb-2 ml-1 ${textColor}`}>
          Exemple : 2000
        </label>
        <input
          id="year"
          className={`w-full  bg-[#EEEEEE] rounded-tl-md rounded-tr-md border-b-[2px] ${borderColor} px-4 py-2`}
          type="number"
          min={minYear}
          max={maxYear}
          value={year}
          onChange={handleYearChange}
          placeholder="Année"
          maxLength="4"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
