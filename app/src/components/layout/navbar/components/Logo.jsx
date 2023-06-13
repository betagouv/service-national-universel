import React from "react";
import LogoSNU from "../../../../assets/logo-snu.png";

export default function Logo() {
  return (
    <div className="flex h-full items-center justify-center text-[11px] font-medium leading-[14px] md:justify-start md:p-5">
      <img src={LogoSNU} alt="logo" className="w-14" />
      <div className="mx-3 hidden md:block">
        <p>SERVICE</p>
        <p>NATIONAL</p>
        <p>UNIVERSEL</p>
      </div>
    </div>
  );
}
