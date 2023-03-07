import React from "react";
import { NavLink } from "react-router-dom";
import StatusPill from "./StatusPill";

export default function MenuItem({ to, enabled = true, icon, text, status, setOpen }) {
  const isActive = location.pathname.includes(to);

  if (enabled) {
    return (
      <li className="flex items-center">
        <NavLink
          onClick={() => setOpen(false)}
          to={to}
          exact
          className="my-[2px] px-2 py-3 w-full rounded-md flex gap-4 text-[#D1DAEF] hover:bg-[#1B243D] hover:text-[#D1DAEF] items-center transition-colors duration-200"
          activeClassName="bg-[#344264] text-[#67A4FF] hover:bg-[#344264] hover:text-[#67A4FF]">
          {icon && <div className={`w-5 ${isActive ? "text-[#67A4FF]" : "text-[#7A90C3]"}`}>{icon}</div>}
          {text && <span>{text}</span>}
          {status && <StatusPill status={status} />}
        </NavLink>
      </li>
    );
  }

  return (
    <li className="flex items-center">
      <div className="my-[1px] px-2 py-3 w-full rounded-md flex gap-4 text-[#526187] cursor-default items-center">
        {icon}
        <span>{text}</span>
      </div>
    </li>
  );
}
