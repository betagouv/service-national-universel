import React from "react";
import { NavLink } from "react-router-dom";
import StatusPill from "./StatusPill";

export default function MenuItem({ to, enabled = true, icon, text, status, onClose, ticketCount }) {
  const isActive = location.pathname.includes(to) && (to !== "/" || location.pathname === "/");

  if (enabled) {
    return (
      <li className="flex items-center">
        <NavLink
          onClick={onClose}
          to={to}
          exact
          className="my-[2px] flex w-full items-center gap-3 rounded-md px-2 py-3 text-[#D1DAEF] transition-colors duration-200 hover:bg-[#1B243D] hover:text-[#D1DAEF]"
          activeClassName="bg-[#344264] text-[#67A4FF] hover:bg-[#344264] hover:text-[#67A4FF]">
          {icon && <div className={`w-5 ${isActive ? "text-[#67A4FF]" : "text-[#7A90C3]"}`}>{icon}</div>}
          <div className="flex flex-row w-full justify-between">
            {text && <span>{text}</span>}
            {ticketCount > 0 && <span className="text-sm leading-5 text-white bg-blue-600 px-2 py-0.5 rounded-full font-medium mr-4">{ticketCount}</span>}
          </div>
          {status && <StatusPill status={status} />}
        </NavLink>
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
