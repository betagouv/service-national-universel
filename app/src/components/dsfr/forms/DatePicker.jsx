import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function DatePicker({ value, onChange, disabled = false, displayError = false }) {
  const [day, setDay] = useState(() => (value ? value.getDate() : ""));
  const [month, setMonth] = useState(() => (value ? value.getMonth() + 1 : ""));
  const [year, setYear] = useState(() => (value ? value.getFullYear() : ""));
  const maxYear = new Date().getFullYear();
  const minYear = 0;

  const blockInvalidChar = (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault();

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

  const handleDayChange = (e) => setDay(e.target.value);
  const handleMonthChange = (e) => setMonth(e.target.value);
  const handleYearChange = (e) => setYear(e.target.value);

  const textColor = disabled ? "text-[#929292]" : "text-[#161616]";
  const borderColor = disabled ? "border-[#929292]" : "border-black";

  return (
    <>
      <div className="mt-2 flex w-full items-start justify-start gap-3 md:gap-8 flex-row">
        <div className={`flex flex-col items-start mb-2 flex-grow ${textColor}`}>
          <label htmlFor="day" className={`text-sm mb-2 ml-1 ${textColor}`}>
            Exemple : 14
          </label>
          <input
            id="day"
            className={`w-full bg-[#EEEEEE] rounded-t-md border-b-2 ${borderColor} px-4 py-2`}
            type="number"
            min="1"
            max="31"
            value={day}
            onKeyDown={blockInvalidChar}
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
            className={`w-full bg-[#EEEEEE] rounded-t-md border-b-2 ${borderColor} px-4 py-2`}
            type="number"
            min="1"
            max="12"
            value={month}
            onKeyDown={blockInvalidChar}
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
            className={`w-full bg-[#EEEEEE] rounded-t-md border-b-2 ${borderColor} px-4 py-2`}
            type="number"
            min={minYear}
            max={maxYear}
            value={year}
            onKeyDown={blockInvalidChar}
            onChange={handleYearChange}
            placeholder="Année"
            maxLength="4"
            disabled={disabled}
          />
        </div>
      </div>
      {displayError && <div className="h-8">{value && !dayjs(value).isValid() && <span className="text-sm text-red-500">La date n'est pas valide</span>}</div>}
    </>
  );
}
