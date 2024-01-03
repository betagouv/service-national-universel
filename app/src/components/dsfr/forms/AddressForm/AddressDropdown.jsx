import React from "react";

export default function AddressDropdown({ optionGroups, handleSelect }) {
  return optionGroups.map((optionGroup) => (
    <div key={optionGroup.label}>
      <p className="p-2 font-bold bg-[#EEEEEE]">{optionGroup.label}</p>
      {optionGroup.options.map((option) => (
        <button
          key={option.address + option.city + option.zip}
          onClick={() => handleSelect(option)}
          className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full flex justify-between">
          <p className="text-left">{option.address}</p>
          <p className="text-right">
            {option.city}
            {option.zip && " - " + option.zip}
          </p>
        </button>
      ))}
    </div>
  ));
}
