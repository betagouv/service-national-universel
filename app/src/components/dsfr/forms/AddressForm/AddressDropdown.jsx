import React from "react";

export default function AddressDropdown({ options, handleSelect }) {
  const housenumberOptions = { label: "Numéro", options: options?.filter((o) => o.coordinatesAccuracyLevel === "housenumber") };
  const streetOptions = { label: "Voie", options: options?.filter((o) => o.coordinatesAccuracyLevel === "street") };
  const localityOptions = { label: "Lieu-dit", options: options?.filter((o) => o.coordinatesAccuracyLevel === "locality") };
  const municipalityOptions = { label: "Commune", options: options?.filter((o) => o.coordinatesAccuracyLevel === "municipality") };

  const optionGroups = [housenumberOptions, streetOptions, localityOptions, municipalityOptions].filter((o) => o.options?.length);

  return (
    <span className="text-[#161616]">
      {optionGroups.map((optionGroup) => (
        <div key={optionGroup.label}>
          <span className="pl-3 p-2 w-full flex justify-between font-bold bg-[#EEEEEE] ">{optionGroup.label}</span>
          {optionGroup.options.map((option) => (
            <span
              key={option.address + option.city + option.zip}
              onClick={() => handleSelect(option)}
              className="cursor-pointer pl-3 p-2 hover:bg-[#EEEEEE]  w-full flex justify-between">
              <span className="text-left">{option.address}</span>
              <span className="text-right">
                {option.city}
                {option.zip && " - " + option.zip}
              </span>
            </span>
          ))}
        </div>
      ))}
    </span>
  );
}
