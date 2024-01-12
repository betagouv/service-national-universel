import React from "react";
import { HiExternalLink } from "react-icons/hi";

export default function MenuItemExternal({ href, icon, text, onClose }) {
  return (
    <li className="flex items-center">
      <a
        onClick={onClose}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="my-[2px] flex w-full items-center gap-3 rounded-md px-2 py-3 text-[#D1DAEF] transition-colors duration-200 hover:bg-[#1B243D] hover:text-[#D1DAEF]">
        {icon && <div className="w-5 text-[#7A90C3]">{icon}</div>}
        {text && <span>{text}</span>}
        <HiExternalLink className="text-[#526187] ml-auto text-lg" />
      </a>
    </li>
  );
}
