import React, { useEffect, useRef, useState } from "react";
import AddressDropdown from "./AddressDropdown";
import { RiSearchLine } from "react-icons/ri";
import { toastr } from "react-redux-toastr";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import { useQuery } from "@tanstack/react-query";
import { formatOption, simpleApiAdress, sortOptions } from "@/services/api-adresse";

export default function AddressSearch({ filters, updateData, error }) {
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);
  const controllerRef = useRef(null);

  // Will execute on every change to the query state variable
  // TODO: debounce
  const { data } = useQuery({
    queryKey: ["address", query],
    queryFn: () => simpleApiAdress(query, filters),
    enabled: query.trim().length > 2,
    config: {
      onError: () => toastr.error("Erreur", `Une erreur est survenue lors de la recherche d'adresse.`, { timeOut: 10_000 }),
    },
  });

  // Derived from the data returned by useQuery: format and group results to use in our dropdown
  const formattedOptions = data?.features.map((option) => formatOption(option)) || [];
  const sortedOptions = sortOptions(formattedOptions);

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

  const handleSelect = (option) => {
    updateData(option);
    setQuery("");
  };

  return (
    <div ref={dropdownRef}>
      <label className="flex flex-col gap-1">
        Rechercher une adresse
        <span className="text-[#666666] text-xs mb-1">Si l'adresse est introuvable, sélectionnez uniquement une commune ou un code postal.</span>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[100%] border-b-2 border-gray-800 bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 pr-5"
          />
          <span className="material-icons absolute right-5 mt-[12px] text-lg">
            <RiSearchLine />
          </span>
        </div>
      </label>

      <div className="relative">
        {query?.trim().length > 2 && (
          <div className="bg-white border flex flex-col absolute z-10 -top-1 w-full shadow">
            {sortedOptions.length ? (
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
