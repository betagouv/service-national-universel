import React from "react";
import { BsCheck2 } from "react-icons/bs";
import ChevronDown from "../../../assets/icons/ChevronDown";

const optionsHour = [];
for (let i = 0; i < 24; i++) {
  const index = i.toString();
  optionsHour.push(index.length > 1 ? index : "0" + index);
}

const optionsMin = [];
for (let i = 0; i < 60; i++) {
  const index = i.toString();
  optionsMin.push(index.length > 1 ? index : "0" + index);
}

export default function TimePicker({ value, onChange, disabled }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const [hour, setHour] = React.useState();
  const [min, setMin] = React.useState();

  React.useEffect(() => {
    const time = value.split(":");
    setHour(time[0]);
    setMin(time[1]);
  }, [value]);

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

  const handleChangeHour = (newValue) => {
    setHour(newValue);
    onChange(newValue + ":" + min);
    setOpen(false);
  };

  const handleChangeMin = (newValue) => {
    setMin(newValue);
    onChange(hour + ":" + newValue);
    setOpen(false);
  };

  return (
    <div style={{ fontFamily: "Marianne" }} ref={ref}>
      <div className="relative">
        {/* select item */}
        <button
          className="flex min-w-[100px] h-8 cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3 py-3 disabled:cursor-wait disabled:opacity-50"
          style={{ fontFamily: "Marianne" }}
          onClick={(event) => {
            event.stopPropagation();
            !disabled && setOpen((e) => !e);
          }}>
          <div className="flex items-center gap-2 px-6">
            <span className="whitespace-nowrap text-sm font-medium text-snu-purple-800" dangerouslySetInnerHTML={{ __html: hour + " : " + min }} />
          </div>
          {!disabled && <ChevronDown className={`text-gray-400 ${open ? "rotate-180" : ""}`} />}
        </button>

        {/* display options */}
        <div className={`${open ? "flex" : "hidden"} absolute min-w-[100px] rounded-lg bg-white transition left-0 border-3 z-50  h-[200px] border-red-600 shadow`}>
          <div className="block overflow-scroll w-1/2">
            {optionsHour.map((option, index) => (
              <div
                key={index}
                onClick={(event) => {
                  event.stopPropagation();
                  handleChangeHour(option);
                }}
                className={`${option === hour && "bg-gray font-bold"}`}>
                <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                  <div dangerouslySetInnerHTML={{ __html: option }} />
                  {option === hour ? <BsCheck2 /> : null}
                </div>
              </div>
            ))}
          </div>
          <div className="block overflow-scroll w-1/2">
            {optionsMin.map((option, index) => (
              <div
                key={index}
                onClick={(event) => {
                  event.stopPropagation();
                  handleChangeMin(option);
                }}
                className={`${option === min && "bg-gray font-bold"}`}>
                <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                  <div dangerouslySetInnerHTML={{ __html: option }} />
                  {option === min ? <BsCheck2 /> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
