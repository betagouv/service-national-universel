import React, { useEffect, useRef, useState } from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";

interface Option {
  value: string;
  label: string;
}

interface SimpleSelectProps {
  value?: string;
  transformer?: (value: string) => string;
  options: Option[];
  onChange?: (value: string) => void;
}

const SimpleSelect: React.FC<SimpleSelectProps> = ({ value, transformer, options, onChange }) => {
  const [selectOptionsOpened, setSelectOptionsOpened] = useState(false);
  const selectOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (selectOptionsRef.current && !selectOptionsRef.current.contains(e.target as Node)) {
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

  function selectOption(opt: string) {
    setSelectOptionsOpened(false);
    onChange && onChange(opt);
  }

  return (
    <div ref={selectOptionsRef}>
      <div className={`flex cursor-pointer items-center justify-between`} onClick={toggleSelectOptions}>
        <div className={`text-[14px] font-normal leading-[20px] text-[#1F2937] ${value ? "" : "py-[10px]"}`}>{transformer && value ? transformer(value) : value}</div>
        <ChevronDown className="w-4 text-gray-500" />
      </div>
      {selectOptionsOpened && (
        <div className="absolute left-[0px] right-[0px] z-10 mt-[10px] max-h-[400px] overflow-auto rounded-[6px] border-[1px] border-[#E5E7EB] bg-white text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
          {options.map((opt) => (
            <div className="cursor-pointer px-[10px] py-[5px] hover:bg-[#E5E7EB]" key={opt.value} onClick={() => selectOption(opt.value)}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleSelect;
