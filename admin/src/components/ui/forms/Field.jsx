import React, { useState } from "react";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import SimpleSelect from "@/components/ui/forms/SimpleSelect";
import { copyToClipboard } from "@/utils";
import { HiCheckCircle } from "react-icons/hi";
import { BiCopy } from "react-icons/bi";
import { htmlCleaner } from "snu-lib";

export default function Field({
  // Common
  type = "text",
  name,
  label,
  placeholder,
  value,
  onChange,
  className = "",
  readOnly = false,
  error,
  copy = false,
  bgColor,
  // Textarea
  row = 5,
  maxLength,
  // Date
  dateMode,
  // Select
  transformer,
  options,
  filterOnType,
}) {
  const [copied, setCopied] = useState(false);

  if (type === "date")
    return (
      <div className={className}>
        <DatePickerInput label={label} placeholder={placeholder} value={value} onChange={(date) => onChange(date, name)} disabled={readOnly} error={error} mode={dateMode} />
      </div>
    );

  return (
    <div className={className}>
      <div
        key={name}
        className={`relative ${!readOnly && !!bgColor ? bgColor : "bg-white"} w-full rounded-md border-[1px] px-3 py-2 ${error ? "border-red-500" : "border-[#D1D5DB]"}`}>
        <div className="flex justify-between">
          {label && <div className="text-xs font-normal leading-4 text-[#6B7280]">{label}</div>}
          {copy && value && (
            <div
              className="flex cursor-pointer items-center justify-center hover:scale-105"
              onClick={() => {
                copyToClipboard(value);
                setCopied(true);
              }}>
              {copied ? <HiCheckCircle className="h-4 w-4 text-green-500" /> : <BiCopy className="h-4 w-4 text-gray-400" />}
            </div>
          )}
        </div>

        {["text", "tel"].includes(type) && (
          <input
            readOnly={readOnly && "readonly"}
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value, name, e)}
            className={`${!readOnly && !!bgColor && bgColor} w-full`}
          />
        )}

        {type === "textarea" &&
          (readOnly ? (
            <div className={"w-full h-[84px] text-start overflow-x-auto " + className} dangerouslySetInnerHTML={{ __html: htmlCleaner(value) }} />
          ) : (
            <textarea
              rows={row}
              readOnly={readOnly}
              type="text"
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value, name, e)}
              className={`w-full text-start ${bgColor} ` + className}
              maxLength={maxLength}
            />
          ))}

        {type === "select" && (
          <SimpleSelect
            value={value}
            name={name}
            showBackgroundColor={false}
            transformer={transformer}
            options={options}
            onChange={(value) => onChange(value, name)}
            filterOnType={filterOnType}
          />
        )}

        {error && <div className="mt-2 text-red-500">{error}</div>}
      </div>
    </div>
  );
}
