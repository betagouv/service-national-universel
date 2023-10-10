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

import React from "react";
export default function DatePickerList({ value, onChange, disabled = false }) {
  const [day, setDay] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [year, setYear] = React.useState("");

  const handleDayChange = (e) => setDay(e.target.value);
  const handleMonthChange = (e) => setMonth(e.target.value);
  const handleYearChange = (e) => setYear(e.target.value);

  // Écoutez les changements dans les champs de saisie individuels et passez une Date en retour via onChange
  React.useEffect(() => {
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const newDate = new Date(year, month - 1, day);
      if (!isNaN(newDate)) {
        onChange(newDate);
      }
    }
  }, [day, month, year, onChange]);

  return (
    <div className="mt-2 flex w-full items-center justify-between gap-3 rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
      <input type="text" value={day} onChange={handleDayChange} placeholder="JJ" maxLength="2" disabled={disabled} className="w-1/3 bg-[#EEEEEE]" />
      <input type="text" value={month} onChange={handleMonthChange} placeholder="MM" maxLength="2" disabled={disabled} className="w-1/3 bg-[#EEEEEE]" />
      <input type="text" value={year} onChange={handleYearChange} placeholder="AAAA" maxLength="4" disabled={disabled} className="w-1/3 bg-[#EEEEEE]" />
    </div>
  );
}
