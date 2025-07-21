import { GroupBase, StylesConfig } from "react-select";
import cx from "classnames";
import { SelectProps } from "./SearchableDropDown";

type CustomStyles = StylesConfig<string, boolean, GroupBase<string>>;

export default function useReactSelectTheme({
  error,
  label,
  isClearable,
  isActive,
  badge,
  disabled,
  readOnly,
  controlCustomStyle,
  menuCustomStyle,
  optionCustomStyle,
  size,
}: SelectProps) {
  const paddingStyle = label ? "16px 0 0 0" : "0";
  const disabledColor = "#F9FAFB";

  const styles: CustomStyles = {
    control: (styles, state) => ({
      ...styles,
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      boxShadow: "0 0 0 0 rgb(0 0 0 / 0.05)",
      backgroundColor: disabled ? disabledColor : "white",
      border: cx({
        "1px solid #EF4444": error,
        "2px solid #3B82F6": !error && isActive,
        "1px solid #E5E7EB": !error && !isActive,
      }),
      "&:hover": {
        border: cx({
          "1px solid #EF4444": error,
          "2px solid #3B82F6": !error && isActive,
          "1px solid #E5E7EB": !error && !isActive,
        }),
      },
      ...(state.isFocused && {
        outline: "solid",
        outlineColor: "#2563eb",
        outlineWidth: "2px",
        outlineOffset: "2px",
      }),
      borderRadius: "8px",
      ...(controlCustomStyle || {}),
      ...(size === "sm" && { minHeight: 32, height: 32 }),
      ...(size === "md" && { minHeight: 40, height: 40 }),
      ...(size === "lg" && { minHeight: 46, height: 46 }),
    }),
    option: (styles, { isSelected, isFocused, isDisabled }) => {
      return {
        ...styles,
        backgroundColor: isSelected ? (isDisabled ? disabledColor : "rgb(239 246 255)") : "white",
        color: isDisabled ? "#6B7280" : "black",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontWeight: isSelected ? "700" : "400",
        fontStyle: isDisabled ? "italic" : "normal",
        ":hover": {
          background: isDisabled ? disabledColor : "#e5e7eb",
        },
        ...(isFocused && {
          backgroundColor: isDisabled ? disabledColor : "#e5e7eb",
        }),
        ...(optionCustomStyle || {}),
      };
    },
    placeholder: (styles) => {
      return {
        ...styles,
        padding: paddingStyle,
      };
    },
    input: (styles, { isDisabled }) => ({
      ...styles,
      height: size === "sm" ? 24 : size === "md" ? 29 : 46,
      cursor: isDisabled ? "not-allowed" : "pointer",
      padding: paddingStyle,
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
    dropdownIndicator: (styles, state) => ({
      ...styles,
      cursor: disabled || readOnly ? "not-allowed" : "pointer",
      padding: 0,
      paddingRight: 12,
      paddingLeft: badge ? 6 : 12,
      color: disabled || readOnly ? "#D1D5DB" : "#6B7280",
      marginRight: error ? "25px" : "0",
      "& svg": {
        width: size === "sm" ? "16px" : "24px",
        height: size === "sm" ? "16px" : "24px",
      },
      display: state.hasValue ? "none" : "flex",
    }),
    menu: (styles) => ({
      ...styles,
      border: "none",
      boxShadow: "0px 0px 12px 0px rgba(0, 0, 0, 0.25)",
      "&:hover": {
        border: "none",
      },
      zIndex: 20,
      ...(menuCustomStyle || {}),
    }),
    menuList: (styles) => ({
      ...styles,
      minWidth: "250px",
      borderRadius: 4,
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

  return styles;
}
