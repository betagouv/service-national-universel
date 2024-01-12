import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import ErrorMessage from "./ErrorMessage";

const SearchableSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Sélectionner une option",
  noOptionsMessage = "Pas d'option",
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
  option: (provided, state) => {
    return {
      ...provided,
      paddingLeft: 24,
      color: "#161616",
      fontWeight: state.isSelected ? 700 : 400,
      backgroundColor: state.isFocused ? "#EEEEEE" : "tranparent",
      cursor: "pointer",
    };
  },
  control: (provided, state) => {
    return {
      ...provided,
      marginTop: 8,
      border: "none",
      borderRadius: 0,
      borderColor: "#EEEEEE",
      ["&:hover"]: {
        borderColor: "#EEEEEE",
        borderBottom: state.selectProps.error ? "2px solid #CE0500" : "2px solid #3A3A3A",
      },
      boxShadow: "0 0 0 0 #EEEEEE",
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      borderBottom: state.selectProps.error ? "2px solid #CE0500" : "2px solid #3A3A3A",
      background: "#EEEEEE",
      height: 40,
      paddingLeft: 24,
      cursor: "pointer",
    };
  },
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
