import React from "react";
import DatePickerList from "../../scenes/phase0/components/DatePickerList";
import { copyToClipboard } from "../../utils";
import { HiCheckCircle } from "react-icons/hi";
import { BiCopy } from "react-icons/bi";

export default function Field({
  name,
  label,
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
}) {
  const [copied, setCopied] = React.useState(false);
  const border = (readOnly, error) => {
    if (readOnly) return "border-gray-200";
    if (error) return "border-red-500";
    return "border-gray-300 focus-within:border-blue-500";
  };

  return (
    <div className={className}>
      <div className={`relative px-2.5 border-[1px] w-full rounded-md py-2 ${border(readOnly, errors[name])}`} key={name}>
        <div className="w-full flex justify-between">
          {label && <p className="font-normal text-xs text-[#6B7280]">{label}</p>}
          {copy && value && (
            <div
              className="flex items-center justify-center cursor-pointer hover:scale-105"
              onClick={() => {
                copyToClipboard(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }}>
              {copied ? <HiCheckCircle className="h-4 w-4 text-green-500" /> : <BiCopy className="h-4 w-4 text-gray-400" />}
            </div>
          )}
        </div>
        {type === "date" && (
          <DatePickerList disabled={readOnly || isJvaMission} fromEdition={false} value={value ? new Date(value) : null} onChange={(date) => handleChange(new Date(date))} />
        )}
        {["text", "tel"].includes(type) && (
          <input
            readOnly={(readOnly || isJvaMission) && "readonly"}
            type={type}
            name={name}
            autoFocus={autoFocus}
            value={value}
            onChange={handleChange}
            className={`w-full h-5 ${!readOnly && isJvaMission && "bg-gray-200"}`}
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
