import React from "react";
import { Switch } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Toggle({ onChange, value, disabled = false }) {
  return (
    <Switch
      checked={value}
      onChange={(e) => !disabled && onChange(e)}
      className="group relative inline-flex h-5 w-10 flex-shrink-0 items-center justify-center rounded-full cursor-pointer">
      <span
        aria-hidden="true"
        className={classNames(value ? "bg-green-500" : "bg-gray-200", "pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out")}
      />
      <span
        aria-hidden="true"
        className={classNames(
          value ? "translate-x-5" : "translate-x-0",
          "pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out",
        )}
      />
    </Switch>
  );
}
