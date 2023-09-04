import React from "react";
import { HiExternalLink } from "react-icons/hi";

export default function MenuItemExternal({ href, enabled = true, icon, text, status, onClose, ticketCount }) {
  if (enabled) {
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
          {ticketCount > 0 && <span className="text-xs leading-5 text-white bg-blue-600 px-2 py-0 rounded-full font-medium mr-4">{ticketCount}</span>}
          <HiExternalLink className="text-[#526187] ml-auto text-lg" />
        </a>
      </li>
    );
  }

  return (
    <li className="flex items-center">
      <div className="my-[1px] flex w-full cursor-default items-center gap-4 rounded-md px-2 py-3 text-[#526187]">
        {icon}
        <span>{text}</span>
      </div>
    </li>
  );
}
