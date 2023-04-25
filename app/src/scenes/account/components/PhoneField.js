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
      <label className="mb-[5px] text-sm font-semibold text-gray-700">{label}</label>
      <div className="form-control flex w-full items-center px-0">
        <Field as="select" name={selectZoneName} className="mr-3 max-w-[120px] text-ellipsis bg-transparent py-2 pl-4" onChange={onChangeZone} value={zoneValue}>
          {Object.entries(PHONE_ZONES).map(([key, phoneZone]) => (
            <option key={key} value={key} className="flex gap-1">
              {phoneZone.code} {phoneZone.name}
            </option>
          ))}
        </Field>
        <div className="h-6 w-[1px] bg-[#C5C5C5]" />
        <Field
          name={name}
          className={`flex w-full items-center justify-between gap-3 bg-transparent px-4 py-2`}
          type="tel"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          validate={validate}
        />
      </div>
      {error && <div className="mt-[8px] text-[#EF4444]">{error}</div>}
    </div>
  );
};

export default PhoneField;
