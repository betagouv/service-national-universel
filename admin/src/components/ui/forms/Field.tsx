import React, { ChangeEvent, useState } from "react";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import SimpleSelect from "@/components/ui/forms/SimpleSelect";
import { copyToClipboard } from "@/utils";
import { HiCheckCircle } from "react-icons/hi";
import { BiCopy } from "react-icons/bi";
import { htmlCleaner } from "snu-lib";

interface FieldProps {
  type?: string;
  name?: string;
  label: string;
  placeholder?: string;
  value: string | null;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, name: string) => void;
  className?: string;
  readOnly?: boolean;
  error?: string;
  copy?: boolean;
  bgColor?: string;
  row?: number;
  maxLength?: number;
  dateMode?: string;
  transformer?: (item: any) => any;
  options?: Array<any>;
  filterOnType?: boolean;
}

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
}: FieldProps) {
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
            readOnly={!!readOnly}
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
