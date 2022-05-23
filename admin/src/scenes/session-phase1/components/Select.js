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
          className="flex justify-between items-center gap-3 bg-inherit px-3 py-2 rounded-lg cursor-pointer disabled:opacity-50"
          style={{ fontFamily: "Marianne" }}
          onClick={() => setOpen((e) => !e)}>
          <div className="flex items-center gap-2 text-base text-blue-600">
            {value === "noMeetingPoint" ? (
              <>
                <BiWalk className="text-blue-600 opacity-40" /> Autonome(s)
              </>
            ) : (
              <>
                <Bus className="text-blue-600 opacity-40" /> {value}
              </>
            )}
          </div>
          <ChevronDown className="text-gray-400" />
        </button>

        {/* display options */}
        <div className={`${open ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute right-0 border-3 border-red-600 shadow overflow-hidden z-50`}>
          {options.map((option, index) => (
            <div
              key={option?.key || index}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`${option.value === value ? "bg-gray-200" : ""}`}>
              <div className="group flex justify-between items-center gap-2 p-2 px-3 text-gray-700 bg-inherit cursor-pointer ">
                <div className="flex items-center bg-inherit gap-2 text-base ">
                  {option.value === "noMeetingPoint" ? (
                    <>
                      <BiWalk className="text-blue-600 opacity-40" /> Autonome(s)
                    </>
                  ) : (
                    <>
                      <Bus className="text-blue-600 opacity-40" /> {option.value}
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
