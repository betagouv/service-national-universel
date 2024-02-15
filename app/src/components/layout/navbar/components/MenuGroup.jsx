import React from "react";
import { NavLink } from "react-router-dom";
import StatusPill from "./StatusPill";

export const MenuGroup = ({ children, to, onClose, icon, text, enabled = true, status }) => (
  <>
    {!enabled && (
      <div className="my-[1px] flex w-full cursor-default items-center gap-4 rounded-md px-2 py-3 text-[#526187]">
        {icon}
        <span>{text}</span>
      </div>
    )}
    {enabled && (
      <div className="my-[2px] w-full rounded-md px-2 py-3 text-[#D1DAEF] transition-colors duration-200 hover:bg-[#1B243D] hover:text-[#D1DAEF]">
        <div className="flex w-full items-center justify-between">
          <NavLink onClick={onClose} to={to} className="flex items-center hover:text-[#D1DAEF]">
            <div className="mr-3 w-5 text-[#7A90C3]">{icon}</div>
            <p className="text-left">{text}</p>
          </NavLink>
        </div>
        {status && (
          <div className="ml-8">
            <StatusPill status={status} />
          </div>
        )}
      </div>
    )}
    {children && (
      <div className="border-l-2 border-[#7A90C3]  border-opacity-50 mt-2 mb-3 ml-3 pl-4">
        {React.Children.map(children, (child) => {
          return React.cloneElement(child, {
            enabled,
          });
        })}
      </div>
    )}
  </>
);

export default MenuGroup;
