// https://tailwindui.com/components/application-ui/forms/comboboxes

import React from "react";
import { Combobox as HeadlessCombobox } from "@headlessui/react";
import { HiCheck, HiOutlineSearch } from "react-icons/hi";

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

interface proptype {
  label: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  options: { label: string; value: any }[];
  value: any;
  onChange: (value: any) => void;
}

export default function Combobox({
  label,
  setQuery,
  options = [],
  value,
  onChange,
}: proptype) {
  return (
    <HeadlessCombobox as="div" value={value} onChange={onChange}>
      <HeadlessCombobox.Label className="block text-sm font-medium leading-6 text-gray-800">
        {label}
      </HeadlessCombobox.Label>
      <div className="relative mt-2">
        <HeadlessCombobox.Input
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(option: { label: string; value: string }) =>
            option?.label
          }
        />
        <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <HiOutlineSearch
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </HeadlessCombobox.Button>

        {options.length > 0 && (
          <HeadlessCombobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <HeadlessCombobox.Option
                key={option.label}
                value={option}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-blue-600 text-white" : "text-gray-800"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={classNames(
                        "block truncate",
                        selected && "font-semibold"
                      )}
                    >
                      {option.label}
                    </span>
                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-blue-600"
                        )}
                      >
                        <HiCheck className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </HeadlessCombobox.Option>
            ))}
          </HeadlessCombobox.Options>
        )}
      </div>
    </HeadlessCombobox>
  );
}
