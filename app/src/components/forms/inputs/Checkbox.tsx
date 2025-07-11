import React, { forwardRef } from "react";
import ErrorMessage from "../ErrorMessage";

type Props = {
  label?: string;
  className?: string;
  error?: string;
  checked?: boolean;
  disabled?: boolean;
  [key: string]: any;
};

const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox(props, ref) {
  const { label, className, error, checked, disabled, ...rest } = props;
  return (
    <div className={`mb-3 ${className}`}>
      <label className={`flex items-center gap-2 ${error ? "border-red-500" : ""}`}>
        <input type="checkbox" className="hidden" ref={ref} checked={checked} disabled={disabled} {...rest} />
        <span
          className={`w-4 h-4 flex-shrink-0 border rounded-sm flex items-center justify-center
            ${checked ? (disabled ? "bg-gray-300 border-gray-300" : "bg-blue-600 border-blue-600") : "bg-white border-gray-400"}
            ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          `}>
          {checked && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.629 14.555l-4.784-4.784 1.414-1.414L7.629 11.727l8.12-8.12 1.414 1.414z" />
            </svg>
          )}
        </span>
        {label && <span className={`text-gray-700 text-sm`}>{label}</span>}
      </label>
      {error && <ErrorMessage error={error} />}
    </div>
  );
});

export default Checkbox;
