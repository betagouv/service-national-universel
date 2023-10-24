import React, { useEffect, useRef, useState } from "react";
import { departmentLookUp } from "snu-lib";
import Option from "./AddressOption";
import { FiSearch } from "react-icons/fi";
import { apiAdress } from "@/services/api-adresse";
import { toastr } from "react-redux-toastr";

export default function AddressSearch({ updateData }) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);

  const housenumbers = options.filter((option) => option.properties.type === "housenumber");
  const streets = options.filter((option) => option.properties.type === "street");
  const localities = options.filter((option) => option.properties.type === "locality");
  const municipalities = options.filter((option) => option.properties.type === "municipality");

  const dropdownRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChangeQuery = async (e) => {
    setQuery(e.target.value);
    if (e.target.value.length < 3) return;

    // Abort previous request and refresh abort controller
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const res = await apiAdress(e.target.value, { limit: 10 }, { signal: controller.signal });
    if (res.error) return toastr.error("Erreur", "Une erreur est survenue lors de la recherche de votre adresse.", { timeOut: 10_000 });
    setOptions(res.features);
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
    updateData({
      addressVerified: "true",
      address: option.properties.type !== "municipality" ? option.properties.name : "",
      addressType: option.properties.type,
      zip: option.properties.postcode,
      city: option.properties.city,
      cityCode: option.properties.citycode,
      department: getDepartmentAndRegionFromContext(option.properties.context).department,
      region: getDepartmentAndRegionFromContext(option.properties.context).region,
      location: { lat: option.geometry.coordinates[1], lon: option.geometry.coordinates[0] },
    });
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
            <FiSearch />
          </span>
        </div>
      </label>

      <div className="relative">
        {query?.length > 2 && (
          <div ref={dropdownRef} className="bg-white border flex flex-col absolute z-10 -top-1 w-full shadow">
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
              </>
            ) : (
              <p className="p-3 text-gray-800 text-center">
                Votre adresse ne s'affiche pas ? Renseignez une <strong>commune</strong> ou un <strong>code postal</strong>.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
