import React from "react";

export default function ToggleButton({ onClick = () => {}, children, className = "", active = false }) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap border-b-2 pb-1 text-sm text-gray-700 ${
        active ? "border-b-blue-600 font-bold" : "border-b-[transparent] font-normal"
      } hover:border-b-blue-600 hover:font-bold ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
}
