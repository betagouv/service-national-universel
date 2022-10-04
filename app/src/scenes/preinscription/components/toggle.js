import React from "react";
import Check from "../../../assets/icons/Check2";

export default function Toggle({ toggled, onClick }) {
  return toggled ? (
    <div onClick={onClick} name="visibility" className={`flex items-center w-10 h-6 rounded-full bg-[#000091] transition duration-100 ease-in cursor-pointer`}>
      <div className="flex justify-center items-center h-6 w-6 rounded-full border-[1px] border-[#000091] bg-white translate-x-[16px] transition duration-100 ease-in shadow-nina">
        <Check />
      </div>
    </div>
  ) : (
    <div
      onClick={onClick}
      name="visibility"
      className={`flex items-center w-10 h-6 border-[1px] rounded-full border-[#000091] bg-white transition duration-100 ease-in cursor-pointer`}>
      <div className="flex justify-center items-center h-6 w-6 rounded-full border-[1px] border-[#000091] bg-white translate-x-[-1px] transition duration-100 ease-in shadow-nina"></div>
    </div>
  );
}
