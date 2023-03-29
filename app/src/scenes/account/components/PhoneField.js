import { Field } from "formik";
import React from "react";
import { isPhoneZoneKnown, PHONE_ZONES, PHONE_ZONES_NAMES } from "snu-lib/phone-number";

const PhoneField = ({
  label = "Téléphone",
  name = "",
  selectZoneName = "",
  placeholder = "",
  value = "",
  className = "",
  zoneValue = PHONE_ZONES_NAMES.FRANCE,
  onChangeZone = () => {},
  onChange = () => {},
  validate = () => true,
  error,
}) => {
  isPhoneZoneKnown({ zoneKey: zoneValue });

  return (
    <div className={className}>
      <label className="text-gray-700 font-semibold text-sm mb-[5px]">{label}</label>
      <div className="flex items-center w-full form-control px-0">
        <Field as="select" name={selectZoneName} className="py-2 pl-4 mr-3 bg-transparent max-w-[120px]" onChange={onChangeZone} value={zoneValue}>
          {Object.entries(PHONE_ZONES).map(([key, phoneZone]) => (
            <option key={key} value={key} className="flex gap-1">
              {phoneZone.code} {phoneZone.name}
            </option>
          ))}
        </Field>
        <div className="h-6 w-[1px] bg-[#C5C5C5]" />
        <Field
          name={name}
          className={`flex justify-between items-center gap-3 w-full bg-transparent px-4 py-2`}
          type="tel"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          validate={validate}
        />
      </div>
      {error && <div className="text-[#EF4444] mt-[8px]">{error}</div>}
    </div>
  );
};

export default PhoneField;
