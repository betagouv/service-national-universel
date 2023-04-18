import React, { useEffect } from "react";
import { isPhoneZoneKnown, PHONE_ZONES, PHONE_ZONES_NAMES } from "snu-lib/phone-number";
import Label from '../layout/Label';
import ErrorMessage from '../ErrorMessage';

const InputPhone = ({
  value = {
    phoneNumber: "",
    phoneZone: PHONE_ZONES_NAMES.FRANCE,
  },
  label = "",
  onChange = () => null,
  placeholder = "",
  error = null,
  validate = () => null,
  className = "",
  name = "",
}) => {
  isPhoneZoneKnown({ zoneKey: value.phoneZone });

  useEffect(() => {
    if (validate) {
      const removeValidation = validate(name);
      return () => {
        if (removeValidation) {
          removeValidation();
        }
      };
    }
  }, [value]);

  const handleChange = (fieldName) => (event) => {
    onChange({
      ...value,
      [fieldName]: event.target.value,
    });
  };

  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={error}>
        <div className={`flex items-center w-full ${className}`}>
          <select className="mr-3 bg-transparent max-w-[120px] text-ellipsis text-sm" onChange={handleChange("phoneZone")} value={value.phoneZone}>
            {Object.entries(PHONE_ZONES).map(([key, phoneZone]) => (
              <option key={key} value={key} className="flex gap-1">
                {phoneZone.code} {phoneZone.name}
              </option>
            ))}
          </select>
          <div className="h-5 w-[1px] bg-[#C5C5C5]" />
          <input
            className={`flex justify-between items-center gap-3 w-full bg-transparent pl-2 lg:pl-4 text-sm`}
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
