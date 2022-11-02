import React, { useEffect, useRef, useState } from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";

export default function SimpleSelect({ value, transformer, options, onChange }) {
  const [selectOptionsOpened, setSelectOptionsOpened] = useState(false);
  const selectOptionsRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (selectOptionsRef.current) {
        let target = e.target;
        while (target) {
          if (target === selectOptionsRef.current) {
            return;
          }
          target = target.parentNode;
        }
        setSelectOptionsOpened(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleSelectOptions() {
    setSelectOptionsOpened(!selectOptionsOpened);
  }

  function selectOption(opt) {
    setSelectOptionsOpened(false);
    onChange && onChange(opt);
  }

  return (
    <div ref={selectOptionsRef}>
      <div className="flex items-center justify-between cursor-pointer p-[5px] bg-gray-50" onClick={toggleSelectOptions}>
        <div className="font-normal text-[14px] leading-[20px] text-[#1F2937]">{transformer ? transformer(value) : value}</div>
        <ChevronDown className="text-[#1F2937] ml-[8px]" />
      </div>
      {selectOptionsOpened && (
        <div className="absolute z-10 mt-[-1] left-[0px] right-[0px] border-[#E5E7EB] border-[1px] rounded-[6px] bg-white text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
          {options.map((opt) => (
            <div className="px-[10px] py-[5px] hover:bg-[#E5E7EB] cursor-pointer" key={opt.value} onClick={() => selectOption(opt.value)}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
