import React, { useEffect, useState } from "react";

export default function DatePickerDsfr({ value, onChange, disabled = false }) {
  const [day, setDay] = useState(() => (value ? value.getDate() : ""));
  const [month, setMonth] = useState(() => (value ? value.getMonth() + 1 : ""));
  const [year, setYear] = useState(() => (value ? value.getFullYear() : ""));

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

  return (
    <div className="mt-2 flex w-full items-start justify-start gap-8 flex-row">
      <div className="flex flex-col items-start mb-2 flex-grow">
        <label htmlFor="day" className="text-[#666666] text-sm mb-2 ml-1">
          Exemple: 14
        </label>
        <input
          id="day"
          className="w-full bg-[#EEEEEE] rounded-tl-md rounded-tr-md border-b-[2px] border-black px-4 py-2"
          type="number"
          value={day}
          onChange={handleDayChange}
          placeholder="Jour"
          maxLength="2"
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col items-start mb-2 flex-grow">
        <label htmlFor="month" className="text-[#666666] text-sm mb-2 ml-1">
          Exemple: 12
        </label>
        <input
          id="month"
          className="w-full bg-[#EEEEEE] rounded-tl-md rounded-tr-md border-b-[2px] border-black px-4 py-2"
          type="number"
          value={month}
          onChange={handleMonthChange}
          placeholder="Mois"
          maxLength="2"
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col items-start mb-2 flex-grow">
        <label htmlFor="year" className="text-[#666666] text-sm mb-2 ml-1">
          Exemple: 2000
        </label>
        <input
          id="year"
          className="w-full bg-[#EEEEEE] rounded-tl-md rounded-tr-md border-b-[2px] border-black px-4 py-2"
          type="number"
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
