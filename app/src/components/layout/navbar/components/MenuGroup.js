import React from "react";
import { NavLink } from "react-router-dom";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import StatusPill from "./StatusPill";

export default function MenuGroup({ children, to, onClose, icon, text, enabled = true, status }) {
  const [open, setOpen] = React.useState(false);

  if (enabled) {
    return (
      <>
        <div className="my-[2px] w-full rounded-md px-2 py-2 text-[#D1DAEF] transition-colors duration-200 hover:bg-[#1B243D] hover:text-[#D1DAEF]">
          <div className="flex w-full items-center justify-between">
            <NavLink onClick={onClose} to={to} className="flex items-center hover:text-[#D1DAEF]">
              <div className="mr-3 w-5 text-[#7A90C3]">{icon}</div>
              <p className="text-left">{text}</p>
            </NavLink>
            <button
              onClick={() => setOpen(!open)}
              className={`overfloz-visible flex h-9 w-9 items-center justify-center rounded-full text-center text-[#768BAC] transition-all duration-200 hover:bg-[#344264] ${
                open && "rotate-180"
              }`}>
              <ChevronDown />
            </button>
          </div>
          {status && (
            <div className="ml-8">
              <StatusPill status={status} />
            </div>
          )}
        </div>
        {children && <div className={`ml-8 overflow-hidden transition-all duration-200 ease-in-out ${open ? `h-${children.length * 16}` : "h-0"}`}>{children}</div>}
      </>
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
