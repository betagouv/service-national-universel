import React from "react";

export default function AddressOption({ option, handleSelect }) {
  return (
    <button key={option.properties.id} onClick={() => handleSelect(option)} className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full flex justify-between">
      <p>{option.properties.name}</p>
      <p>
        {option.properties.city}
        {option.properties.postcode && " - " + option.properties.postcode}
      </p>
    </button>
  );
}
