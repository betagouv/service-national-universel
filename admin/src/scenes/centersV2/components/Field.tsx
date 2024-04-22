import React, { ChangeEventHandler } from "react";
import ReactTooltip from "react-tooltip";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";
import { MdInfoOutline } from "react-icons/md";

import { copyToClipboard } from "../../../utils";

interface Props {
  value: string;
  label: string;
  disabled?: boolean;
  error?: string;
  readOnly?: boolean;
  copy?: string;
  className?: string;
  tooltips?: string | null;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export default function Field({ onChange, value, label, disabled = false, error, readOnly = false, copy, className = "", tooltips = null }: Props) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);

  return (
    <div className={`flex w-full flex-col rounded-lg border-[1px] border-gray-300 py-2 px-2.5 ${disabled ? "bg-gray-100" : ""} ${error ? "border-red-500" : ""} ${className}`}>
      {tooltips !== null ? (
        <div className="mb-1.5 flex items-center gap-2">
          <label className="my-0 text-xs text-gray-500">{label}</label>

          <MdInfoOutline data-tip data-for={tooltips} className="h-4 w-4 cursor-pointer text-gray-400" />
          <ReactTooltip id={tooltips} type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
            <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">{tooltips}</p>
          </ReactTooltip>
        </div>
      ) : (
        <label className="text-xs leading-4 text-gray-500">{label}</label>
      )}
      <div className="flex items-center gap-2">
        {copy && value && (
          <div
            className={`flex items-center justify-center hover:scale-105`}
            onClick={() => {
              copyToClipboard(value);
              setCopied(true);
            }}>
            {copied ? <HiCheckCircle className="h-4 w-4 text-green-500" /> : <BiCopy className="h-4 w-4 text-gray-400" />}
          </div>
        )}
        <input className={`w-full ${disabled ? "bg-gray-100" : ""} ${readOnly && "cursor-default"}`} value={value} onChange={onChange} disabled={disabled} readOnly={readOnly} />
      </div>
      {error && <div className="text-[#EF4444]">{error}</div>}
    </div>
  );
}
