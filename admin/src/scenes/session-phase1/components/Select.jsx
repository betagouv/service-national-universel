import React from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";
import Bus from "../../../assets/icons/Bus";
import { BiWalk } from "react-icons/bi";

export default function Select({ options, value, alignItems = "left", onChange }) {
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

  return (
    <div style={{ fontFamily: "Marianne" }} ref={ref}>
      <div className="relative">
        {/* select item */}
        <button
          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-inherit px-3 py-2 disabled:opacity-50"
          style={{ fontFamily: "Marianne" }}
          onClick={() => setOpen((e) => !e)}>
          <div className="flex items-center gap-2 text-base text-blue-600">
            {value === "noMeetingPoint" ? (
              <>
                <BiWalk className="text-blue-600 opacity-40" /> Autonome(s)
              </>
            ) : (
              <>
                <Bus className="text-blue-600 opacity-40" /> {value === "transportInfoGivenByLocal" ? "Services locaux" : value}
              </>
            )}
          </div>
          <ChevronDown className="text-gray-400" />
        </button>

        {/* display options */}
        <div className={`${open ? "block" : "hidden"}  border-3 absolute right-0 z-50 min-w-full overflow-hidden rounded-lg border-red-600 bg-white shadow transition`}>
          {options.map((option, index) => (
            <div
              key={option?.key || index}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`${option.value === value ? "bg-gray-200" : ""}`}>
              <div className="group flex cursor-pointer items-center justify-between gap-2 bg-inherit p-2 px-3 text-gray-700 ">
                <div className="flex items-center gap-2 bg-inherit text-base ">
                  {option.value === "noMeetingPoint" ? (
                    <>
                      <BiWalk className="text-blue-600 opacity-40" /> Autonome(s)
                    </>
                  ) : (
                    <>
                      <Bus className="text-blue-600 opacity-40" /> {option.value === "transportInfoGivenByLocal" ? "Services locaux" : option.value}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
