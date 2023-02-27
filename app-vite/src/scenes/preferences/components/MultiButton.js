import React from "react";

export default function MultiButton({ onClick = () => {}, children, className = "", active = false }) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap cursor-pointer px-3 py-px bg-[#FFFFFF] border-[1px] rounded-full  ${
        active ? "text-blue-600 border-blue-600" : "text-gray-700 border-[#CECECE]"
      } hover:text-blue-600 hover:border-blue-600 ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
}
