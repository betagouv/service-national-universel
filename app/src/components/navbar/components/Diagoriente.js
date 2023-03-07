import React from "react";
import { NavLink } from "react-router-dom";
import LogoDiagoriente from "../assets/logoDiagoriente.svg";

export default function Diagoriente() {
  return (
    <NavLink to="diagoriente">
      <div className="my-6 md:my-24 flex flex-col items-center justify-center border-[1px] border-[#4E6295] rounded-xl text-xs text-[#7C95D2] py-3 gap-1 hover:bg-[#1B243D] hover:border-[#1B243D] hover:text-[#7C95D2] transition-colors duration-200">
        <img src={LogoDiagoriente} alt="logo diagoriente" />
        <span>Outil d&apos;aide à l&apos;orientation</span>
      </div>
    </NavLink>
  );
}
