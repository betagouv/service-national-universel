import React from "react";

export default function MenuButton({ onClick, icon, text }) {
  return (
    <li className="flex items-center">
      <button
        onClick={onClick}
        className="my-[2px] px-2 py-3 w-full rounded-md flex gap-4 text-[#D1DAEF] hover:bg-[#1B243D] hover:text-[#D1DAEF] items-center transition-colors duration-200">
        {icon && <div className="text-[#7A90C3]">{icon}</div>}
        {text && <span>{text}</span>}
      </button>
    </li>
  );
}
