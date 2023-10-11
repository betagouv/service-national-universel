import React, { useEffect, useState } from "react";

export default function DatePickerList({ value, onChange, disabled = false }) {
  const [day, setDay] = useState(() => (value ? value.getDate().toString().padStart(2, "0") : ""));
  const [month, setMonth] = useState(() => (value ? (value.getMonth() + 1).toString().padStart(2, "0") : ""));
  const [year, setYear] = useState(() => (value ? value.getFullYear().toString() : ""));
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (value) {
      setDay(value.getDate().toString().padStart(2, "0"));
      setMonth((value.getMonth() + 1).toString().padStart(2, "0"));
      setYear(value.getFullYear().toString());
    }
  }, [value]);

  const validateDate = (d, m, y) => {
    let newErrors = [];
    const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (y % 400 === 0 || (y % 100 !== 0 && y % 4 === 0)) monthLength[1] = 29;

    if (!(y > 1900 && y < 2100)) newErrors.push("year");

    if (!(m > 0 && m < 13)) newErrors.push("month");
    else if (!(d > 0 && d <= monthLength[m - 1])) newErrors.push("day");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  useEffect(() => {
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const isValidDate = validateDate(parseInt(day), parseInt(month), parseInt(year));
      if (isValidDate) {
        const newDate = new Date(year, month - 1, day);
        if (!value || value.getTime() !== newDate.getTime()) {
          onChange(newDate);
        }
      }
    }
  }, [day, month, year, onChange, value]);

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
          type="text"
          value={day}
          onChange={handleDayChange}
          placeholder="JJ"
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
          type="text"
          value={month}
          onChange={handleMonthChange}
          placeholder="MM"
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
          type="text"
          value={year}
          onChange={handleYearChange}
          placeholder="AAAA"
          maxLength="4"
          disabled={disabled}
        />
      </div>
      {errors.includes("day") && <p className="text-red-500">Jour invalide</p>}
      {errors.includes("month") && <p className="text-red-500">Mois invalide</p>}
      {errors.includes("year") && <p className="text-red-500">Année invalide</p>}
    </div>
  );
}
