import React from "react";
import LogoSNU from "../../../../assets/logo-snu.svg";

export default function Logo() {
  return (
    <div className="flex h-full text-[11px] font-medium leading-[14px] items-center justify-center md:justify-start md:p-5">
      <img src={LogoSNU} alt="logo" className="w-26 h-12" />
      <div className="hidden md:block mx-3">
        <p>SERVICE</p>
        <p>NATIONAL</p>
        <p>UNIVERSEL</p>
      </div>
    </div>
  );
}
