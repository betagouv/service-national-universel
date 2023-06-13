import React from "react";

export default function MenuButton({ onClick, icon, text }) {
  return (
    <li className="flex items-center">
      <button
        onClick={onClick}
        className="my-[2px] flex w-full items-center gap-4 rounded-md px-2 py-3 text-[#D1DAEF] transition-colors duration-200 hover:bg-[#1B243D] hover:text-[#D1DAEF]">
        {icon && <div className="text-[#7A90C3]">{icon}</div>}
        {text && <span>{text}</span>}
      </button>
    </li>
  );
}
