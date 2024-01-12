import React, { useState, useEffect } from "react";
import ChevronDown from "../../../../assets/icons/ChevronDown";

export default function SelectInput({ options, onChange, disabled, placeholder, renderOption, value }) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const ref = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const handleChangeValue = (newValue) => {
    onChange(newValue.value);
    setSearchValue("");
    setOpen(false);
  };

  return (
    <div className="w-full" ref={ref}>
      <div className="relative w-full">
        <div
          className={`flex h-8 w-full items-center justify-between  rounded-lg border border-gray-300 bg-white px-3 py-3`}
          onClick={(event) => {
            event.stopPropagation();
            !disabled && setOpen((e) => !e);
          }}>
          {value ? <div>{value || placeholder}</div> : <div className="text-gray-400 text-xs">{placeholder}</div>}
          {!disabled && <ChevronDown className={`text-gray-400 ${open ? "rotate-180" : ""}`} />}
        </div>
        <div
          className={`${open ? "block" : "hidden"} w-full absolute min-w-[100px] max-h-[200px] rounded-lg bg-white transition 
            "left-0" border-3 z-50 overflow-scroll border-red-600 shadow`}>
          <input
            disabled={disabled}
            className={`p-2 px-3 w-full text-snu-purple-800 ${disabled ? "cursor-not-allowed disabled:opacity-50" : "cursor-text"}`}
            type="text"
            name="line"
            value={searchValue}
            placeholder="Rechercher une ligne"
            onChange={(e) => {
              if (disabled) return;
              setOpen(true);
              setSearchValue(e.target.value);
            }}
          />
          {options
            .filter((e) => e.label.toLowerCase().includes(searchValue?.toLowerCase()))
            .map((option, index) => (
              <div
                key={option?.key || index}
                onClick={(event) => {
                  event.stopPropagation();
                  handleChangeValue(option);
                }}
                className={`${option.value === searchValue && "bg-gray font-bold w-full"}`}>
                {renderOption(option)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
