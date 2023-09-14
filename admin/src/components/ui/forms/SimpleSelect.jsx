import React, { useEffect, useRef, useState } from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";

export default function SimpleSelect({ value, transformer, options, onChange, filterOnType, showBackgroundColor = true, allowCustomValue = false }) {
  const [selectOptionsOpened, setSelectOptionsOpened] = useState(false);
  const [filter, setFilter] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [inputHasFocus, setInputHasFocus] = useState(false);

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

  useEffect(() => {
    setFilter(transformer ? transformer(value) : value);
  }, [value]);

  useEffect(() => {
    if (filterOnType) {
      if (filter?.trim().length > 0) {
        const filterLow = filter.toLowerCase();
        setFilteredOptions(
          options.filter((opt) => {
            return opt.label.toLowerCase().startsWith(filterLow);
          }),
        );
      } else {
        setFilteredOptions(options);
      }
    } else {
      setFilteredOptions(options);
    }
  }, [options, filterOnType, filter]);

  function toggleSelectOptions() {
    if (selectOptionsOpened) {
      setSelectOptionsOpened(filterOnType ? inputHasFocus : false);
    } else {
      setSelectOptionsOpened(true);
    }
  }

  function selectOption(opt) {
    setSelectOptionsOpened(false);
    onChange && onChange(opt);
  }

  return (
    <div ref={selectOptionsRef}>
      <div className={`flex cursor-pointer items-center justify-between p-[5px] ${showBackgroundColor && "bg-gray-50"}`} onClick={toggleSelectOptions}>
        {filterOnType ? (
          <input
            type="text"
            className="w-[100%] bg-[transparent] text-[14px] font-normal leading-[20px] text-[#1F2937]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onFocus={() => setInputHasFocus(true)}
            onBlur={() => setInputHasFocus(false)}
          />
        ) : (
          <>
            {value ? (
              <div className="text-[14px] font-normal leading-[20px] text-[#1F2937]">{transformer ? transformer(value) : value}</div>
            ) : (
              <div className="py-[10px] text-[14px] font-normal leading-[20px] text-[#1F2937]">{transformer ? transformer(value) : value}</div>
            )}
          </>
        )}
        <ChevronDown className="ml-[8px] text-[#1F2937]" />
      </div>
      {selectOptionsOpened && (
        <div className="absolute left-[0px] right-[0px] z-10 mt-[-1] max-h-[400px] overflow-auto rounded-[6px] border-[1px] border-[#E5E7EB] bg-white text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
          {filteredOptions.map((opt) => (
            <div className="cursor-pointer px-[10px] py-[5px] hover:bg-[#E5E7EB]" key={opt.value} onClick={() => selectOption(opt.value)}>
              {opt.label}
            </div>
          ))}
          {allowCustomValue && filter?.length && !filteredOptions?.length ? (
            <button onClick={() => selectOption(filter)} className="w-full p-2 text-left">
              Ajoutez manuellement: &quot;{filter}&quot;
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
