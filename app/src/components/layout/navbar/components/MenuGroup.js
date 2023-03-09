import React from "react";
import StatusPill from "./StatusPill";

export default function MenuGroup({ children, icon, text, enabled = true, status }) {
  const to = children.map((c) => c.props.to);
  const isActive = to.some((t) => location.pathname.includes(t));
  const [open, setOpen] = React.useState(false);

  if (enabled) {
    return (
      <li className="border">
        <button
          onClick={() => setOpen(!open)}
          className={`border my-[2px] px-2 py-3 w-full rounded-md flex text-[#D1DAEF] hover:bg-[#1B243D] hover:text-[#D1DAEF] items-center transition-colors duration-200 ${
            isActive && "bg-[#344264] text-[#67A4FF] hover:bg-[#344264] hover:text-[#67A4FF]"
          }`}>
          {icon && <div className={`w-5 mr-3 ${isActive ? "text-[#67A4FF]" : "text-[#7A90C3]"}`}>{icon}</div>}
          {text && <span>{text}</span>}
          {status && <StatusPill status={status} />}
        </button>
        {children && open && <ul>{children}</ul>}
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
