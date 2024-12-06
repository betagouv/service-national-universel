import React, { useEffect, useState } from "react";

interface SwitcherProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Switcher({
  value,
  onChange,
  label,
  disabled,
}: SwitcherProps) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(value || false);
  }, [value]);

  return (
    <label className="inline-flex items-center cursor-pointer gap-2 m-0">
      {label && (
        <span className="ms-3 text-sm leading-5 font-normal">{label}</span>
      )}
      <input
        type="checkbox"
        checked={checked}
        className="sr-only peer"
        disabled={disabled}
        onChange={(e) => {
          setChecked(e.target.checked);
          onChange?.(e.target.checked);
        }}
      />
      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  );
}
