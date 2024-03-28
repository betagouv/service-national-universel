import React from "react";
import Select from "react-select/creatable";
import ErrorMessage from "./dsfr/forms/ErrorMessage";

const CreatableSelect = ({ label, options, value, onChange, placeholder = "Sélectionner une option", error = "", onCreateOption = null, correction = "" }) => {
  return (
    <div className="my-2 text-[#161616]" style={{ fontFamily: "Marianne" }}>
      <label className={`my-2 ${correction || error ? "text-[#CE0500]" : "text-[#161616]}"}`}>{label}</label>
      <Select
        styles={customStyles}
        value={options.find((option) => option.value === value) || { label: value }}
        onChange={(option) => onChange(option.value)}
        options={options}
        isSearchable
        placeholder={placeholder}
        noOptionsMessage={() => "Pas d'option."}
        formatCreateLabel={(inputValue) => `Ajoutez manuellement : ${inputValue}`}
        onCreateOption={onCreateOption}
        error={correction || error}
      />
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
    };
  },
  control: (provided, state) => {
    return {
      ...provided,
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

export default CreatableSelect;
