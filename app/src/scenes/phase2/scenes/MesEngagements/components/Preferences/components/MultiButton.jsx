import React from "react";

export default function MultiButton({ onClick = () => {}, children, className = "", active = false }) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border-[1px] bg-[#FFFFFF] px-3 py-px  ${
        active ? "border-blue-600 text-blue-600" : "border-[#CECECE] text-gray-700"
      } hover:border-blue-600 hover:text-blue-600 ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
}
