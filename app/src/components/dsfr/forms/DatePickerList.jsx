// import React from "react";
// import DatePicker, { registerLocale } from "react-datepicker";
// import fr from "date-fns/locale/fr";
// import "react-datepicker/dist/react-datepicker.css";
// import { FiCalendar } from "react-icons/fi";
// registerLocale("fr", fr);

// export default function DatePickerList({ value, onChange, disabled = false }) {
//   const date = new Date();
//   return (
//     <div className="mt-2 flex w-full items-center justify-between gap-3 rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
//       <DatePicker
//         locale="fr"
//         selected={value}
//         onChange={onChange}
//         placeholderText={"jj/mm/aaaa"}
//         disabled={disabled}
//         className="w-full bg-[#EEEEEE]"
//         dateFormat="dd/MM/yyyyD"
//         maxDate={date.setFullYear(date.getFullYear() + 20)}
//       />
//       <FiCalendar />
//     </div>
//   );
// }

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
    <div className="mt-2 flex w-full items-center justify-between gap-3 rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
      <input type="text" value={day} onChange={handleDayChange} placeholder="JJ" maxLength="2" disabled={disabled} className="w-1/3 bg-[#EEEEEE]" />
      <input type="text" value={month} onChange={handleMonthChange} placeholder="MM" maxLength="2" disabled={disabled} className="w-1/3 bg-[#EEEEEE]" />
      <input type="text" value={year} onChange={handleYearChange} placeholder="AAAA" maxLength="4" disabled={disabled} className="w-1/3 bg-[#EEEEEE]" />
      {errors.includes("day") && <p className="text-red-500">Jour invalide</p>}
      {errors.includes("month") && <p className="text-red-500">Mois invalide</p>}
      {errors.includes("year") && <p className="text-red-500">Année invalide</p>}
    </div>
  );
}

// import React, { useEffect, useState } from "react";

// export default function DatePickerList({ value, onChange, disabled = false }) {
//   const [day, setDay] = useState(() => value ? value.getDate().toString().padStart(2, '0') : "");
//   const [month, setMonth] = useState(() => value ? (value.getMonth() + 1).toString().padStart(2, '0') : "");
//   const [year, setYear] = useState(() => value ? value.getFullYear().toString() : "");

//   // Update local state when `value` changes
//   useEffect(() => {
//     if (value) {
//       setDay(value.getDate().toString().padStart(2, '0'));
//       setMonth((value.getMonth() + 1).toString().padStart(2, '0'));
//       setYear(value.getFullYear().toString());
//     }
//   }, [value]);

//   // Update external state when local state changes
//   useEffect(() => {
//     if (day.length === 2 && month.length === 2 && year.length === 4) {
//       const newDate = new Date(year, month - 1, day);
//       if (!isNaN(newDate)) {
//         // Prevent loop by checking if the new date is different from the current value
//         if (!value || value.getTime() !== newDate.getTime()) {
//           onChange(newDate);
//         }
//       }
//     }
//   }, [day, month, year, onChange, value]);

//   const handleDayChange = (e) => setDay(e.target.value);
//   const handleMonthChange = (e) => setMonth(e.target.value);
//   const handleYearChange = (e) => setYear(e.target.value);

//   return (
//     <div className="mt-2 flex w-full items-center justify-between gap-3 rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
// <input type="text" value={day} onChange={handleDayChange} placeholder="JJ" maxLength="2" disabled={disabled} className="w-1/3 bg-[#EEEEEE]" />
// <input type="text" value={month} onChange={handleMonthChange} placeholder="MM" maxLength="2" disabled={disabled} className="w-1/3 bg-[#EEEEEE]" />
// <input type="text" value={year} onChange={handleYearChange} placeholder="AAAA" maxLength="4" disabled={disabled} className="w-1/3 bg-[#EEEEEE]" />
//     </div>
//   );
// }

// let day = this.refs.day.value
// let month = this.refs.month.value
// let year = this.refs.year.value
// var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
// var total_days = 0;

// // Adjust for leap years
// if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
//     monthLength[1] = 29;

// let errors = []

// console.log('total_days = ' + total_days);

// if (!((year.length == 4) && (year > 1900 && year < 2016))) {
//     errors.push("year");
// }

// if (!(month > 0 && month < 13)) {
//     errors.push("month");
//     total_days = monthLength[0];
// }
// else {
//     total_days = monthLength[month - 1];
// }

// if (!(day > 0 && day <= total_days)) {
//     errors.push("day");
// }
