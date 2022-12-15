import React, { useState, useEffect, useRef } from "react";
import DatePickerList from "../../phase0/components/DatePickerList";
import ChevronDown from "../../../assets/icons/ChevronDown";

export default function Field({
  name,
  label,
  value,
  className = "",
  type = "text",
  options = [],
  handleChange,
  transformer,
  readOnly = false,
  errors = {},
  row,
  multiple = false,
}) {
  console.log(errors[name]);
  return (
    <div className={className}>
      <div className={`relative bg-white px-3 border-[1px] w-full rounded-md py-2 ${errors[name] ? "border-red-500" : "border-[#D1D5DB]"}`} key={name}>
        {label && <div className="font-normal text-xs leading-4 text-[#6B7280]">{label}</div>}
        {type === "date" && <DatePickerList disabled={readOnly} fromEdition={false} value={value ? new Date(value) : null} onChange={(date) => handleChange(new Date(date))} />}
        {(type === "select-input" || type === "select") && (
          <SimpleSelect
            multiple={multiple}
            readOnly={readOnly}
            type={type}
            value={value}
            name={name}
            showBackgroundColor={false}
            transformer={transformer}
            options={options}
            onChange={handleChange}
          />
        )}
        {type === "text" && <input readOnly={readOnly && "readonly"} type="text" name={name} value={value} onChange={handleChange} className={"w-full"} />}

        {type === "textarea" && (
          <textarea rows={row} readOnly={readOnly && "readonly"} type="text" name={name} value={value} onChange={handleChange} className={"w-full text-start " + className} />
        )}
        {errors[name] && <div className="text-red-500 mt-2">{errors[name]}</div>}
      </div>
    </div>
  );
}

function SimpleSelect({ value, transformer, options, onChange, showBackgroundColor = true, multiple, readOnly }) {
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
    if (readOnly) return;
    setSelectOptionsOpened((opened) => !opened);
  }
  function selectOption(opt) {
    setSelectOptionsOpened(false);
    onChange && onChange(opt);
  }
  return (
    <div ref={selectOptionsRef}>
      <div className={`flex min-h-[30px] items-center justify-between cursor-pointer ${showBackgroundColor && "bg-gray-50"}`} onClick={toggleSelectOptions}>
        {multiple ? (
          <>
            <div className="flex flex-row flex-wrap gap-2">
              {value.map((val) => (
                <div className="flex flex-row items-center justify-center mt-1 rounded bg-gray-300" key={val}>
                  <div className="pt-0.5 p-1">{transformer ? transformer(val) : val}</div>
                  {!readOnly && (
                    <div
                      className="h-full flex items-center justify-center pt-0.5 px-1 hover:bg-red-200 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(value.filter((v) => v !== val));
                      }}>
                      <div>X</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>{transformer ? transformer(value) : value}</div>
        )}
        {!readOnly && <ChevronDown className="text-gray-500 ml-[8px]" />}
      </div>
      {selectOptionsOpened && (
        <div className="absolute z-10 mt-[-1] left-[0px] right-[0px] border-[#E5E7EB] border-[1px] rounded-[6px] bg-white text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] max-h-[400px] overflow-auto">
          {options.length === 0 ? (
            <div className="p-1 text-center">Chargement...</div>
          ) : (
            <>
              {options.map((opt) => (
                <div
                  className="px-[10px] py-[5px] hover:bg-[#E5E7EB] cursor-pointer"
                  key={opt.value}
                  onClick={() => {
                    if (!multiple) return selectOption(opt.value);
                    const newValue = value;
                    if (!newValue.includes(opt.value)) newValue.push(opt.value);
                    onChange(newValue);
                  }}>
                  {opt.label}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
