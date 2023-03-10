import React from "react";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import StatusPill from "./StatusPill";

export default function MenuGroup({ children, icon, text, enabled = true, status }) {
  const [open, setOpen] = React.useState(false);

  if (enabled) {
    return (
      <>
        <button
          onClick={() => setOpen(!open)}
          className="my-[2px] px-2 py-3 w-full space-y-2 rounded-md text-[#D1DAEF] hover:bg-[#1B243D] hover:text-[#D1DAEF] transition-colors duration-200">
          <div className="flex items-center">
            <div className="w-5 mr-3 text-[#7A90C3]">{icon}</div>
            <p className="text-left">{text}</p>
            <div className={`ml-auto mr-2 transition-all duration-200 ${open && "rotate-180"}`}>
              <ChevronDown />
            </div>
          </div>
          <div className="ml-8">{status && <StatusPill status={status} />}</div>
        </button>
        {children && <div className={`ml-8 overflow-hidden transition-all ease-in-out duration-200 ${open ? "h-44" : "h-0"}`}>{children}</div>}
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
