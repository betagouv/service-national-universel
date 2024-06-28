import React, { ChangeEventHandler } from "react";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";
import { copyToClipboard } from "../../../../utils";

interface Props {
  value: string;
  label: string;
  disabled?: boolean;
  error?: string;
  readOnly?: boolean;
  copy?: boolean;
  placeholder?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export default function Field({ onChange, value, label, disabled, error, readOnly, copy, placeholder }: Props) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);

  return (
    <div className={`flex w-full flex-col rounded-lg border-[1px] border-gray-300 py-2 px-2.5 ${disabled ? "bg-gray-100" : ""} ${error ? "border-red-500" : ""}`}>
      <label className="text-xs leading-4 text-gray-500">{label}</label>
      <div className="flex items-center gap-2">
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
        <input className={`w-full ${disabled ? "bg-gray-100" : ""}`} value={value} onChange={onChange} disabled={disabled} readOnly={readOnly} placeholder={placeholder} />
      </div>
      {error && <div className="text-[#EF4444]">{error}</div>}
    </div>
  );
}
