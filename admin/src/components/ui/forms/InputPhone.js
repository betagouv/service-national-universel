import React from "react";
import { isPhoneZoneKnown, PHONE_ZONES } from "../../../utils/phone-number.utils";

const InputPhone = ({ value = "", onChange = () => {}, zoneValue = "FRANCE", onChangeZone = () => {}, placeholder = "", className = "" }) => {
  isPhoneZoneKnown({ zoneKey: zoneValue });

  const handleChangePhoneZone = (event) => {
    onChangeZone(event.target.value);
  };

  const handleChangeValue = (event) => {
    onChange(event.target.value);
  };
  return (
    <div className={`flex items-center w-full ${className}`}>
      <select className="py-2 pl-4 mr-3 bg-transparent" onChange={handleChangePhoneZone} value={zoneValue}>
        {Object.entries(PHONE_ZONES).map(([key, phoneZone]) => (
          <option key={key} value={key} className="flex gap-1">
            {phoneZone.shortcut} {phoneZone.code}
          </option>
        ))}
      </select>
      <div className="h-6 w-[1px] bg-[#C5C5C5]" />
      <input
        className={`flex justify-between items-center gap-3 w-full bg-transparent px-4 py-2`}
        type="tel"
        value={value}
        placeholder={placeholder}
        onChange={handleChangeValue}
      />
    </div>
  );
};

export default InputPhone;
