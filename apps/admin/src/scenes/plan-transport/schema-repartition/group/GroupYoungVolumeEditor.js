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

  return (
    <div className={`border-y-[#E5E7EB] border-y p-[19px] flex items-center justify-between ${className}`}>
      <div className="grow">
        <div className="text-[15px] text-[#1F2937] leading-[18px] font-bold mb-[4px]">Modifier le nombre de volontaires</div>
        <div className="text-[14px] text-[#4B5563] leading-[17px]">{availableVolume + (availableVolume > 1 ? " volontaires disponibles" : " volontaire disponible")}</div>
      </div>
      <div className="flex">
        <div
          className="bg-[#E5E7EB] w-[38px] h-[38px] rounded-[8px] text-[#374151] flex items-center justify-center cursor-pointer select-none hover:bg-[#374151] hover:text-[#E5E7EB]"
          onClick={decrement}>
          <Minus />
        </div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          min={1}
          className="appearance-none bg-[#FFFFFF] border-[#E5E7EB] border-[1px] rounded-[8px] mx-[8px] text-[#19181A] text-[14px] w-[70px] px-[16px]"
        />
        <div
          className="bg-[#E5E7EB] w-[38px] h-[38px] rounded-[8px] text-[#374151] flex items-center justify-center cursor-pointer select-none hover:bg-[#374151] hover:text-[#E5E7EB]"
          onClick={increment}>
          <Plus />
        </div>
      </div>
    </div>
  );
}
