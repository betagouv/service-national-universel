import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import ErrorMessage from "./ErrorMessage";

const SearchableSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Sélectionner une option",
  noOptionsMessage = "Pas d'option.",
  error = "",
  correction = "",
  isDebounced = false,
}) => {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const timeoutId = useRef(null);

  const handleClearDebounce = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
  };

  const handleInputChange = (value) => {
    if (isDebounced) {
      handleClearDebounce();
      timeoutId.current = setTimeout(() => {
        if (value && value.length > 1) {
          const searchedOptions = options.filter((option) => option.value.toLowerCase().trim().includes(value.toLowerCase().trim()));
          setFilteredOptions(searchedOptions);
        } else {
          setFilteredOptions([]);
        }
      }, 300);
    }
  };

  useEffect(
    () => () => {
      handleClearDebounce();
      setFilteredOptions([]);
    },
    [],
  );

  return (
    <div className="text-[#161616]" style={{ fontFamily: "Marianne" }}>
      <label className={`w-full my-2 ${correction || error ? "text-[#CE0500]" : "text-[#161616]}"}`}>
        {label}
        <Select
          styles={customStyles}
          value={options.find((option) => option.value === value)}
          onChange={(option) => onChange(option.value)}
          options={isDebounced ? filteredOptions : options}
          isSearchable
          placeholder={placeholder}
          noOptionsMessage={() => noOptionsMessage}
          error={correction || error}
          onInputChange={handleInputChange}
          onKeyDown={handleClearDebounce}
        />
      </label>
      <ErrorMessage>{error}</ErrorMessage>
      <ErrorMessage>{correction}</ErrorMessage>
    </div>
  );
};

const customStyles = {
  placeholder: (provided) => ({
    ...provided,
    color: "var(--text-mention-grey)",
    fontStyle: "italic",
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: "var(--grey-50-1000)",
  }),
  option: (provided, state) => ({
    ...provided,
    paddingLeft: 24,
    color: "var(--grey-50-1000)",
    fontWeight: state.isSelected ? 700 : 400,
    backgroundColor: state.isFocused ? "var(--grey-950-100)" : "tranparent",
    cursor: "pointer",
  }),
  // Blue DSFR Focus #0a76f6
  control: (provided, state) => ({
    ...provided,
    background: "var(--grey-950-100)",
    borderRadius: 0,
    border: "none",
    borderColor: "var(--grey-950-100)",
    boxShadow: "0 0 0 0 #EEEEEE",
    ["&:hover"]: {
      borderColor: "var(--grey-950-100)",
      borderBottom: state.selectProps.error ? "2px solid var(--error-425-625)" : "2px solid var(--grey-200-850)",
    },
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottom: state.selectProps.error ? "2px solid var(--error-425-625)" : "2px solid var(--grey-200-850)",
    cursor: "pointer",
    height: 40,
    marginTop: 8,
    paddingLeft: 16,
    transition: "none",
    ...(state.isFocused
      ? {
          outlineOffset: "2px !important",
          outlineWidth: "2px !important",
          outlineStyle: "solid !important",
          outlineColor: "#0a76f6 !important",
        }
      : {}),
  }),
  singleValue: (provided) => {
    return { ...provided, margin: 0, padding: 0 };
  },
  input: (provided) => {
    return { ...provided, margin: 0, padding: 0 };
  },
  valueContainer: (provided) => {
    return { ...provided, margin: 0, padding: 0 };
  },
  menu: (provided) => {
    return { ...provided, margin: 0, padding: 0 };
  },
  indicatorSeparator: () => {
    return { display: "none" };
  },
};

export default SearchableSelect;
