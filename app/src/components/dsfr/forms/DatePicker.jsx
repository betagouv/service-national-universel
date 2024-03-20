import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Input from "./input";

export default function DatePicker({ value, onChange, disabled = false, state = "default", displayError = false }) {
  const [day, setDay] = useState(() => (value ? value.getDate() : ""));
  const [month, setMonth] = useState(() => (value ? value.getMonth() + 1 : ""));
  const [year, setYear] = useState(() => (value ? value.getFullYear() : ""));
  const maxYear = new Date().getFullYear();
  const minYear = 0;
  const error = state == "error" || displayError;

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

  return (
    <>
      <div className="mt-2 flex w-full items-start justify-start gap-3 md:gap-8 flex-row">
        <div className={`flex flex-col items-start mb-2 flex-grow`}>
          <Input
            id="day"
            type="number"
            className={`w-full ${error && "[&>.fr-input-wrap>.fr-input]:shadow-[inset_0_-2px_0_-0_red]"}`}
            min="1"
            max="31"
            value={day}
            onKeyDown={blockInvalidChar}
            onChange={setDay}
            placeholder="Jour"
            hintText="Exemple : 14"
            maxLength="2"
            disabled={disabled}
          />
        </div>
        <div className={`flex flex-col items-start mb-2 flex-grow`}>
          <Input
            id="month"
            type="number"
            className={`w-full ${error && "[&>.fr-input-wrap>.fr-input]:shadow-[inset_0_-2px_0_-0_red]"}`}
            min="1"
            max="12"
            value={month}
            onKeyDown={blockInvalidChar}
            onChange={setMonth}
            placeholder="Mois"
            hintText="Exemple : 12"
            maxLength="2"
            disabled={disabled}
          />
        </div>
        <div className={`flex flex-col items-start mb-2 flex-grow`}>
          <Input
            id="year"
            type="number"
            className={`w-full ${error && "[&>.fr-input-wrap>.fr-input]:shadow-[inset_0_-2px_0_-0_red]"}`}
            min={minYear}
            max={maxYear}
            value={year}
            onKeyDown={blockInvalidChar}
            onChange={setYear}
            placeholder="Année"
            hintText="Exemple : 2004"
            maxLength="4"
            disabled={disabled}
          />
        </div>
      </div>
      {displayError && <div className="h-8">{value && !dayjs(value).isValid() && <span className="text-sm text-red-500">La date n'est pas valide</span>}</div>}
    </>
  );
}
