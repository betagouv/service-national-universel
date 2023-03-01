import React from "react";

export default function ToggleButton({ onClick = () => {}, children, className = "", active = false }) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap cursor-pointer text-sm text-gray-700 border-b-2 pb-1 ${
        active ? "font-bold border-b-blue-600" : "font-normal border-b-[transparent]"
      } hover:font-bold hover:border-b-blue-600 ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
}
