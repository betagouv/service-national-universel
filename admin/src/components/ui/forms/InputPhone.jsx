import React from "react";
import { isPhoneZoneKnown, PHONE_ZONES } from "snu-lib";

const InputPhone = ({ value = "", onChange = () => {}, zoneValue = "", onChangeZone = () => {}, placeholder = "", className = "" }) => {
  if (zoneValue) {
    isPhoneZoneKnown({ zoneKey: zoneValue });
  }

  const handleChangePhoneZone = (event) => {
    onChangeZone(event.target.value);
  };

  const handleChangeValue = (event) => {
    onChange(event.target.value);
  };
  return (
    <div className={`flex w-full items-center ${className}`}>
      <select className="mr-3 max-w-[120px] text-ellipsis bg-transparent py-2 pl-4" onChange={handleChangePhoneZone} value={zoneValue}>
        {Object.entries(PHONE_ZONES).map(([key, phoneZone]) => (
          <option key={key} value={key} className="flex gap-1">
            {phoneZone.code} {phoneZone.name}
          </option>
        ))}
        {!zoneValue && <option value="" className="flex gap-1"></option>}
      </select>
      <div className="h-6 w-[1px] bg-[#C5C5C5]" />
      <input
        className={`flex w-full items-center justify-between gap-3 bg-transparent px-4 py-2`}
        type="tel"
        value={value}
        placeholder={placeholder}
        onChange={handleChangeValue}
      />
    </div>
  );
};

export default InputPhone;
