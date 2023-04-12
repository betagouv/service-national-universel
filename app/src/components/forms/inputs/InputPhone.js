import React, { useEffect } from "react";
import { isPhoneZoneKnown, PHONE_ZONES, PHONE_ZONES_NAMES } from "snu-lib/phone-number";

const InputPhone = ({
  value = {
    phoneNumber: "",
    phoneZone: PHONE_ZONES_NAMES.FRANCE,
  },
  label = "",
  onChange = (value) => null,
  placeholder = "",
  error = null,
  validate = (value) => null,
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
    <div className="mb-4">
      <label
        className={`flex flex-col justify-center border-[1px] min-h-[54px] w-full py-2 px-3 rounded-lg bg-white border-gray-300 disabled:border-gray-200 focus-within:border-blue-600 m-0 ${
          error && "border-red-500"
        } ${className}`}>
        {label ? <p className="text-xs leading-4 text-gray-500 disabled:text-gray-400">{label}</p> : null}
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
      </label>
      {error ? <p className="text-red-500 text-sm px-3 pt-1">{error}</p> : null}
    </div>
  );
};

export default InputPhone;
