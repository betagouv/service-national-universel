import React from "react";
import { BsCheck2 } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import ErrorMessage from "./ErrorMessage";
import ChevronDown from "../../../assets/icons/ChevronDown";

export default function Select({
  label,
  options,
  value,
  placeholder = "Sélectionner une option",
  Icon = null,
  alignItems = "left",
  onChange,
  error = "",
  correction = "",
  disabled = false,
}) {
  const [open, setOpen] = React.useState(false);
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
    } else {
      onChange(newValue.value);
    }
    setOpen(false);
  };

  if (disabled) {
    return (
      <div className="mt-2 mb-6 text-[#161616]" style={{ fontFamily: "Marianne" }} ref={ref}>
        <label className={`w-full my-2 ${correction || error ? "text-[#CE0500]" : "text-gray-500"}`}>
          {label}
          <select
            value={options.find((option) => option.value === value)?.label || placeholder}
            className="w-full border-b-2 rounded-t px-4 py-2 mt-2 appearance-none bg-[#EEEEEE] text-gray-600"
            disabled>
            {options.map((option, index) => (
              <option key={index}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  return (
    <div className="mt-2 mb-6 text-[#161616]" style={{ fontFamily: "Marianne" }} ref={ref}>
      <label className={`my-2 ${correction || error ? "text-[#CE0500]" : "text-[#161616]}"}`}>{label}</label>
      <div className="relative">
        {/* select item */}
        <button
          className={`flex w-full items-center justify-between gap-3 border-b-[2px] bg-[#EEEEEE] px-4 py-2 ${
            correction || error ? "border-[#CE0500]" : "border-[#3A3A3A]"
          } rounded-t-[4px]`}
          style={{ fontFamily: "Marianne" }}
          onClick={(e) => {
            e.preventDefault();
            setOpen((e) => !e);
          }}>
          <div className="flex items-center gap-2 overflow-hidden">
            {Icon ? Icon : null}
            <span className="truncate whitespace-nowrap text-base ">{options.find((option) => option.value === value)?.label || placeholder}</span>
          </div>
          {value ? (
            <IoMdClose
              onClick={(e) => {
                e.stopPropagation();
                handleChangeValue("");
              }}
            />
          ) : (
            <ChevronDown />
          )}
        </button>

        {/* display options */}
        <div
          className={`${open ? "block" : "hidden"}  absolute min-w-full rounded-lg bg-white transition ${
            alignItems === "right" ? "right-0" : "left-0"
          } border-3 z-50 border-red-600 shadow max-h-[200px] overflow-y-auto`}>
          {options.map((option, index) => (
            <div key={option?.key || index} onClick={() => handleChangeValue(option)} className={`${option.value === value && "bg-gray font-bold"}`}>
              <div className={`group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 hover:bg-gray-50`}>
                <div>{option.label}</div>
                {option.value === value ? <BsCheck2 /> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <ErrorMessage>{correction}</ErrorMessage>
    </div>
  );
}
