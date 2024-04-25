import React, { useEffect, useRef, useState } from "react";
import AddressDropdown from "./AddressDropdown";
import { RiSearchLine } from "react-icons/ri";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import { useAddress } from "snu-lib";
import { Input } from "@snu/ds/dsfr";

export default function AddressSearch({ updateData, label, error }) {
  const [query, setQuery] = useState("");
  const { results, isError, isPending } = useAddress({ query, options: { limit: 10 }, enabled: query.length > 2 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setQuery("");
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleChangeQuery = (e) => {
    setQuery(e.target.value);
  };

  const handleSelect = (option) => {
    updateData(option);
    setQuery("");
  };

  return (
    <div ref={dropdownRef}>
      <div className="relative">
        <Input
          label={label}
          nativeInputProps={{ placeholder: "Adresse, voie, commune, code postal, lieu-dit..." }}
          hintText="Si l'adresse est introuvable, sélectionnez uniquement une commune ou un code postal."
          value={query}
          onChange={handleChangeQuery}
        />
        <span className="material-icons absolute top-14 right-2 mt-[12px] text-lg">
          <RiSearchLine />
        </span>
      </div>

      <div className="relative">
        {query?.trim().length > 2 && (
          <div className="bg-white border flex flex-col absolute z-10 -top-6 w-full shadow">
            {isPending ? (
              <span className="animate-pulse p-3 text-gray-800 text-center">Chargement</span>
            ) : isError ? (
              <span className="p-3 text-red-500 text-center">Erreur lors de la recherche</span>
            ) : results.length ? (
              <AddressDropdown options={results} handleSelect={handleSelect} />
            ) : (
              <span className="p-3 text-gray-800 text-center">
                L'adresse ne s'affiche pas ? Renseignez une <strong>commune</strong> ou un <strong>code postal</strong>.
              </span>
            )}
          </div>
        )}
      </div>

      <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
}
