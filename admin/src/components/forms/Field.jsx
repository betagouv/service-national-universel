import React from "react";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import { copyToClipboard } from "../../utils";
import { HiCheckCircle } from "react-icons/hi";
import { BiCopy } from "react-icons/bi";

export default function Field({
  name,
  label = "",
  value,
  className = "",
  type = "text",
  handleChange,
  readOnly = false,
  errors = {},
  row = 5,
  isJvaMission = false,
  copy = false,
  autoFocus = false,
  placeholder = "",
}) {
  const [copied, setCopied] = React.useState(false);
  const border = (readOnly, error) => {
    if (readOnly) return "border-gray-200";
    if (error) return "border-red-500";
    return "border-gray-300 focus-within:border-blue-500";
  };

  if (type === "date")
    return (
      <div className={className}>
        <DatePickerInput label={label} placeholder={placeholder} value={value} onChange={(date) => handleChange(date, name)} disabled={readOnly || isJvaMission} />
      </div>
    );

  return (
    <div className={className}>
      <div className={`relative w-full rounded-md border-[1px] px-2.5 py-2 ${border(readOnly, errors[name])}`} key={name}>
        <div className="flex w-full justify-between">
          {label && <p className="text-xs font-normal text-[#6B7280]">{label}</p>}
          {copy && value && (
            <div
              className="flex cursor-pointer items-center justify-center hover:scale-105"
              onClick={() => {
                copyToClipboard(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }}>
              {copied ? <HiCheckCircle className="h-4 w-4 text-green-500" /> : <BiCopy className="h-4 w-4 text-gray-400" />}
            </div>
          )}
        </div>
        {["text", "tel"].includes(type) && (
          <input
            readOnly={(readOnly || isJvaMission) && "readonly"}
            type={type}
            name={name}
            autoFocus={autoFocus}
            value={value}
            onChange={handleChange}
            className={`h-5 w-full ${!readOnly && isJvaMission && "bg-gray-200"}`}
          />
        )}

        {type === "textarea" && (
          <textarea
            rows={row}
            readOnly={readOnly || isJvaMission}
            type="text"
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={handleChange}
            className={"w-full text-start " + className}
          />
        )}
        {errors[name] && <div className="mt-1 text-red-500">{errors[name]}</div>}
      </div>
    </div>
  );
}
