import React from "react";
import { BsCheck2 } from "react-icons/bs";
import ChevronDown from "../../../assets/icons/ChevronDown";

export default function Select({ options, value, Icon = null, alignItems = "left", onChange, disabled }) {
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
    onChange(newValue.value);
    setOpen(false);
  };

  return (
    <div style={{ fontFamily: "Marianne" }} ref={ref}>
      <div className="relative">
        {/* select item */}
        <button
          className="flex min-w-[300px] cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3 py-3 disabled:cursor-wait disabled:opacity-50"
          style={{ fontFamily: "Marianne" }}
          onClick={() => !disabled && setOpen((e) => !e)}>
          <div className="flex items-center gap-2">
            {Icon ? Icon : null}
            <span className="whitespace-nowrap text-sm font-medium text-gray-700 " dangerouslySetInnerHTML={{ __html: options.find((o) => o.value === value)?.label }} />
          </div>
          {!disabled && <ChevronDown className="text-gray-400" />}
        </button>

        {/* display options */}
        <div
          className={`${open ? "block" : "hidden"}  absolute min-w-full rounded-lg bg-white transition ${
            alignItems === "right" ? "right-0" : "left-0"
          } border-3 z-50 overflow-hidden border-red-600 shadow`}>
          {options.map((option, index) => (
            <div key={option?.key || index} onClick={() => handleChangeValue(option)} className={`${option.value === value && "bg-gray font-bold"}`}>
              <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: option.label }} />
                {option.value === value ? <BsCheck2 /> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
