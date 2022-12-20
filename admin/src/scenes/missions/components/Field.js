import React from "react";
import DatePickerList from "../../phase0/components/DatePickerList";
import { htmlCleaner } from "../../../utils";

export default function Field({ name, label, value, className = "", type = "text", handleChange, readOnly = false, errors = {}, row }) {
  return (
    <div className={className}>
      <div className={`relative bg-white px-3 border-[1px] w-full rounded-md py-2 ${errors[name] ? "border-red-500" : "border-[#D1D5DB]"}`} key={name}>
        {label && <div className="font-normal text-xs leading-4 text-[#6B7280]">{label}</div>}
        {type === "date" && <DatePickerList disabled={readOnly} fromEdition={false} value={value ? new Date(value) : null} onChange={(date) => handleChange(new Date(date))} />}
        {type === "text" && <input readOnly={readOnly && "readonly"} type="text" name={name} value={value} onChange={handleChange} className={"w-full"} />}

        {type === "textarea" && (
          <>
            {readOnly ? (
              <div rows={row} dangerouslySetInnerHTML={{ __html: htmlCleaner(value) }} />
            ) : (
              <textarea rows={row} readOnly={readOnly} type="text" name={name} value={value} onChange={handleChange} className={"w-full text-start " + className} />
            )}
          </>
        )}
        {errors[name] && <div className="text-red-500 mt-2">{errors[name]}</div>}
      </div>
    </div>
  );
}
