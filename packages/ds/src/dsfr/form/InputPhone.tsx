/** @format */

import React from "react";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";

import { classNames } from "../../utils";
import { PHONE_ZONES } from "../../common";

type OwnProps = {
  name: string;
  value: string;
  onChange: (e: string) => void;
  onChangeZone: (e: string) => void;
  zoneValue?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  active?: boolean;
  readOnly?: boolean;
  error?: string;
};

export default function InputPhone({
  name,
  value,
  onChange,
  onChangeZone,
  zoneValue,
  label,
  placeholder,
  disabled,
  active,
  readOnly,
  error,
}: OwnProps) {
  const selectRef = React.useRef<HTMLSelectElement>(null);

  const handleChangePhoneZone = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onChangeZone(event.target.value);
  };

  const handleChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-1 flex-col justify-center w-full">
        {label && (
          <label
            htmlFor={name}
            className={classNames(
              error ? "text-red-500" : "text-[var(--text-label-grey)]",
              "mb-0 text-base font-normal leading-6"
            )}
          >
            {label}
          </label>
        )}
        <div className="flex w-full">
          <div className="w-48">
            <Select
              label=""
              disabled={disabled || readOnly}
              nativeSelectProps={{
                className: "!my-0",
                ref: selectRef,
                onChange: handleChangePhoneZone,
                value: zoneValue,
              }}
            >
              {!zoneValue && (
                <option value="" className="flex gap-1">
                  + ?? ...
                </option>
              )}
              {Object.entries(PHONE_ZONES).map(([key, phoneZone]) => (
                <option key={key} value={key}>
                  {phoneZone.shortcut} {phoneZone.code}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full">
            <Input
              label=""
              disabled={disabled}
              nativeInputProps={{
                inputMode: "tel",
                pattern: "[0-9]*",
                type: "number",
                className: getInputClass({ label }),
                name,
                id: name,
                placeholder: placeholder ? placeholder : "612345678",
                onChange: handleChangeValue,
                value: value,
                readOnly: readOnly,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const getInputClass = ({ label }: { label?: string }) => {
  const baseClass =
    "flex flex-1 font-normal leading-5 text-gray-900 text-sm placeholder:text-gray-500 disabled:text-gray-500 disabled:bg-gray-50 disabled:cursor-default read-only:cursor-default";
  if (label) {
    return classNames(baseClass, "");
  } else {
    return classNames(baseClass, "h-full py-2");
  }
};
