import React from "react";
import { isPhoneZoneKnown, PHONE_ZONES, PHONE_ZONES_NAMES } from "snu-lib/phone-number";

import ErrorMessage from "../ErrorMessage";
import withController from "../hocs/withController";
import Label from "../layout/Label";

const InputPhone = ({
  value = {
    phoneNumber: "",
    phoneZone: PHONE_ZONES_NAMES.FRANCE,
  },
  label = "",
  onChange = () => null,
  placeholder = "",
  error = null,
  className = "",
  onBlur: handleBlur = () => null,
}) => {
  isPhoneZoneKnown({ zoneKey: value.phoneZone });

  const handleChange = (fieldName) => (event) => {
    onChange({
      ...value,
      [fieldName]: event.target.value,
    });
  };
  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label hasError={error} title={label}>
        <div className={`flex items-center w-full ${className}`}>
          <select className="mr-3 bg-transparent max-w-[120px] text-ellipsis text-sm" value={value.phoneZone} onBlur={handleBlur} onChange={handleChange("phoneZone")}>
            {Object.entries(PHONE_ZONES).map(([key, phoneZone]) => (
              <option key={key} className="flex gap-1" value={key}>
                {phoneZone.code} {phoneZone.name}
              </option>
            ))}
          </select>
          <div className="h-5 w-[1px] bg-[#C5C5C5]" />
          <input
            className="flex justify-between items-center gap-3 w-full bg-transparent pl-2 lg:pl-4 text-sm"
            placeholder={placeholder}
            type="tel"
            value={value.phoneNumber}
            onBlur={handleBlur}
            onChange={handleChange("phoneNumber")}
          />
        </div>
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
};

export default withController(InputPhone);
