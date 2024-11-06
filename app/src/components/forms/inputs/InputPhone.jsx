import React from "react";
import { isPhoneZoneKnown, PHONE_ZONES } from "snu-lib";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";

const InputPhone = ({
  value = {
    phoneNumber: "",
    phoneZone: "",
  },
  label = "",
  onChange = () => null,
  placeholder = "",
  error = null,
  className = "",
}) => {
  if (value.phoneZone) {
    isPhoneZoneKnown({ zoneKey: value.phoneZone });
  }

  const handleChange = (fieldName) => (event) => {
    onChange({
      ...value,
      [fieldName]: event.target.value,
    });
  };

  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={error}>
        <div className={`flex w-full items-center ${className}`}>
          <select className="mr-3 max-w-[120px] text-ellipsis bg-transparent text-sm" onChange={handleChange("phoneZone")} value={value.phoneZone}>
            {Object.entries(PHONE_ZONES).map(([key, phoneZone]) => (
              <option key={key} value={key} className="flex gap-1">
                {phoneZone.code} {phoneZone.name}
              </option>
            ))}
            {!value.phoneZone && <option value="" className="flex gap-1"></option>}
          </select>
          <div className="h-5 w-[1px] bg-[#C5C5C5]" />
          <input
            className={`flex w-full items-center justify-between gap-3 bg-transparent pl-2 text-sm lg:pl-4`}
            type="tel"
            value={value.phoneNumber}
            placeholder={placeholder}
            onChange={handleChange("phoneNumber")}
          />
        </div>
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
};

export default InputPhone;
