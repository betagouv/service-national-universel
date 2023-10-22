import React, { useState } from "react";
import { departmentLookUp } from "snu-lib";
import { HiSearch } from "react-icons/hi";

export default function AdressSelect({ data, setData }) {
  const [selected, setSelected] = useState(null);

  if (data.zip) return <DisplayAddress data={data} setData={setData} selected={selected} />;
  return <SearchAddress data={data} setData={setData} setSelected={setSelected} />;
}

function DisplayAddress({ data, setData, selected }) {
  const disabled = selected?.properties.type === "housenumber";
  const resetData = () => {
    setData({ ...data, address: "", addressVerified: "false", zip: "", city: "", department: "", region: "", location: null });
  };

  return (
    <div className="flex flex-col gap-2">
      {(!selected || disabled) && (
        <label className="flex flex-col gap-1 w-full text-gray-400">
          Adresse
          <input
            type="text"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            disabled
            className="bg-[#EEEEEE] disabled:bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 text-gray-800 disabled:text-gray-400 border-b-2 border-gray-800 disabled:border-[#EEEEEE]"
          />
        </label>
      )}

      <div className="flex flex-col md:flex-row gap-2 md:gap-8">
        <label className="flex flex-col gap-1 w-full text-gray-400">
          Code postal
          <input type="text" value={data.zip} disabled className="bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 text-gray-400" />
        </label>

        <label className="flex flex-col gap-1 w-full text-gray-400">
          Ville
          <input type="text" value={data.city} disabled className="bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 text-gray-400" />
        </label>
      </div>

      {selected && !disabled && (
        <label className="flex flex-col gap-1 w-full text-gray-800">
          Compléter mon adresse (numéro, voie, lieu-dit, autre information)
          <input
            type="text"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            disabled={disabled}
            className="bg-[#EEEEEE] disabled:bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 text-gray-800 disabled:text-gray-400 border-b-2 border-gray-800 disabled:border-[#EEEEEE]"
          />
        </label>
      )}

      <button onClick={resetData} className="text-blue-600 text-left py-2 w-fit">
        Rechercher une autre adresse
      </button>
    </div>
  );
}

function SearchAddress({ data, setData, setSelected }) {
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
      address: option.properties.type !== "municipality" ? option.properties.name : "",
      zip: option.properties.postcode,
      city: option.properties.city,
      department: getDepartmentAndRegionFromContext(option.properties.context).department,
      region: getDepartmentAndRegionFromContext(option.properties.context).region,
      location: { lat: option.geometry.coordinates[1], lon: option.geometry.coordinates[0] },
    });
    setSelected(option);
    setQuery("");
  };

  return (
    <>
      <label className="flex flex-col gap-1">
        Rechercher une adresse
        <span className="text-[#666666] text-xs mb-1">Si votre adresse est introuvable, sélectionnez uniquement une commune ou un code postal.</span>
        <div className="relative">
          <input type="text" value={query} onChange={handleChangeQuery} className="w-[100%] border-b-2 border-gray-800 bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 pr-5" />
          <span className="material-icons absolute right-5 mt-[12px] text-lg">
            <HiSearch />
          </span>
        </div>
      </label>

      <div className="relative">
        {query?.length > 2 && (
          <div className="bg-white border flex flex-col absolute z-10 -top-4 w-full shadow">
            {options.length > 0 ? (
              <>
                {housenumbers.length > 0 && (
                  <>
                    <p className="p-2 font-bold bg-[#EEEEEE]">Numéro</p>
                    {housenumbers
                      .sort((a, b) => b.properties.score - a.properties.score)
                      .map((option) => (
                        <Option key={option.properties.id} option={option} handleSelect={handleSelect} />
                      ))}
                  </>
                )}
                {streets.length > 0 && (
                  <>
                    <p className="p-2 font-bold bg-[#EEEEEE]">Voie</p>
                    {streets
                      .sort((a, b) => b.properties.score - a.properties.score)
                      .map((option) => (
                        <Option key={option.properties.id} option={option} handleSelect={handleSelect} />
                      ))}
                  </>
                )}
                {localities.length > 0 && (
                  <>
                    <p className="p-2 font-bold bg-[#EEEEEE]">Lieu-dit</p>
                    {localities
                      .sort((a, b) => b.properties.score - a.properties.score)
                      .map((option) => (
                        <Option key={option.properties.id} option={option} handleSelect={handleSelect} />
                      ))}
                  </>
                )}
                {municipalities.length > 0 && (
                  <>
                    <p className="p-2 font-bold bg-[#EEEEEE]">Commune</p>
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
              </>
            ) : (
              <p className="p-3 text-gray-800 text-center">Aucun résultat. Essayez de saisir une commune ou un code postal.</p>
            )}
          </div>
        )}
      </div>
    </>
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
