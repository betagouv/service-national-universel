import React, { useContext, useEffect, useState } from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";
import SimpleSelect from "../components/SimpleSelect";
import SectionContext from "../context/SectionContext";
import dayjs from "dayjs";

/**
 * mode  could be "correction|edition|readonly" (default readonly)
 */
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
  if (type === "date") {
    return (
      <div className={className}>
        <div className={`relative bg-white py-[9px] px-[13px] border-[#D1D5DB] border-[1px] rounded-[6px] ${errors[name] ? "border-[#EF4444]" : "border-[#D1D5DB]"}`}>
          <label className="font-normal text-[12px] leading-[16px] text-[#6B7280]">{label}</label>
          <input
            type="date"
            name={name}
            value={dayjs(value).locale("fr").format("YYYY-MM-DD")}
            onChange={handleChange}
            onClick={(e) => {
              if (e.target?.showPicker) e.target.showPicker();
            }}
            className="block p-[5px] w-[100%] cursor-pointer"
          />
          {errors[name] && <div className="text-[#EF4444] mt-[8px]">{errors[name]}</div>}
        </div>
      </div>
    )
  }
  return (
    <div className={className}>
      <div
        className={`relative bg-white py-[9px] px-[13px] border-[#D1D5DB] border-[1px] rounded-[6px] ${errors[name] ? "border-[#EF4444]" : "border-[#D1D5DB]"}`}
        key={name}
        onMouseEnter={() => mouseOver(true)}
        onMouseLeave={() => mouseOver(false)}>
        {label && <label className="font-normal text-[12px] leading-[16px] text-[#6B7280]">{label}</label>}
        {type === "select" && <SimpleSelect value={value} name={name} transformer={transformer} options={options} onChange={handleChange} filterOnType={filterOnType} />}
        {type === "text" && <input type="text" name={name} value={value} onChange={handleChange} className="block p-[5px] w-[100%]" />}
        {errors[name] && <div className="text-[#EF4444] mt-[8px]">{errors[name]}</div>}
      </div>
    </div>
  );
}
