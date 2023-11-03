/** @format */

import { classNames } from "../../utils";
import React from "react";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";

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
    <div className="flex flex-col gap-2">
      <div>
        <div className="flex flex-1 flex-col justify-center">
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
          <div className="flex ">
            <div className="flex ">
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
                    {phoneZone.code} {phoneZone.shortcut}
                  </option>
                ))}
              </Select>
            </div>
            {/* <div className="h-6 my-auto w-[1px] bg-gray-200" /> */}
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

const PHONE_ZONES = {
  FRANCE: {
    shortcut: "FR",
    name: "France métropolitaine",
    code: "+33",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  GUADELOUPE: {
    shortcut: "GP",
    name: "Guadeloupe",
    code: "+590",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  GUYANE: {
    shortcut: "GY",
    name: "Guyane",
    code: "+594",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  LA_REUNION: {
    shortcut: "RE",
    name: "La Réunion",
    code: "+262",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  MARTINIQUE: {
    shortcut: "MQ",
    name: "Martinique",
    code: "+596",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  MAYOTTE: {
    shortcut: "YT",
    name: "Mayotte",
    code: "+262",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  NOUVELLE_CALEDONIE: {
    shortcut: "NC",
    name: "Nouvelle-Calédonie",
    code: "+687",
    numberLength: 6,
    errorMessage: "Ce numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  POLYNESIE_FRANCAISE: {
    shortcut: "PF",
    name: "Polynésie française",
    code: "+689",
    numberLength: 8,
    errorMessage: "Ce numéro de téléphone doit contenir 8 chiffres.",
    example: "XXXXXXXX",
  },
  SAINT_BARTHELEMY: {
    shortcut: "BL",
    name: "Saint-Barthélémy",
    code: "+590",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  SAINT_MARTIN: {
    shortcut: "MF",
    name: "Saint-Martin",
    code: "+590",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  SAINT_PIERRE_ET_MIQUELON: {
    shortcut: "PM",
    name: "Saint-Pierre-et-Miquelon",
    code: "+508",
    numberLength: 6,
    errorMessage: "Ce numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  WALLIS_ET_FUTUNA: {
    shortcut: "WF",
    name: "Wallis-et-Futuna",
    code: "+681",
    numberLength: 6,
    errorMessage: "Ce numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  AUTRE: {
    shortcut: "Autre",
    name: "Autre",
    code: null,
    numberLength: null,
    errorMessage: null,
    example: "Numéro de téléphone",
  },
};
