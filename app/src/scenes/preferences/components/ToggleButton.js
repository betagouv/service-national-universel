import React from "react";

export default function ToggleButton({ onClick = () => {}, children, className = "", active = false, mode = "toggle" }) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap cursor-pointer ${
        mode === "multi"
          ? `px-3 py-px bg-[#FFFFFF] border-[1px] rounded-full  ${
              active ? "text-blue-600 border-blue-600" : "text-gray-700 border-[#CECECE]"
            } hover:text-blue-600 hover:border-blue-600`
          : `text-sm text-gray-700 border-b-2 pb-1 ${active ? "font-bold border-b-blue-600" : "font-normal border-b-[transparent]"} hover:font-bold hover:border-b-blue-600`
      } ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
}
