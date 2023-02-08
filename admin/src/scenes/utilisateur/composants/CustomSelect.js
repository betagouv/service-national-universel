import React from "react";
import ReactSelect from "react-select";

// select using react-select with the possibility of chosing multiple values. Design close to new field design
const isEmpty = (value) => {
  if (!value) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
};

const CustomSelect = ({
  ref = null,
  onChange,
  readOnly,
  options,
  value,
  isMulti = false,
  placeholder,
  noOptionsMessage = "Aucune option",
  error,
  label,
  className,
  isClearable,
}) => {
  return (
    <div className={`relative ${className}`}>
      <label className="absolute top-[10px] left-[12px] z-[1] text-[12px] leading-[16px] text-[#6B7280]">{label}</label>
      <ReactSelect
        isClearable={isClearable}
        isDisabled={readOnly}
        ref={ref}
        noOptionsMessage={() => noOptionsMessage}
        styles={{
          dropdownIndicator: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
          placeholder: (styles) => ({ ...styles, color: error ? "red" : "black", display: isEmpty(value) && readOnly ? "none" : "inherited" }),
          control: (styles) => ({
            ...styles,
            borderColor: "#D1D5DB",
            backgroundColor: "white",
            paddingTop: isEmpty(value) && readOnly ? "0px" : "20px",
          }),

          singleValue: (styles) => ({ ...styles, color: "black" }),
          valueContainer: (styles) => ({ ...styles, padding: "7px 8px" }),
          multiValueRemove: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
          indicatorsContainer: (provided, { isDisabled }) => ({ ...provided, display: isDisabled ? "none" : "flex" }),
        }}
        options={options}
        placeholder={placeholder}
        onChange={(val) => (isMulti ? onChange(val.map((c) => c.value)) : onChange(val))}
        value={isMulti ? options.filter((c) => value.includes(c.value)) : options.find((c) => c.value === value)}
        isMulti={isMulti}
      />
    </div>
  );
};

export default CustomSelect;
