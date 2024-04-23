import { GroupBase, StylesConfig } from "react-select";
import { SelectProps } from "./Select";

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
}: SelectProps) {
  const paddingStyle = label ? "16px 0 0 0" : "0";

  const styles: CustomStyles = {
    control: (styles, state) => ({
      ...styles,
      cursor: "pointer",
      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      backgroundColor: disabled ? "#F9FAFB" : "white",
      border: error
        ? "1px solid #EF4444"
        : isActive
          ? "1px solid #3B82F6"
          : "1px solid #E5E7EB",
      "&:hover": {
        border: error
          ? "1px solid #EF4444"
          : isActive
            ? "1px solid #3B82F6"
            : "1px solid #E5E7EB",
      },
      ...(state.isFocused && {
        outline: "solid",
        outlineColor: "#2563eb",
        outlineWidth: "2px",
        outlineOffset: "2px",
      }),
      borderRadius: "8px",
      ...(controlCustomStyle || {}),
    }),
    option: (styles, { isSelected, isFocused }) => {
      return {
        ...styles,
        backgroundColor: isSelected ? "rgb(239 246 255)" : "white",
        color: "black",
        cursor: "pointer",
        fontWeight: isSelected ? "700" : "400",
        ":hover": {
          backgroundColor: "rgb(239 246 255)",
        },
        ...(isFocused && {
          backgroundColor: "rgb(239 246 255)",
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
      cursor: "pointer",
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
    dropdownIndicator: (styles) => ({
      ...styles,
      cursor: "pointer",
      padding: 0,
      paddingRight: 12,
      paddingLeft: badge ? 6 : 12,
      color: disabled || readOnly ? "#D1D5DB" : "#6B7280",
      marginRight: error ? "25px" : "0",
      "& svg": {
        width: "24px",
        height: "24px",
      },
    }),
    menu: (styles) => ({
      ...styles,
      zIndex: 20,
    }),
    menuList: (styles) => ({
      ...styles,
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
