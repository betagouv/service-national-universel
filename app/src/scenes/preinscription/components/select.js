import React, { useEffect } from "react";
import { BsCheck2 } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import ChevronDown from "../../../assets/icons/ChevronDown";

export default function Select({ options, value, placeholder, Icon = null, alignItems = "left", onChange }) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState("");
  const ref = React.useRef(null);

  React.useEffect(() => {
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
    if (value && newValue.value === value) {
      onChange("");
      setSelected("");
    } else {
      onChange(newValue.value);
      setSelected(newValue.label);
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!value) setSelected("");
  }, [value]);

  return (
    <div style={{ fontFamily: "Marianne" }} ref={ref}>
      <div className="relative">
        {/* select item */}
        <button
          className="flex justify-between items-center gap-3 w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]"
          style={{ fontFamily: "Marianne" }}
          onClick={() => setOpen((e) => !e)}>
          <div className="flex items-center gap-2">
            {Icon ? Icon : null}
            <span className="text-[#161616] text-base whitespace-nowrap ">{selected ? selected : placeholder}</span>
          </div>
          {value ? (
            <IoMdClose
              onClick={(e) => {
                e.stopPropagation();
                handleChangeValue("");
              }}
              className="text-[#161616]"
            />
          ) : (
            <ChevronDown className="text-[#161616]" />
          )}
        </button>

        {/* display options */}
        <div
          className={`${open ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute ${
            alignItems === "right" ? "right-0" : "left-0"
          } border-3 border-red-600 shadow overflow-hidden z-50`}>
          {options.map((option, index) => (
            <div key={option?.key || index} onClick={() => handleChangeValue(option)} className={`${option.value === value && "font-bold bg-gray"}`}>
              <div className="group flex justify-between items-center gap-2 p-2 px-3 text-[#161616] hover:bg-gray-50 cursor-pointer">
                <div>{option.label}</div>
                {option.value === value ? <BsCheck2 className="text-[#161616]" /> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
