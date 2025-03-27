import React from "react";
import { classNames } from "../../utils";

export interface InputCheckboxProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const InputCheckbox: React.FC<InputCheckboxProps> = ({
  name,
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}) => {
  return (
    <div
      className={classNames(
        "flex items-center justify-center gap-2",
        className,
      )}
    >
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="form-checkbox h-4 w-4 text-primary disabled:opacity-50"
      />
      {label && (
        <label
          htmlFor={name}
          className={classNames(
            "text-sm mt-1",
            disabled ? "text-gray-400" : "text-gray-900",
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default InputCheckbox;
