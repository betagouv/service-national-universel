import React from "react";
import { isPhoneZoneKnown, PHONE_ZONES } from "snu-lib/phone-number";

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
      <select className="py-2 pl-4 mr-3 bg-transparent max-w-[120px] text-ellipsis" onChange={handleChangePhoneZone} value={zoneValue}>
        {Object.entries(PHONE_ZONES).map(([key, phoneZone]) => (
          <option key={key} value={key} className="flex gap-1">
            {phoneZone.code} {phoneZone.name}
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
