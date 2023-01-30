import React from "react";
import DatePickerList from "../../phase0/components/DatePickerList";
import { copyToClipboard } from "../../../utils";
import { HiCheckCircle } from "react-icons/hi";
import { BiCopy } from "react-icons/bi";

export default function Field({ name, label, value, className = "", type = "text", handleChange, readOnly = false, errors = {}, row = 5, isJvaMission = false, copy = false }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className={className}>
      <div
        className={`relative ${!readOnly && isJvaMission ? "bg-gray-200" : "bg-white"} px-3 border-[1px] w-full rounded-md py-2 ${
          errors[name] ? "border-red-500" : "border-[#D1D5DB]"
        }`}
        key={name}>
        <div className="flex justify-between">
          {label && <div className="font-normal text-xs leading-4 text-[#6B7280]">{label}</div>}
          {copy && value && (
            <div
              className="flex items-center justify-center cursor-pointer hover:scale-105"
              onClick={() => {
                copyToClipboard(value);
                setCopied(true);
              }}>
              {copied ? <HiCheckCircle className="h-4 w-4 text-green-500" /> : <BiCopy className="h-4 w-4 text-gray-400" />}
            </div>
          )}
        </div>
        {type === "date" && (
          <DatePickerList disabled={readOnly || isJvaMission} fromEdition={false} value={value ? new Date(value) : null} onChange={(date) => handleChange(new Date(date))} />
        )}
        {type === "text" && (
          <input
            readOnly={(readOnly || isJvaMission) && "readonly"}
            type="text"
            name={name}
            value={value}
            onChange={handleChange}
            className={`${!readOnly && isJvaMission && "bg-gray-200"} w-full`}
          />
        )}

        {type === "textarea" && (
          <textarea rows={row} readOnly={readOnly || isJvaMission} type="text" name={name} value={value} onChange={handleChange} className={"w-full text-start " + className} />
        )}
        {errors[name] && <div className="text-red-500 mt-2">{errors[name]}</div>}
      </div>
    </div>
  );
}
