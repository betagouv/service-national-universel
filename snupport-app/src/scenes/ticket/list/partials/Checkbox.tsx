import React from "react";

interface CheckboxProps {
  name: string;
  state: boolean;
  setState: (state: boolean) => void;
}

const Checkbox = ({ name, state, setState }: CheckboxProps) => {
  return (
    <label className="flex items-center justify-between py-2 pl-4 pr-3 cursor-pointer transition-colors hover:bg-gray-50">
      <span className="text-sm font-medium text-gray-700">{name}</span>
      <input type="checkbox" checked={state} onChange={(e) => setState(e.target.checked)} className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600" />
    </label>
  );
};

export default Checkbox;
