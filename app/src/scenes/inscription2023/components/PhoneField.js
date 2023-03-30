import React from "react";
import ErrorMessage from "./ErrorMessage";
import { PHONE_ZONES } from "snu-lib/phone-number";

const PhoneField = ({
  value = "",
  label = "Téléphone",
  onChange = () => {},
  zoneValue = "FRANCE",
  onChangeZone = () => {},
  placeholder = "",
  className = "",
  correction = "",
  error = "",
}) => {
  const handleChangePhoneZone = (event) => {
    onChangeZone(event.target.value);
  };

  const handleChangeValue = (event) => {
    onChange(event.target.value);
  };
  return (
    <div className={`mt-2 mb-4 ${className}`}>
      <label className={`my-2 whitespace-nowrap ${correction || error ? "text-[#CE0500]" : "text-[#3A3A3A]"}`}>{label}</label>
      <div className={`flex items-center w-full bg-[#EEEEEE] border-b-[2px] rounded-t-[4px] ${correction || error ? "border-[#CE0500]" : "border-[#3A3A3A]"}`}>
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
      <ErrorMessage>{error}</ErrorMessage>
      <ErrorMessage>{correction}</ErrorMessage>
    </div>
  );
};

export default PhoneField;
