import React, { useState } from "react";
import dayjs from "dayjs";
import Input from "./input";

export default function DatePicker({ initialValue, onChange, disabled = false, state = "default", displayError = false, errorText }) {
  const [day, setDay] = useState(initialValue ? initialValue.getDate() : null);
  const [month, setMonth] = useState(initialValue ? initialValue.getMonth() + 1 : null);
  const [year, setYear] = useState(initialValue ? initialValue.getFullYear() : null);
  const maxYear = new Date().getFullYear();
  const minYear = 2000;
  const error = state == "error" || displayError;

  const blockInvalidChar = (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault();

  const handleChangeDay = (newDay) => {
    setDay(newDay);
    onChange(new Date(year, month - 1, newDay));
  };

  const handleChangeMonth = (newMonth) => {
    setMonth(newMonth);
    onChange(new Date(year, newMonth - 1, day));
  };

  const handleChangeYear = (newYear) => {
    setYear(newYear);
    onChange(new Date(newYear, month - 1, day));
  };

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
            onChange={handleChangeDay}
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
            onChange={handleChangeMonth}
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
            onChange={handleChangeYear}
            placeholder="Année"
            hintText="Exemple : 2004"
            maxLength="4"
            disabled={disabled}
          />
        </div>
      </div>
      {displayError && <div className="h-8">{initialValue && !dayjs(initialValue).isValid() && <span className="text-sm text-red-500">La date n'est pas valide</span>}</div>}
      {error && (
        <div className="h-8">
          <span className="text-sm text-red-500">{errorText}</span>
        </div>
      )}
    </>
  );
}
