import React from "react";

const handleInputChange = (e) => {
  let value = Number(e.target.value);
  value = Math.round(value); // Arrondir à l'entier le plus proche
  e.target.value = value; // Mettre à jour la valeur de l'input
};

export default function InputNumber({ register, name, label, disabled = false, error = "", readOnly = false, placeholder = "", validation = {} }) {
  return (
    <div
      className={`flex min-h-[54px] w-full flex-col justify-center rounded-lg border-[1px] bg-white py-2 px-2.5 ${disabled ? "border-gray-200" : "border-gray-300"} ${
        error ? "border-red-500" : ""
      }`}>
      {label && (
        <label htmlFor={name} className={`text-xs leading-4 ${disabled ? "text-gray-400" : "text-gray-500"} `}>
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          id={name}
          className={`w-full bg-white text-sm ${disabled ? "text-gray-400" : "text-gray-900"} placeholder:text-gray-500`}
          {...register(name, validation)}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          type="number"
          step="1"
          min="1"
          onChange={handleInputChange}
        />
      </div>
      {error && <div className="text-[#EF4444]">{error}</div>}
    </div>
  );
}
