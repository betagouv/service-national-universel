import React, { useEffect, useRef, useState } from "react";
import { RiSearchLine } from "react-icons/ri";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";

export default function Combobox({ label, hint = "Aucun résultat.", options, value, loading = false, onChangeQuery, onChange, errorMessage }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState();
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

  function handleFocus() {
    setQuery("");
    onChange(null);
    setOpen(true);
  }

  const handleChange = (e) => {
    const query = e.target.value;
    setQuery(query);
    onChangeQuery(query);
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
        <div className="relative">
          <input
            type="text"
            value={query || value?.label || ""}
            onChange={handleChange}
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
          <p className="p-3 text-center text-gray-800 animate-pulse">Chargement...</p>
        ) : options.length ? (
          options.map((option) => (
            <button key={option.label} onClick={() => handleSelect(option)} className="px-3 py-2.5 hover:bg-blue-france-sun-113 hover:text-white w-full flex justify-between">
              <p className="text-left">{option.label}</p>
            </button>
          ))
        ) : (
          <p className="p-3 text-gray-800 text-center">{hint}</p>
        )}
      </div>
    </div>
  );
}
