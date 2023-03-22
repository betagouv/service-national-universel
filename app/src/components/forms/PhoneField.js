import React from "react";
import { PHONE_ZONES } from "../../utils/phone-number.utils";
import SelectField from "./SelectField";

const PhoneField = ({ value = "", onChange = () => {}, zoneValue = "FRANCE", onChangeZone = () => {}, placeholder = "", className = "" }) => {
  const handleChangePhoneZone = (event) => {
    onChangeZone(event.target.value);
  };

  const handleChangeValue = (event) => {
    onChange(event.target.value);
  };
  return (
    <div className={`flex items-center w-full bg-[#EEEEEE] border-b-[2px] rounded-t-[4px] ${className}`}>
      <SelectField className="py-2 pl-4 mr-3 bg-[#EEEEEE]" name="phoneZone" onChange={handleChangePhoneZone} value={zoneValue}>
        {Object.entries(PHONE_ZONES).map(([key, value]) => (
          <option key={key} value={key} className="flex gap-1">
            {value.shortcut} {value.code}
          </option>
        ))}
      </SelectField>
      <div className="h-6 w-[1px] bg-[#C5C5C5]" />
      <input className={`flex justify-between items-center gap-3 w-full bg-[#EEEEEE] px-4 py-2`} type="tel" value={value} placeholder={placeholder} onChange={handleChangeValue} />
    </div>
  );
};

export default PhoneField;
