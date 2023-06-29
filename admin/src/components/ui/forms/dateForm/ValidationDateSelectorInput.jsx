import React from "react";

export default function ValidationDateSelector({ days, label, onChange }) {
  const handleInputChange = (event) => {
    event.persist(); // Persist the synthetic event
    onChange(event.target.value); // Access the event properties here
  };

  return (
    <div className={`flex min-h-[54px] w-full flex-col justify-center rounded-lg border-[1px] bg-white py-2 px-2.5 border-gray-300`}>
      {label && <p className={`text-xs leading-4 text-gray-500"`}>{label}</p>}
      <div className="flex items-center gap-2">
        <input type="number" defaultValue={days || "préciser un nombre de jours"} onChange={handleInputChange} placeholder="Enter duration in days" />
      </div>
    </div>
  );
}
