import React from "react";
import { NavLink } from "react-router-dom";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import StatusPill from "./StatusPill";

export default function MenuGroup({ children, to, onClose, icon, text, enabled = true, status }) {
  const [open, setOpen] = React.useState(false);

  if (enabled) {
    return (
      <>
        <div className="my-[2px] px-2 py-2 w-full rounded-md text-[#D1DAEF] hover:bg-[#1B243D] hover:text-[#D1DAEF] transition-colors duration-200">
          <div className="flex items-center justify-between w-full">
            <NavLink onClick={onClose} to={to} className="flex items-center hover:text-[#D1DAEF]">
              <div className="w-5 mr-3 text-[#7A90C3]">{icon}</div>
              <p className="text-left">{text}</p>
            </NavLink>
            <button
              onClick={() => setOpen(!open)}
              className={`flex rounded-full hover:bg-[#344264] text-[#768BAC] w-9 h-9 text-center items-center justify-center transition-all duration-200 overfloz-visible ${
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
        {children && <div className={`ml-8 overflow-hidden transition-all ease-in-out duration-200 ${open ? `h-${children.length * 16}` : "h-0"}`}>{children}</div>}
      </>
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
