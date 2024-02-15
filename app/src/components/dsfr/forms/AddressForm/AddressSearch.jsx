import React, { useEffect, useRef, useState } from "react";
import AddressDropdown from "./AddressDropdown";
import { RiSearchLine } from "react-icons/ri";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import useAddress from "@/services/useAddress";
import { queryClient } from "@/app";
import { useDebounce } from "@uidotdev/usehooks";

export default function AddressSearch({ updateData, label, error }) {
  const dropdownRef = useRef(null);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const { results, isPending } = useAddress({ query: debouncedQuery, options: { limit: 10 }, enabled: debouncedQuery.length > 2 });

  const housenumberOptions = { label: "Numéro", options: results?.filter((o) => o.coordinatesAccuracyLevel === "housenumber") };
  const streetOptions = { label: "Voie", options: results?.filter((o) => o.coordinatesAccuracyLevel === "street") };
  const localityOptions = { label: "Lieu-dit", options: results?.filter((o) => o.coordinatesAccuracyLevel === "locality") };
  const municipalityOptions = { label: "Commune", options: results?.filter((o) => o.coordinatesAccuracyLevel === "municipality") };
  const sortedOptions = [housenumberOptions, streetOptions, localityOptions, municipalityOptions].filter((o) => o.options?.length);

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

  const handleChange = (e) => {
    queryClient.cancelQueries("address");
    setQuery(e.target.value);
  };

  const handleSelect = (option) => {
    updateData(option);
    setQuery("");
  };

  return (
    <div ref={dropdownRef}>
      <label className="flex flex-col gap-1">
        {label}
        <span className="text-[#666666] text-xs mb-1">Si l'adresse est introuvable, sélectionnez uniquement une commune ou un code postal.</span>
        <div className="relative">
          <input type="text" value={query} onChange={handleChange} className="w-[100%] border-b-2 border-gray-800 bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 pr-5" />
          <span className="material-icons absolute right-5 mt-[12px] text-lg">
            <RiSearchLine />
          </span>
        </div>
      </label>

      <div className="relative">
        {query?.trim().length > 2 && (
          <div className="bg-white border flex flex-col absolute z-10 -top-1 w-full shadow">
            {isPending ? (
              <p className="animate-pulse p-3 text-gray-800 text-center">Chargement</p>
            ) : sortedOptions.length ? (
              <AddressDropdown optionGroups={sortedOptions} handleSelect={handleSelect} />
            ) : (
              <p className="p-3 text-gray-800 text-center">
                L'adresse ne s'affiche pas ? Renseignez une <strong>commune</strong> ou un <strong>code postal</strong>.
              </p>
            )}
          </div>
        )}
      </div>

      <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
}
