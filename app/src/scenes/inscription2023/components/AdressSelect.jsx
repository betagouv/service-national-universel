import React, { useState } from "react";
import { departmentLookUp } from "snu-lib";

export default function AdressSelect({ data, setData }) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);

  // https://adresse.data.gouv.fr/api-doc/adresse
  // Types de résultats :
  //   housenumber : numéro « à la plaque »
  //   street : position « à la voie », placé approximativement au centre de celle-ci
  //   locality : lieu-dit
  //   municipality : numéro « à la commune »

  const housenumbers = options.filter((option) => option.properties.type === "housenumber");
  const streets = options.filter((option) => option.properties.type === "street");
  const localities = options.filter((option) => option.properties.type === "locality");
  const municipalities = options.filter((option) => option.properties.type === "municipality");

  const handleChangeQuery = async (e) => {
    setQuery(e.target.value);
    setData({ ...data, address: e.target.value });
    if (e.target.value.length < 3) return;
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${e.target.value}&limit=10`);
    const json = await res.json();
    setOptions(json.features);
  };

  const getDepartmentAndRegionFromContext = (context) => {
    const contextArray = context.split(",");
    if (contextArray.length === 2) {
      // Nouvelle-Calédonie, Polynésie...
      return { department: departmentLookUp[contextArray[0].trim()], region: contextArray[1].trim() };
    }
    return { department: contextArray[1].trim(), region: contextArray[2].trim() };
  };

  const handleSelect = (option) => {
    setData({
      ...data,
      addressVerified: "true",
      address: option.properties.name,
      zip: option.properties.postcode,
      city: option.properties.city,
      department: getDepartmentAndRegionFromContext(option.properties.context).department,
      region: getDepartmentAndRegionFromContext(option.properties.context).region,
      location: { lat: option.geometry.coordinates[1], lon: option.geometry.coordinates[0] },
    });
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-2 font-medium">
        Adresse
        <input type="text" value={data.address} onChange={handleChangeQuery} className="border p-2 font-normal" />
      </label>

      <div className="relative">
        {query?.length > 2 && options.length > 0 && (
          <div className="bg-white border flex flex-col absolute z-10 -top-4 w-full">
            {housenumbers.length > 0 && (
              <>
                <p className="p-2 font-bold bg-gray-100">Numéro</p>
                {housenumbers
                  .sort((a, b) => b.properties.score - a.properties.score)
                  .map((option) => (
                    <Option key={option.properties.id} option={option} handleSelect={handleSelect} />
                  ))}
              </>
            )}

            {streets.length > 0 && (
              <>
                <p className="p-2 font-bold bg-gray-100">Voie</p>
                {streets
                  .sort((a, b) => b.properties.score - a.properties.score)
                  .map((option) => (
                    <Option key={option.properties.id} option={option} handleSelect={handleSelect} />
                  ))}
              </>
            )}

            {localities.length > 0 && (
              <>
                <p className="p-2 font-bold bg-gray-100">Lieu-dit</p>
                {localities
                  .sort((a, b) => b.properties.score - a.properties.score)
                  .map((option) => (
                    <Option key={option.properties.id} option={option} handleSelect={handleSelect} />
                  ))}
              </>
            )}

            {municipalities.length > 0 && (
              <>
                <p className="p-2 font-bold bg-gray-100">Commune</p>
                {municipalities
                  .sort((a, b) => b.properties.score - a.properties.score)
                  .map((option) => (
                    <Option key={option.properties.id} option={option} handleSelect={handleSelect} />
                  ))}
              </>
            )}
            <button className="p-2 text-blue-france-sun-113 hover:bg-blue-france-sun-113 hover:text-white w-full" onClick={() => setQuery("")}>
              Fermer
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <label className="flex flex-col gap-2 w-full font-medium">
          Code postal
          <input type="text" value={data.zip} disabled className="border p-2 font-normal" />
        </label>

        <label className="flex flex-col gap-2 w-full font-medium">
          Ville
          <input type="text" value={data.city} disabled className="border p-2 font-normal" />
        </label>
      </div>

      <label className="flex flex-col gap-2 font-medium">
        Complément d'adresse
        <textarea type="text" value={data.addressComplement} onChange={(e) => setData({ ...data, addressComplement: e.target.value })} className="border p-2 font-normal" />
      </label>
    </div>
  );
}

function Option({ option, handleSelect }) {
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
