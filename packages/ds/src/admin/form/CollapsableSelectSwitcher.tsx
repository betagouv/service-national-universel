import React, { useMemo } from "react";
import Collapsable from "../ui/Collapsable";
import Switcher from "./Switcher";
import { HiOutlineX } from "react-icons/hi";

interface CollapsableSelectSwitcherProps {
  title: string;
  values?: string[];
  options?: { label: string; value: string }[];
  isOpen: boolean;
  onChange: (value: string[]) => void;
}

export default function CollapsableSelectSwitcher({
  title,
  isOpen,
  values = [],
  options = [],
  onChange,
}: CollapsableSelectSwitcherProps) {
  const excluded = useMemo(() => {
    return options.filter((option) => !values.includes(option.value)) || [];
  }, [values, options]);

  const included = useMemo(() => {
    return options.filter((option) => values.includes(option.value)) || [];
  }, [values, options]);

  return (
    <Collapsable
      title={title}
      titleClassName="text-sm leading-5 font-bold"
      open={isOpen}
      badge={
        <div className="text-sm leading-5 font-bold text-blue-600">
          {values.length}/{options.length}
        </div>
      }
      action={
        <Switcher
          label="Tout inclure"
          value={values.length === options.length}
          onChange={(value) => {
            if (value) {
              onChange(options.map((option) => option.value));
            } else {
              onChange([]);
            }
          }}
        />
      }
      className="w-full border-1 border-b border-gray-200 py-2.5 !gap-4"
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          Inclure :{" "}
          {included.map((option) => (
            <div
              key={option.value}
              className="flex gap-2 bg-gray-100 rounded-md pl-2 text-sm eading-5 font-normal items-center"
            >
              {option.label}{" "}
              <button
                onClick={() =>
                  onChange?.(values.filter((v) => v !== option.value))
                }
              >
                <HiOutlineX className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap text-red-600">
          Exclure :{" "}
          {excluded.map((option) => (
            <div
              key={option.value}
              className="flex gap-2 bg-gray-100 rounded-md pl-2 text-sm eading-5 font-normal items-center"
            >
              {option.label}{" "}
              <button onClick={() => onChange?.([...values, option.value])}>
                <HiOutlineX className="text-red-500 hover:text-red-700" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Collapsable>
  );
}
