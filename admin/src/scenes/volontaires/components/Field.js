import React from "react";
import SimpleSelect from "../../phase0/components/SimpleSelect";
import dayjs from "dayjs";

export default function Field({ name, label, value, className = "", type = "text", options = [], filterOnType = false, handleChange, transformer, readOnly = false, errors = {} }) {
  return (
    <div className={className}>
      <div className={`relative bg-white py-2 px-3 border-[#D1D5DB] border rounded-md ${errors[name] ? "border-[#EF4444]" : "border-[#D1D5DB]"}`} key={name}>
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
        {type === "select" && (
          <SimpleSelect
            value={value}
            name={name}
            showBackgroundColor={false}
            transformer={transformer}
            options={options}
            onChange={(value) => handleChange(name, value)}
            filterOnType={filterOnType}
          />
        )}
        {type === "text" && <input readOnly={readOnly && "readonly"} type="text" name={name} value={value} onChange={handleChange} className="block p-1 w-[100%]" />}
        {errors[name] && <div className="text-[#EF4444] mt-2">{errors[name]}</div>}
      </div>
    </div>
  );
}
