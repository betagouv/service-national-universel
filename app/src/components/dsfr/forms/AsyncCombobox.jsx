import React, { useCallback, useEffect, useRef, useState } from "react";
import { RiLoader2Line, RiSearchLine } from "react-icons/ri";
import { toastr } from "react-redux-toastr";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import { debounce } from "@/utils";

export default function AsyncCombobox({ label, hint, getOptions, value, onChange, error }) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setQuery("");
        setOptions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setQuery("");
        setOptions([]);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const debouncedOptions = useCallback(
    debounce(async (query) => {
      try {
        setLoading(true);
        const { options, error } = await getOptions(query);
        if (error) {
          toastr.error("Erreur", `Une erreur est survenue lors de la recherche : ${error}`, { timeOut: 10_000 });
          setOptions([]);
          return;
        }
        if (options) {
          setOptions(options);
          return;
        }
      } catch (e) {
        console.error("🚀 ~ file: AsyncCombobox.jsx:54 ~ handleChangeQuery ~ e:", e);
      } finally {
        setLoading(false);
      }
    }, 500),
    [],
  );

  const handleChangeQuery = async (e) => {
    const query = e.target.value;
    setQuery(query);
    if (query.trim().length < 3) return;
    debouncedOptions(query);
  };

  const handleSelect = (option) => {
    onChange(option);
    setQuery("");
    setOptions([]);
  };

  return (
    <div ref={dropdownRef}>
      <label className="flex flex-col gap-1">
        {label}
        <div className="relative">
          <input
            type="text"
            value={query || value?.label || ""}
            onChange={(e) => handleChangeQuery(e)}
            onClick={() => {
              setQuery("");
              onChange(null);
            }}
            className="w-[100%] border-b-2 border-gray-800 bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 pr-5"
          />
          <span className="material-icons absolute right-5 mt-[12px] text-lg">
            <RiSearchLine />
          </span>
        </div>
      </label>

      {query?.trim().length > 2 && <Dropdown options={options} handleSelect={handleSelect} loading={loading} hint={hint} />}

      <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
}

function Dropdown({ loading, options, handleSelect, hint }) {
  return (
    <div className="relative">
      <div className="bg-white border flex flex-col absolute z-10 -top-2 w-full shadow">
        {loading ? (
          <div className="w-full p-3 flex gap-2 items-center justify-center text-gray-800 animate-pulse">
            <RiLoader2Line className="animate-spin text-lg" />
            <p>Chargement...</p>
          </div>
        ) : options.length ? (
          options.map((option) => (
            <button key={option.label} onClick={() => handleSelect(option)} className="p-2 hover:bg-blue-france-sun-113 hover:text-white w-full flex justify-between">
              <p className="text-left">{option.label}</p>
            </button>
          ))
        ) : (
          <p className="p-3 text-gray-800 text-center">{hint || "Aucun résultat."}</p>
        )}
      </div>
    </div>
  );
}
