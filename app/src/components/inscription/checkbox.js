import React from "react";
import Check from "../../assets/icons/Check";

export default function CheckBox({ checked, onChange }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center border-[1px] rounded-lg h-6 w-6 cursor-pointer hover:scale-105 ${checked ? "bg-[#000091]" : "bg-inherit"}`}
      onClick={() => {
        if (checked) onChange(false);
        else onChange(true);
      }}>
      {checked ? <Check className="text-white" /> : null}
    </div>
  );
}
