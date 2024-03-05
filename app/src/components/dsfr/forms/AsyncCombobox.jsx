import React, { useCallback, useEffect, useRef, useState } from "react";
import { RiSearchLine } from "react-icons/ri";
import { toastr } from "react-redux-toastr";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import { debounce } from "@/utils";

export default function AsyncCombobox({ label, hint = "Aucun résultat.", getOptions, value, onChange, errorMessage }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const debouncedOptions = useCallback(
    debounce(async (query) => {
      try {
        setLoading(true);
        const options = await getOptions(query);
        if (options?.length) {
          setOptions(options);
        }
      } catch (e) {
        toastr.error("Erreur", "Une erreur est survenue lors de la recherche", { timeOut: 10_000 });
      } finally {
        setLoading(false);
      }
    }, 300),
    [],
  );

  function handleFocus() {
    setQuery("");
    onChange(null);
    setOpen(true);
  }

  const handleChangeQuery = async (e) => {
    setOptions([]);
    const query = e.target.value;
    setQuery(query);
    if (query.length > 1) {
      debouncedOptions(query);
    }
  };

  const handleSelect = (option) => {
    onChange(option);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={dropdownRef}>
      <label className="flex flex-col gap-1">
        {label}
        <div className="relative border-b-2 border-gray-800 bg-[#EEEEEE] rounded-tl rounded-tr">
          <input
            type="text"
            value={query || value?.label || ""}
            onChange={(e) => handleChangeQuery(e)}
            onFocus={handleFocus}
            className="w-[100%] border-b-2 border-gray-800 bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 pr-5"
          />
          <span className="material-icons absolute right-5 mt-[12px] text-lg">
            <RiSearchLine />
          </span>
        </div>
      </label>
      {open && <Dropdown options={options} handleSelect={handleSelect} loading={loading} hint={hint} />}
      <ErrorMessage>{errorMessage}</ErrorMessage>
    </div>
  );
}

function Dropdown({ loading, options, handleSelect, hint }) {
  return (
    <div className="relative">
      <div className="bg-white border flex flex-col absolute z-10 -top-2 w-full shadow">
        {loading ? (
          <span className="p-3 text-center text-[#161616] animate-pulse">Chargement...</span>
        ) : options.length ? (
          options.map((option) => (
            <button key={option.label} onClick={() => handleSelect(option)} className="pl-10 py-2.5 hover:!bg-[#EEEEEE]  text-[#161616] w-full flex justify-between">
              <span className="text-left">{option.label}</span>
            </button>
          ))
        ) : (
          <span className="p-3 text-gray-800 text-center">{hint}</span>
        )}
      </div>
    </div>
  );
}
