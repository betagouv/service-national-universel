import React, { useEffect } from "react";
import { BsCheck2 } from "react-icons/bs";
import ChevronDown from "../assets/icons/ChevronDown";

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
      onChange({
        isOpen: true,
        value: newValue.value,
      });
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
          className="flex justify-between items-center gap-3 bg-white px-3 py-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-wait border-[1px] border-gray-200 text-black  min-w-1/4"
          style={{ fontFamily: "Marianne" }}
          onClick={() => setOpen((e) => !e)}>
          <div className="flex items-center gap-2">
            {Icon ? Icon : null}
            <span className="text-gray-700 font-medium text-sm whitespace-nowrap ">{selected ? selected : value ? placeholder : "Non renseigné"}</span>
          </div>
          <ChevronDown className="text-gray-400" />
        </button>

        {/* display options */}
        <div
          className={`${open ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute ${
            alignItems === "right" ? "right-0" : "left-0"
          } border-3 shadow overflow-hidden z-50`}>
          <div className="disabled px-3 p-2 text-gray-300">Présence à l&apos;arrivée</div>
          {options.map((option, index) => (
            <div
              key={option?.key || index}
              onClick={() => handleChangeValue(option)}
              className={`${option.value === value && "font-bold bg-gray"} group flex justify-between items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer ${
                option.disabled && "hidden"
              }`}>
              {option.label}
              {option.value === value ? <BsCheck2 /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
