import React from "react";
import LogoSNU from "../assets/logoSNU.svg";

export default function Header() {
  return (
    <div className="hidden w-full md:flex p-4 border-b-[1px] border-[#2A3655] text-[11px] font-medium leading-[14px] items-center cursor-default">
      <img src={LogoSNU} alt="logo" className="w-26 h-12" />
      <div className="mx-3">
        <p>SERVICE</p>
        <p>NATIONAL</p>
        <p>UNIVERSEL</p>
      </div>
    </div>
  );
}
