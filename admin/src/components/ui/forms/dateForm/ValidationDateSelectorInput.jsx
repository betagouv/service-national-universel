import React from "react";
// import { useState, useEffect } from "react";
// import { addDays, formatISO } from "date-fns";
// import dayjs from "dayjs";

// export default function ValidationDateSelector({ data, value, onChange }) {
//   const [selectedDuration, setSelectedDuration] = useState(0);
//   const [newValidationDate, setNewValidationDate] = useState("");
// //   useEffect(() => {
// //     setNewValidationDate(value);
// //   }, [value]);

//   useEffect(() => {
//     handleDurationSelect(selectedDuration);
//   }, [data.dateStart]);

//   const handleDurationSelect = (duration) => {
//     setSelectedDuration(duration);

//     // Calculate the new validation date based on the selected duration
    // const startDate = new Date(data.dateStart);
    // const newDate = addDays(startDate, duration);
    // const formattedValidationDate = formatISO(newDate);
    // setNewValidationDate(formattedValidationDate);

//     onChange(formattedValidationDate);
//   };

//   return (
//     <div className="flex flex-col">
//       <select onChange={(e) => handleDurationSelect(parseInt(e.target.value))}>
//         <option defaultValue value="0">
//           choisir un nombre de jour pour validation
//         </option>
//         <option value={8}>8 days</option>
//         <option value={10}>10 days</option>
//         <option value={12}>12 days</option>
//       </select>
//       {/* {newValidationDate && <p>Selected duration: {selectedDuration} days</p>} */}
//       {/* {validationDate && <p>Validation date: {validationDate}</p>} */}
//       <input
//         type="text"
//         value={dayjs(newValidationDate).format("DD/MM/YYYY")}
//         // value={validationDate}
//         // onChange={() => setData({ ...data, validationDate: validationDateNoTerm })}
//         onChange={onChange}
//       />
//     </div>
//   );
// }

export default function ValidationDateSelector({ days, label, onChange }) {
  const handleInputChange = (event) => {
    event.persist(); // Persist the synthetic event
    onChange(event.target.value); // Access the event properties here
  };

  return (
    //   <div className="flex flex-col">
    // <input
    //   type="number"
    //   defaultValue={days || "préciser un nombre de jours"}
    //   onChange={handleInputChange}
    //   placeholder="Enter duration in days"
    // />
    //   </div>
    <div
      className={`flex min-h-[54px] w-full flex-col justify-center rounded-lg border-[1px] bg-white py-2 px-2.5 border-gray-300`}>
      {label && <p className={`text-xs leading-4 text-gray-500"`}>{label}</p>}
      <div className="flex items-center gap-2">
        <input type="number" defaultValue={days || "préciser un nombre de jours"} onChange={handleInputChange} placeholder="Enter duration in days" />
      </div>
    </div>
  );
}
