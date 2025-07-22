import React, { ReactElement } from "react";
import cx from "classnames";
import Select, { components, GroupBase, ValueContainerProps } from "react-select";
import { HiChevronDown, HiChevronUp, HiOutlineExclamation } from "react-icons/hi";
import { BsCheckLg } from "react-icons/bs";
import { CSSObject } from "@emotion/react";

import useReactSelectTheme from "./theme";

export type SelectOption<T = string | number> = {
  value: T;
  label: string | ReactElement;
};

export type SelectProps = {
  value?: string | string[] | null;
  options?: SelectOption[];
  defaultValue?: string | null;
  className?: string;
  placeholder?: string | ReactElement;
  label?: string;
  isActive?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  error?: string;
  maxMenuHeight?: number;
  isMulti?: boolean;
  closeMenuOnSelect?: boolean;
  hideSelectedOptions?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isOpen?: boolean;
  badge?: ReactElement;
  badgePosition?: "left" | "right";
  controlCustomStyle?: CSSObject;
  menuCustomStyle?: CSSObject;
  optionCustomStyle?: CSSObject;
  onChange?: (options: any) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  noOptionsMessage?: string;
  loadOptions?: (inputValue: string, callback: (options: GroupBase<string>[]) => void) => void | Promise<GroupBase<string>[]>;
  defaultOptions?: boolean | GroupBase<string>[] | (() => Promise<GroupBase<string>[]>);
  size?: "sm" | "md" | "lg";
  menuPlacement?: "top" | "bottom";
  isOptionDisabled?: (option: SelectOption & { disabled?: boolean }) => boolean;
};

export default function SearchableDropDown(props: SelectProps) {
  const {
    options,
    isOptionDisabled,
    value,
    defaultValue,
    className,
    label,
    readOnly,
    placeholder,
    disabled = false,
    error,
    maxMenuHeight = 240,
    closeMenuOnSelect = false,
    hideSelectedOptions = false,
    isClearable = false,
    isSearchable = true,
    noOptionsMessage,
    onMenuOpen,
    onMenuClose,
    onChange,
    isOpen,
    badge,
    badgePosition = "right",
    size = "md",
    menuPlacement = "bottom",
  } = props;

  const customStyles = useReactSelectTheme(props);

  const DropdownIndicator = (props: any) => {
    return <components.DropdownIndicator {...props}>{menuPlacement === "top" ? <HiChevronUp /> : <HiChevronDown />}</components.DropdownIndicator>;
  };

  const MonoOption = (props: any) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center justify-between w-full">
          <div className={cx("w-full", props.isDisabled && "cursor-not-allowed")}>{props.label}</div>
          {props.isSelected && <BsCheckLg size={20} className="text-blue-600 my-auto" />}
        </div>
      </components.Option>
    );
  };

  const ValueContainerComponent = (props: ValueContainerProps<any, false>) => {
    if (!badge) return <components.ValueContainer {...props} />;
    if (badgePosition === "left") {
      return (
        <div className="flex grow justify-between items-center">
          {badge}
          <components.ValueContainer {...props} />
        </div>
      );
    }
    return (
      <div className="flex grow justify-between">
        <components.ValueContainer {...props} />
        {badge}
      </div>
    );
  };

  const currentComponents = {
    DropdownIndicator,
    Option: MonoOption,
    ValueContainer: ValueContainerComponent,
  };

  return (
    <div className={cx("flex flex-col gap-3 border-0", className)}>
      <div className="relative">
        <label className={`absolute top-1 left-3 z-10 text-xs font-normal ${error ? "text-red-500" : "text-gray-500"}`}>{label}</label>
        <Select
          placeholder={placeholder}
          options={options}
          noOptionsMessage={() => noOptionsMessage}
          defaultValue={defaultValue}
          maxMenuHeight={maxMenuHeight}
          isDisabled={disabled || readOnly}
          closeMenuOnSelect={closeMenuOnSelect}
          hideSelectedOptions={hideSelectedOptions}
          isClearable={isClearable}
          isSearchable={isSearchable}
          value={value}
          classNamePrefix="select"
          onChange={onChange}
          components={currentComponents}
          // @ts-ignore
          styles={customStyles}
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
          menuIsOpen={isOpen}
          menuPlacement={menuPlacement}
          autoFocus={isOpen}
          {...(isOptionDisabled ? { isOptionDisabled } : {})}
        />
        {error && <HiOutlineExclamation className="absolute top-4 right-3 z-1 text-red-500 w-5 h-5" />}
      </div>
      {error && <div className="text-[#EF4444]">{error}</div>}
    </div>
  );
}
