import React from "react";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";

import { classNames } from "../../utils";
import { PHONE_ZONES } from "../../common";

type OwnProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onChangeZone: (value: string) => void;
  zoneValue: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
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
  readOnly,
  error,
}: OwnProps) {
  const selectRef = React.useRef<HTMLSelectElement>(null);

  const handleChangePhoneZone = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onChangeZone(event.target.value);
  };

  const handleChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="flex flex-1 flex-col justify-center">
          {label && (
            <label
              htmlFor={name}
              className={classNames(
                error ? "text-red-500" : "text-[var(--text-label-grey)]",
                "mb-0 text-base font-normal leading-6",
              )}
            >
              {label}
            </label>
          )}
          <div className="flex ">
            <div className="flex ">
              <Select
                label=""
                className="max-w-[160px]"
                state={error ? "error" : "default"}
                stateRelatedMessage={error}
                disabled={disabled || readOnly}
                nativeSelectProps={{
                  className: "!my-0 text-ellipsis max-w-[160px] ",
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
                    {phoneZone.code} {phoneZone.name}
                  </option>
                ))}
              </Select>
            </div>
            {/* <div className="h-6 my-auto w-[1px] bg-gray-200" /> */}
            <Input
              label=""
              disabled={disabled}
              className={`pl-2 w-full ${
                error && "[&>.fr-input]:shadow-[inset_0_-2px_0_-0_#ce0500]"
              }`}
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
