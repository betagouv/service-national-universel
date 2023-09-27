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
    if (e.target.value.length < 3) return;
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${e.target.value}&limit=10`);
    const data = await res.json();
    setOptions(data.features);
  };

  const handleSelect = (option) => {
    setSelected(option);
    setData({ ...data, address: option.properties.name, zip: option.properties.postcode, city: option.properties.city });
    setQuery(null);
  };

  const handleChangeAddress = (e) => {
    setData({ ...data, address: e.target.value });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-2 font-bold">
        {data.address ? "Modifier mon adresse" : "Rechercher une adresse"}
        <input type="text" value={query} onChange={handleChange} className="border p-2 font-normal" />
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
                    <button
                      key={option.properties.id}
                      onClick={() => handleSelect(option)}
                      className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full flex justify-between">
                      <p>{option.properties.name}</p>
                      <p>
                        {option.properties.city} -{option.properties.postcode}
                      </p>
                    </button>
                  ))}
              </>
            )}

            {streets.length > 0 && (
              <>
                <p className="p-2 font-bold bg-gray-100">Voie</p>
                {streets
                  .sort((a, b) => b.properties.score - a.properties.score)
                  .map((option) => (
                    <button
                      key={option.properties.id}
                      onClick={() => handleSelect(option)}
                      className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full flex justify-between">
                      <p>{option.properties.name}</p>
                      <p>
                        {option.properties.city} -{option.properties.postcode}
                      </p>
                    </button>
                  ))}
              </>
            )}

            {localities.length > 0 && (
              <>
                <p className="p-2 font-bold bg-gray-100">Lieu-dit</p>
                {localities
                  .sort((a, b) => b.properties.score - a.properties.score)
                  .map((option) => (
                    <button
                      key={option.properties.id}
                      onClick={() => handleSelect(option)}
                      className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full flex justify-between">
                      <p>{option.properties.name}</p>
                      <p>
                        {option.properties.city} -{option.properties.postcode}
                      </p>
                    </button>
                  ))}
              </>
            )}

            {municipalities.length > 0 && (
              <>
                <p className="p-2 font-bold bg-gray-100">Commune</p>
                {municipalities
                  .sort((a, b) => b.properties.score - a.properties.score)
                  .map((option) => (
                    <button
                      key={option.properties.id}
                      onClick={() => handleSelect(option)}
                      className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full flex justify-between">
                      <p>{option.properties.name}</p>
                      <p>
                        {option.properties.city} -{option.properties.postcode}
                      </p>
                    </button>
                  ))}
              </>
            )}
          </div>
        )}
      </div>

      <label className="flex flex-col gap-2 font-bold">
        Adresse
        <input type="text" value={data.address} disabled={selected?.properties.type === "housenumber"} onChange={handleChangeAddress} className="border p-2 font-normal" />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-col gap-2 w-full font-bold">
          Code postal
          <input type="text" value={data.zip} disabled className="border p-2 font-normal" />
        </label>

        <label className="flex flex-col gap-2 w-full font-bold">
          Ville
          <input type="text" value={data.city} disabled className="border p-2 font-normal" />
        </label>
      </div>
    </div>
  );
}
