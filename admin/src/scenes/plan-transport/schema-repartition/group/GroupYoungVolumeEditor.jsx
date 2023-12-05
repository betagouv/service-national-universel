import React from "react";
import Minus from "../../../../assets/icons/Minus";
import Plus from "../../../../assets/icons/Plus";

export default function GroupYoungVolumeEditor({ value, className = "", onChange, availableVolume }) {
  function decrement() {
    if (parseInt(value) > 1) {
      onChange && onChange(parseInt(value) - 1);
    }
  }

  function increment() {
    onChange && onChange(parseInt(value) + 1);
  }

  const integerRegex = /^\d*$/; // Regex for integer numbers

  function handleInputChange(e) {
    const newValue = e.target.value;
    if (integerRegex.test(newValue)) {
      onChange && onChange(newValue);
    }
  }

  return (
    <div className={`flex items-center justify-between border-y border-y-[#E5E7EB] p-[19px] ${className}`}>
      <div className="grow">
        <div className="mb-[4px] text-[15px] font-bold leading-[18px] text-[#1F2937]">Modifier le nombre de volontaires</div>
        <div className="text-[14px] leading-[17px] text-[#4B5563]">{availableVolume + (availableVolume > 1 ? " volontaires disponibles" : " volontaire disponible")}</div>
      </div>
      <div className="flex">
        <div
          className="flex h-[38px] w-[38px] cursor-pointer select-none items-center justify-center rounded-[8px] bg-[#E5E7EB] text-[#374151] hover:bg-[#374151] hover:text-[#E5E7EB]"
          onClick={decrement}>
          <Minus />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && handleInputChange(e)}
          className="mx-[8px] w-[70px] appearance-none rounded-[8px] border-[1px] border-[#E5E7EB] bg-[#FFFFFF] px-[16px] text-[14px] text-[#19181A]"
        />
        <div
          className="flex h-[38px] w-[38px] cursor-pointer select-none items-center justify-center rounded-[8px] bg-[#E5E7EB] text-[#374151] hover:bg-[#374151] hover:text-[#E5E7EB]"
          onClick={increment}>
          <Plus />
        </div>
      </div>
    </div>
  );
}
