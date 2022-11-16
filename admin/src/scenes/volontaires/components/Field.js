import React, { useEffect, useState } from "react";
import SimpleSelect from "../components/SimpleSelect";
import dayjs from "dayjs";

export default function Field({
  group = null,
  name,
  label,
  value,
  className = "",
  type = "text",
  options = [],
  filterOnType = false,
  handleChange,
  transformer,
  readyOnly = false,
  errors = {},
}) {
  const [mouseIn, setMouseIn] = useState(false);

  useEffect(() => {
    if (group) {
      setMouseIn(group.hover === true);
    }
  }, [group]);

  function mouseOver(mousein) {
    if (group === null || group === undefined) {
      setMouseIn(mousein);
    }
  }
  return (
    <div className={className}>
      <div
        className={`relative bg-white py-2 px-3 border-[#D1D5DB] border rounded-md ${errors[name] ? "border-[#EF4444]" : "border-[#D1D5DB]"}`}
        key={name}
        onMouseEnter={() => mouseOver(true)}
        onMouseLeave={() => mouseOver(false)}>
        {label && <label className="font-normal text-xs leading-4 text-[#6B7280]">{label}</label>}
        {type === "date" && (
          <input
            type="date"
            name={name}
            value={dayjs(value).locale("fr").format("YYYY-MM-DD")}
            onChange={handleChange}
            onClick={(e) => {
              if (e.target?.showPicker) e.target.showPicker();
            }}
            className="block w-[100%] cursor-pointer"
          />
        )}
        {type === "select" && <SimpleSelect value={value} name={name} transformer={transformer} options={options} onChange={handleChange} filterOnType={filterOnType} />}
        {type === "text" && <input readOnly={readyOnly && "readonly"} type="text" name={name} value={value} onChange={handleChange} className="block p-[5px] w-[100%]" />}
        {errors[name] && <div className="text-[#EF4444] mt-[8px]">{errors[name]}</div>}
      </div>
    </div>
  );
}
