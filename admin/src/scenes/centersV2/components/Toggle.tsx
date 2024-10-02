import React from "react";
import { Switch } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  onChange?: (e: any) => void;
  value: boolean;
  disabled?: boolean;
}

export default function Toggle({ onChange, value, disabled = false }: Props) {
  return (
    <Switch
      checked={value}
      onChange={(e) => !disabled && onChange && onChange(e)}
      className={` group relative inline-flex h-5 w-10 flex-shrink-0 cursor-wait items-center justify-center rounded-full `}>
      <span
        aria-hidden="true"
        className={classNames(value ? "bg-blue-600" : "bg-gray-200", "pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out")}
      />
      <span
        aria-hidden="true"
        className={classNames(
          value ? "translate-x-5" : "translate-x-0",
          "pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white ring-0 transition-transform duration-200 ease-in-out",
        )}
      />
    </Switch>
  );
}
