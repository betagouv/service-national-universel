import React, { useEffect, useRef, useState } from "react";
import ChevronDown from "@/assets/icons/ChevronDown";

export default function SimpleSelect({ value, title, transformer, options, onChange, placeholder = "Choisissez une valeur", className = "" }) {
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
    if (selectOptionsOpened) {
      setSelectOptionsOpened(false);
    } else {
      setSelectOptionsOpened(true);
    }
  }

  function selectOption(opt) {
    setSelectOptionsOpened(false);
    onChange && onChange(opt);
  }

  return (
    <div ref={selectOptionsRef} className={`relative ${className}`}>
      <div className={`relative flex cursor-pointer items-center justify-between rounded-md border p-2`} onClick={toggleSelectOptions}>
        <div className="grow">
          {title && <div className="text-sm text-gray-500">{title}</div>}
          {value ? (
            <div className="text-sm text-gray-800">{transformer ? transformer(value) : value}</div>
          ) : (
            <div className="text-sm leading-[20px] text-gray-300">{placeholder}</div>
          )}
        </div>
        <ChevronDown className="ml-[8px] shrink-0 text-[#1F2937]" />
      </div>
      {selectOptionsOpened && (
        <div className="absolute left-[0px] right-[0px] z-10 mt-[-1] max-h-[400px] overflow-auto rounded-[6px] border-[1px] border-[#E5E7EB] bg-white text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
          {options.map((opt) => (
            <div className="cursor-pointer px-[10px] py-[5px] hover:bg-[#E5E7EB]" key={opt.value} onClick={() => selectOption(opt.value)}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
