import React, { useCallback, useEffect, useRef, useState } from "react";
import { RiSearchLine } from "react-icons/ri";
import { toastr } from "react-redux-toastr";
import { Input } from "@snu/ds/dsfr";
import { debounce } from "@/utils";

const Dropdown = ({ loading, options, handleSelect, hint }) => (
  <div className="relative">
    <div className="bg-white border flex flex-col absolute z-10 -top-6 w-full shadow">
      {loading ? (
        <span className="p-3 text-center text-[#161616] animate-pulse">Chargement...</span>
      ) : options.length ? (
        options.map((option) => (
          <button key={option.label} onClick={() => handleSelect(option)} className="pl-4 py-2.5 hover:!bg-[#EEEEEE]  text-[#161616] w-full flex justify-between">
            <span className="text-left">{option.label}</span>
          </button>
        ))
      ) : (
        <span className="p-3 text-gray-800 text-center">{hint}</span>
      )}
    </div>
  </div>
);

export default function AsyncCombobox({ label, hint = "Aucun résultat.", placeholder = null, getOptions, value, onChange, errorMessage }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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

  const handleFocus = () => {
    onChange(null);
    if (query.length > 0) setOpen(true);
  };

  const handleChangeQuery = async (e) => {
    if (query.length) setOpen(true);
    setOptions([]);
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.length > 1) {
      debouncedOptions(newQuery);
    }
  };

  const handleSelect = (option) => {
    onChange(option);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={dropdownRef}>
      <div className="relative ">
        <Input
          label={label}
          state={errorMessage && "error"}
          stateRelatedMessage={errorMessage}
          nativeInputProps={{
            value: query || value?.label || "",
            placeholder,
            onChange: (e) => handleChangeQuery(e),
            onFocus: handleFocus,
          }}
        />
        <span className="material-icons absolute top-8 right-2 mt-[12px] text-lg">
          <RiSearchLine />
        </span>
      </div>
      {open && <Dropdown options={options} handleSelect={handleSelect} loading={loading} hint={hint} />}
    </div>
  );
}
