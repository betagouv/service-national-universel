import React from "react";
import { NavLink } from "react-router-dom";
import LogoDiagoriente from "../assets/logoDiagoriente.svg";

export default function Diagoriente() {
  return (
    <NavLink to="diagoriente">
      <div className="m-3 flex flex-col items-center justify-center gap-1 rounded-xl border-[1px] border-[#4E6295] py-3 text-xs text-[#7C95D2] transition-colors duration-200 hover:border-[#1B243D] hover:bg-[#1B243D] hover:text-[#7C95D2]">
        <img src={LogoDiagoriente} alt="logo diagoriente" />
        <span>Outil d&apos;aide à l&apos;orientation</span>
      </div>
    </NavLink>
  );
}
