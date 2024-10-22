import React from "react";

interface NumberInputProps {
  days: number;
  label?: string;
  onChange: (value: number) => void;
}

export default function NumberInput({ days, label, onChange }: NumberInputProps) {
  const handleInputChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className={`flex min-h-[54px] w-full flex-col justify-center rounded-lg border-[1px] bg-white py-2 px-2.5 border-gray-300`}>
      {label && <p className={`text-xs leading-4 text-gray-500"`}>{label}</p>}
      <div className="flex items-center gap-2">
        <input type="number" className="w-full" defaultValue={days} onChange={handleInputChange} placeholder="Préciser un nombre de jours" />
      </div>
    </div>
  );
}
