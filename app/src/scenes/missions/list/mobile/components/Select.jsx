import React, { useEffect, useState } from "react";
import { translate } from "snu-lib";
import ChevronDown from "../../../../../assets/icons/ChevronDown";

const Select = ({ value, options, handleChangeValue, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const values = Object.values(options);

  useEffect(() => {
    let placeholderValue = "";
    values.forEach((option) => ((value || []).includes(option) ? (placeholderValue += ", " + translate(option)) : null));

    setSelected(placeholderValue === "" ? placeholder : placeholderValue.length <= 28 ? placeholderValue.slice(2) : placeholderValue.slice(2, 26) + "...");
  }, [value]);

  return (
    <div style={{ fontFamily: "Marianne" }} className="flex justify-center">
      {/* select item */}
      <div>
        <button
          className="flex min-w-[250px] cursor-pointer items-center justify-between gap-3 rounded-lg border-[1px] px-3 py-2 disabled:cursor-wait disabled:opacity-50"
          style={{ fontFamily: "Marianne" }}
          onClick={() => setOpen((e) => !e)}>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm font-medium text-gray-700 ">{selected}</span>
          </div>
          <ChevronDown className="text-gray-400" />
        </button>

        {/* display options */}
        <div className=" relative flex h-0 flex-col justify-end">
          <div className={`${open ? "block" : "hidden"} border-3 absolute  left-0 right-0 bottom-11 z-50 overflow-hidden rounded-lg border-red-600 bg-white shadow transition `}>
            {values.map((option, index) => (
              <div key={index} className={`${(value || []).includes(option) && "bg-gray font-bold"}`}>
                <div
                  className="group flex  cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    handleChangeValue(option);
                  }}>
                  <input type="checkbox" className="rounded-xl" checked={(value || []).includes(option)} readOnly />
                  <div>{translate(option)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Select;
