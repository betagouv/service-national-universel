import React from "react";
import Select, { components, GroupBase, StylesConfig } from "react-select";
import AsyncSelect from "react-select/async";
import { HiOutlineExclamation } from "react-icons/hi";
import { BsCheckLg } from "react-icons/bs";

type CustomStyles = StylesConfig<string, boolean, GroupBase<string>>;

type OwnProps = {
  options?: GroupBase<string>[];
  value: string | null;
  defaultValue?: string | null;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  maxMenuHeight?: number;
  isMulti?: boolean;
  closeMenuOnSelect?: boolean;
  hideSelectedOptions?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  onChange: () => void;
  // async props
  isAsync?: boolean;
  noOptionsMessage?: string;
  loadOptions: (
    inputValue: string,
    callback: (options: GroupBase<string>[]) => void
  ) => void | Promise<GroupBase<string>[]>;
};

export default function SelectButton({
  options,
  value,
  defaultValue,
  label,
  placeholder,
  disabled = false,
  error,
  maxMenuHeight = 240,
  isMulti = false,
  closeMenuOnSelect = false,
  hideSelectedOptions = false,
  isClearable = false,
  isSearchable = true,
  onChange,
  // async props
  isAsync = false,
  noOptionsMessage,
  loadOptions,
}: OwnProps) {
  const paddingStyle = label ? "16px 0 0 0" : "0";

  const { Option } = components;

  const MonoOption = (props: any) => (
    <Option {...props}>
      <div className="flex justify-between">
        <label className="cursor-pointer">{props.label}</label>
        {props.isSelected && (
          <BsCheckLg size={20} color="#2563EB" className="mt-1" />
        )}
      </div>
    </Option>
  );
  const MultiOption = (props: any) => {
    return (
      <div className="flex">
        <Option {...props}>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={props.isSelected}
            onChange={() => null}
            style={{ marginRight: "10px" }}
          />{" "}
          <label className="cursor-pointer">{props.label}</label>
        </Option>
      </div>
    );
  };

  const customStyles: CustomStyles = {
    control: (styles, state) => ({
      ...styles,
      backgroundColor: disabled ? "#F9FAFB" : "white",
      border: error ? "1px solid #EF4444" : "1px solid #E5E7EB",
      boxShadow: "none",
      "&:hover": {
        border: error ? "1px solid #EF4444" : "1px solid #E5E7EB",
      },
      ...(state.isFocused && {
        outline: "solid",
        outlineColor: "#2563eb",
        outlineWidth: "2px",
        outlineOffset: "2px",
      }),
    }),
    option: (styles, { isSelected, isFocused }) => {
      return {
        ...styles,
        backgroundColor: isSelected ? "#f3f4f6" : "white",
        color: "black",
        cursor: "pointer",
        fontWeight: isSelected ? "700" : "400",
        ":hover": {
          backgroundColor: "#f3f4f6",
        },
        ...(isFocused && {
          backgroundColor: "#f3f4f6",
        }),
      };
    },
    placeholder: (styles) => {
      return {
        ...styles,
        padding: paddingStyle,
      };
    },
    input: (styles) => ({
      ...styles,
      height: "46px",
      padding: paddingStyle,
      cursor: "pointer",
    }),
    singleValue: (styles) => ({
      ...styles,
      padding: paddingStyle,
      color: disabled ? "#6B7280" : "black",
    }),
    multiValue: (styles) => ({
      ...styles,
      marginTop: label ? "16px" : "0",
      backgroundColor: "#F3F4F6",
      color: disabled ? "#6B7280" : "black",
      fontSize: "16px",
      fontWeight: "400",
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      height: "30px",
      margin: "auto",
      display: isClearable ? "block" : "none",
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      cursor: "pointer",
      marginRight: error ? "25px" : "0",
    }),
    menu: (styles) => ({
      ...styles,
      zIndex: 20,
    }),
    clearIndicator: (styles) => ({
      ...styles,
      cursor: "pointer",
      borderRadius: "10%",
      marginRight: "5px",
      padding: "2px",
      ":hover": {
        backgroundColor: "#FEE2E2",
        color: "#EF4444",
      },
    }),
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <label
          className={`absolute top-1 left-3 z-10 text-xs font-normal ${
            error ? "text-red-500" : "text-gray-500"
          }`}
        >
          {label}
        </label>
        {isAsync ? (
          <AsyncSelect
            placeholder={placeholder}
            loadOptions={loadOptions}
            defaultOptions
            cacheOptions
            noOptionsMessage={() => noOptionsMessage}
            maxMenuHeight={maxMenuHeight}
            isMulti={isMulti}
            isDisabled={disabled}
            closeMenuOnSelect={closeMenuOnSelect}
            hideSelectedOptions={hideSelectedOptions}
            isClearable={isClearable}
            isSearchable={isSearchable}
            value={value}
            onChange={onChange}
            components={
              isMulti ? { Option: MultiOption } : { Option: MonoOption }
            }
            styles={customStyles}
          />
        ) : (
          <Select
            placeholder={placeholder}
            options={options}
            defaultValue={defaultValue}
            maxMenuHeight={maxMenuHeight}
            isMulti={isMulti}
            isDisabled={disabled}
            closeMenuOnSelect={closeMenuOnSelect}
            hideSelectedOptions={hideSelectedOptions}
            isClearable={isClearable}
            isSearchable={isSearchable}
            value={value}
            className={isMulti ? "basic-multi-select" : "basic-single"}
            classNamePrefix="select"
            onChange={onChange}
            components={
              isMulti ? { Option: MultiOption } : { Option: MonoOption }
            }
            styles={customStyles}
          />
        )}
        {error && (
          <HiOutlineExclamation className="absolute top-4 right-3 z-1 text-red-500 w-5 h-5" />
        )}
      </div>
      {error && <div className="text-[#EF4444]">{error}</div>}
    </div>
  );
}
