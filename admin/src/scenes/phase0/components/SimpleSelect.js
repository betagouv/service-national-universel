import React, { useEffect, useRef, useState } from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";

export default function SimpleSelect({ value, transformer, options, onChange, filterOnType }) {
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
    console.log("value change: ", value);
    setFilter(transformer ? transformer(value) : value);
  }, [value]);

  useEffect(() => {
    if (filterOnType) {
      if (filter.trim().length > 0) {
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

  function changeFilter(e) {
    console.log("new filter = ", e.target.value);
    setFilter(e.target.value);
  }

  return (
    <div ref={selectOptionsRef}>
      <div className="flex items-center justify-between cursor-pointer p-[5px] bg-gray-50" onClick={toggleSelectOptions}>
        {filterOnType ? (
          <input
            type="text"
            className="font-normal text-[14px] leading-[20px] text-[#1F2937] w-[100%] bg-[transparent]"
            value={filter}
            onChange={changeFilter}
            onFocus={() => setInputHasFocus(true)}
            onBlur={() => setInputHasFocus(false)}
          />
        ) : (
          <div className="font-normal text-[14px] leading-[20px] text-[#1F2937]">{transformer ? transformer(value) : value}</div>
        )}
        <ChevronDown className="text-[#1F2937] ml-[8px]" />
      </div>
      {selectOptionsOpened && (
        <div className="absolute z-10 mt-[-1] left-[0px] right-[0px] border-[#E5E7EB] border-[1px] rounded-[6px] bg-white text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] max-h-[400px] overflow-auto">
          {filteredOptions.map((opt) => (
            <div className="px-[10px] py-[5px] hover:bg-[#E5E7EB] cursor-pointer" key={opt.value} onClick={() => selectOption(opt.value)}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
