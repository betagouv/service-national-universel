import React from "react";
import { HiMinus, HiPlus } from "react-icons/hi";
import { getMacroActions, getMacroFields } from "../utils";

const MacroAction = ({ action: { field, value, action }, onDelete, onAddNext, updateAction, macroValues, displayRequiredErrors }) => {
  const actions = getMacroActions();
  const fields = getMacroFields(action);
  const values = macroValues[field];

  return (
    <div className="mt-3 flex items-center gap-4">
      <select
        onChange={(e) => updateAction("action", e.target.value)}
        value={action}
        className={`w-[24%] flex-none rounded border border-gray-300 bg-white py-2 px-3.5 pr-3 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400 ${
          displayRequiredErrors && !action && "border-[#CE0500] focus:border-[#CE0500]"
        }`}
      >
        {actions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        onChange={(e) => updateAction("field", e.target.value)}
        value={field}
        className={`w-[16%] flex-none rounded border border-gray-300 bg-white py-2 px-3.5 pr-3 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400 ${
          displayRequiredErrors && !field && "border-[#CE0500] focus:border-[#CE0500]"
        }`}
      >
        <option disabled value="">
          Sélectionnez
        </option>
        {fields.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {values ? (
        <select
          onChange={(e) => updateAction("value", e.target.value)}
          value={value}
          className={`w-[45%] flex-none rounded border border-gray-300 bg-white py-2 px-3.5 pr-3 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400 ${
            displayRequiredErrors && !value && "border-[#CE0500] focus:border-[#CE0500]"
          }`}
        >
          <option disabled value="">
            Sélectionnez
          </option>
          {values.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ) : (
        <input
          placeholder="Indiquez la valeur"
          type="text"
          onChange={(e) => updateAction("value", e.target.value)}
          value={value}
          className={`w-[45%] flex-none rounded border border-gray-300 bg-white py-2 px-3.5 pr-3 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400 ${
            displayRequiredErrors && !value && "border-[#CE0500] focus:border-[#CE0500]"
          }`}
        />
      )}

      <div className="ml-2 flex flex-none items-center gap-2">
        <button
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 transition-colors hover:bg-gray-50"
        >
          <HiMinus />
        </button>
        <button
          onClick={onAddNext}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 transition-colors hover:bg-gray-50"
        >
          <HiPlus />
        </button>
      </div>
    </div>
  );
};

export default MacroAction;
