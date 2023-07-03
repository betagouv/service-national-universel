import React from "react";
import { BsCheck2 } from "react-icons/bs";
import ChevronDown from "../../../../assets/icons/ChevronDown";

export default function Select({ options, value, renderOption, onChange, disabled, placeholder }) {
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
    <div className="w-full" ref={ref}>
      <div className="relative">
        {/* select item */}
        <div
          className={`flex h-8 w-full items-center justify-between  rounded-lg border border-gray-300 bg-white px-3 py-3`}
          onClick={(event) => {
            event.stopPropagation();
            !disabled && setOpen((e) => !e);
          }}>
          {value?.name ? <div>{value?.name || placeholder}</div> : <div className="text-gray-400 text-xs">{placeholder}</div>}
          {!disabled && <ChevronDown className={`text-gray-400 ${open ? "rotate-180" : ""}`} />}
        </div>
        <div
          className={`${
            open ? "block" : "hidden"
          } w-full absolute min-w-[100px] max-h-[200px] rounded-lg bg-white transition left-0 border-3 z-50 overflow-scroll border-red-600 shadow`}>
          {options.map((option, index) => (
            <div
              key={option?.key || index}
              onClick={(event) => {
                event.stopPropagation();
                handleChangeValue(option);
              }}
              className={`${option.value === value && "bg-gray font-bold w-full"}`}>
              {renderOption ? (
                renderOption(option)
              ) : (
                <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                  <div dangerouslySetInnerHTML={{ __html: option.label }} />
                  {option.value === value ? <BsCheck2 /> : null}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
