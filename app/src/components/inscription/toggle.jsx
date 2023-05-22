import React from "react";
import Check from "../../assets/icons/Check2";

export default function Toggle({ toggled, onClick }) {
  return toggled ? (
    <div onClick={onClick} name="visibility" className={`flex h-6 w-10 cursor-pointer items-center rounded-full bg-[#000091] transition duration-100 ease-in`}>
      <div className="flex h-6 w-6 translate-x-[16px] items-center justify-center rounded-full border-[1px] border-[#000091] bg-white shadow-nina transition duration-100 ease-in">
        <Check />
      </div>
    </div>
  ) : (
    <div
      onClick={onClick}
      name="visibility"
      className={`flex h-6 w-10 cursor-pointer items-center rounded-full border-[1px] border-[#000091] bg-white transition duration-100 ease-in`}>
      <div className="flex h-6 w-6 translate-x-[-1px] items-center justify-center rounded-full border-[1px] border-[#000091] bg-white shadow-nina transition duration-100 ease-in"></div>
    </div>
  );
}
