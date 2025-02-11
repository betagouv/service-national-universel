import React from "react";

interface proptype {
  label?: string;
  className?: string;
  name?: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  error?: string | null;
  disabled?: boolean;
  readOnly?: boolean;
}

const Checkbox = ({
  className,
  name,
  checked,
  onChange,
  error,
  disabled,
  readOnly,
}: proptype) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // @ts-ignore
    onChange?.(event.target.value);
  };

  return (
    <div className={className}>
      <input
        className="w-full text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:text-gray-400"
        name={name}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
      />
      {error && <p className="pt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Checkbox;
