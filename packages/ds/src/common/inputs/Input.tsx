import React from "react";
import Label from "./Label";

interface proptype {
  label?: string;
  className?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string | null;
  type?: "text" | "email";
  disabled?: boolean;
  readOnly?: boolean; 
}

const Input = ({
  label = "",
  className = "",
  name = "",
  value = "",
  onChange = () => null,
  error = null,
  type = "text",
  disabled = false,
  readOnly = false,
}: proptype) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={className}>
      <Label title={label} hasError={Boolean(error)}>
        <input
          className="w-full bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:text-gray-400"
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
        />
      </Label>
      {error && <p className="pt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
