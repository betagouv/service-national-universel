import React, { useState, useEffect, useRef } from "react";
import DatePickerList from "../../phase0/components/DatePickerList";
import ChevronDown from "../../../assets/icons/ChevronDown";

export default function Field({ name, label, value, className = "", type = "text", options = [], handleChange, setFielValue, transformer, readOnly = false, errors = {} }) {
  return (
    <div className={className}>
      <div className={`relative bg-white px-3 border-[#D1D5DB] border rounded-md py-2 ${errors[name] ? "border-red-500" : "border-[#D1D5DB]"}`} key={name}>
        {label && <div className="font-normal text-xs leading-4 text-[#6B7280]">{label}</div>}
        {type === "date" && <DatePickerList fromEdition={false} value={value ? new Date(value) : null} onChange={(date) => setFielValue(name, new Date(date))} />}
        {type === "select" && (
          <SimpleSelect value={value} name={name} showBackgroundColor={false} transformer={transformer} options={options} onChange={(value) => handleChange(name, value)} />
        )}
        {type === "text" && <input readOnly={readOnly && "readonly"} type="text" name={name} value={value} onChange={handleChange} className="block  w-[100%]" />}
        {errors[name] && <div className="text-red-500 mt-2">{errors[name]}</div>}
      </div>
    </div>
  );
}

function SimpleSelect({ value, transformer, options, onChange, showBackgroundColor = true }) {
  const [selectOptionsOpened, setSelectOptionsOpened] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);

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
    setFilteredOptions(options);
  }, [options]);

  function toggleSelectOptions() {
    setSelectOptionsOpened((opened) => !opened);
  }

  function selectOption(opt) {
    setSelectOptionsOpened(false);
    onChange && onChange(opt);
  }

  return (
    <div ref={selectOptionsRef}>
      <div className={`flex items-center justify-between cursor-pointer ${showBackgroundColor && "bg-gray-50"}`} onClick={toggleSelectOptions}>
        <div>{transformer ? transformer(value) : value}</div>
        <ChevronDown className="text-gray-500 ml-[8px]" />
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
