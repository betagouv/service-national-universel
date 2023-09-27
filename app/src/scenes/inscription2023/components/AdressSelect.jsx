import React, { useState } from "react";

export default function AdressSelect({ data, setData }) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

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

  const handleChange = async (e) => {
    setQuery(e.target.value);
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${e.target.value}&limit=10`);
    const data = await res.json();
    setOptions(data.features);
    console.log(data);
  };

  const handleSelect = (option) => {
    setSelected(option);
    setData({ ...data, address: option.properties.name, zip: option.properties.postcode, city: option.properties.city });
  };

  const handleChangeAddress = (e) => {
    setData({ ...data, address: e.target.value });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-2">
        Rechercher une adresse
        <input type="text" value={query} onChange={handleChange} className="border" />
      </label>
      <div className="border flex flex-col">
        {housenumbers.length > 0 && (
          <>
            <p className="p-2 font-bold">Numéro</p>
            {housenumbers
              .sort((a, b) => a.properties.score - b.properties.score)
              .map((option) => (
                <button key={option.properties.id} onClick={() => handleSelect(option)} className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full text-left">
                  {option.properties.label}
                </button>
              ))}
          </>
        )}

        {streets.length > 0 && (
          <>
            <p className="p-2 font-bold">Voie</p>
            {streets
              .sort((a, b) => a.properties.score - b.properties.score)
              .map((option) => (
                <button key={option.properties.id} onClick={() => handleSelect(option)} className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full text-left">
                  {option.properties.label}
                </button>
              ))}
          </>
        )}

        {localities.length > 0 && (
          <>
            <p className="p-2 font-bold">Lieu-dit</p>
            {localities
              .sort((a, b) => a.properties.score - b.properties.score)
              .map((option) => (
                <button key={option.properties.id} onClick={() => handleSelect(option)} className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full text-left">
                  {option.properties.label}
                </button>
              ))}
          </>
        )}

        {municipalities.length > 0 && (
          <>
            <p className="p-2 font-bold">Commune</p>
            {municipalities
              .sort((a, b) => a.properties.score - b.properties.score)
              .map((option) => (
                <button key={option.properties.id} onClick={() => handleSelect(option)} className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full text-left">
                  {option.properties.label}
                </button>
              ))}
          </>
        )}
      </div>

      <label className="flex flex-col gap-2">
        Adresse
        <input type="text" value={selected?.properties.name} disabled={selected?.properties.type === "housenumber"} className="border" onChange={handleChangeAddress} />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-col gap-2 w-full">
          Code postal
          <input type="text" value={selected?.properties.postcode} disabled className="border" />
        </label>

        <label className="flex flex-col gap-2 w-full">
          Ville
          <input type="text" value={selected?.properties.city} disabled className="border" />
        </label>
      </div>
    </div>
  );
}
