import React from "react";
import { Switch } from "@headlessui/react";
import cx from "classnames";

export default function Toggle({ onChange, value, disabled = false }) {
  return (
    <Switch
      checked={value}
      onChange={(e) => !disabled && onChange(e)}
      className={cx(`group relative inline-flex h-5 w-10 flex-shrink-0 cursor-wait items-center justify-center rounded-full`)}>
      <span
        aria-hidden="true"
        className={cx("pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out", {
          "bg-blue-600": value && !disabled,
          "bg-blue-300": disabled,
          "bg-gray-200": !value,
        })}
      />
      <span
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white ring-0 transition-transform duration-200 ease-in-out",
          { "translate-x-5": value },
          { "translate-x-0": !value },
        )}
      />
    </Switch>
  );
}
