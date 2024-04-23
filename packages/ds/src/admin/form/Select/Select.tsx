import React, { ReactElement, useEffect, useState } from "react";
import Select, {
  components,
  GroupBase,
  ValueContainerProps,
} from "react-select";
import AsyncSelect from "react-select/async";
import { HiChevronDown, HiOutlineExclamation } from "react-icons/hi";
import { BsCheckLg } from "react-icons/bs";
import { CSSObject } from "@emotion/react";

import useReactSelectTheme from "./theme";

export type SelectOption = { value: string; label: string | ReactElement };

export type SelectProps = {
  // Fix type to allow only string and string[]
  value: string | SelectOption | SelectOption[] | null;
  options?: SelectOption[];
  defaultValue?: string | null;
  className?: string;
  placeholder?: string;
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
  controlCustomStyle?: CSSObject;
  onChange?: (options: any) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  // async props
  isAsync?: boolean;
  noOptionsMessage?: string;
  loadOptions?: (
    inputValue: string,
    callback: (options: GroupBase<string>[]) => void
  ) => void | Promise<GroupBase<string>[]>;
  defaultOptions?:
    | boolean
    | GroupBase<string>[]
    | (() => Promise<GroupBase<string>[]>);
};

export default function SelectButton(props: SelectProps) {
  const {
    options,
    value,
    defaultValue,
    className,
    label,
    readOnly,
    placeholder,
    disabled = false,
    error,
    maxMenuHeight = 240,
    isMulti = false,
    closeMenuOnSelect = false,
    hideSelectedOptions = false,
    isClearable = false,
    isSearchable = true,
    onMenuOpen,
    onMenuClose,
    onChange,
    // async props
    isAsync = false,
    noOptionsMessage,
    loadOptions,
    defaultOptions = true,
    isOpen,
    badge,
  } = props;

  const customStyles = useReactSelectTheme(props);

  const [defaultOpts, setDefaultOpts] = useState<
    boolean | GroupBase<string>[] | undefined
  >(true);

  const DropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <HiChevronDown />
      </components.DropdownIndicator>
    );
  };

  const MonoOption = (props: any) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center justify-between w-full">
          <div className="w-full cursor-pointer">{props.label}</div>
          {props.isSelected && (
            <BsCheckLg size={20} className="text-gray-600 my-auto" />
          )}
        </div>
      </components.Option>
    );
  };
  const MultiOption = (props: any) => {
    return (
      <div className="flex">
        <components.Option {...props}>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={props.isSelected}
            onChange={() => null}
            style={{ marginRight: "10px" }}
          />{" "}
          <label className="cursor-pointer">{props.label}</label>
        </components.Option>
      </div>
    );
  };
  const ValueContainerComponent = (props: ValueContainerProps<any, false>) => {
    if (!badge) return <components.ValueContainer {...props} />;
    return (
      <div className="flex grow justify-between">
        <components.ValueContainer {...props} />
        {badge}
      </div>
    );
  };

  useEffect(() => {
    if (typeof defaultOptions === "function") {
      (async () => {
        const data = await defaultOptions();
        setDefaultOpts(data);
      })();
    } else {
      setDefaultOpts(defaultOptions);
    }
  }, [defaultOptions]);

  const currentComponents = isMulti
    ? {
        DropdownIndicator,
        Option: MultiOption,
        ValueContainer: ValueContainerComponent,
      }
    : {
        DropdownIndicator,
        Option: MonoOption,
        ValueContainer: ValueContainerComponent,
      };

  return (
    <div className={"flex flex-col gap-3 border-0 " + className}>
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
            defaultOptions={defaultOpts}
            cacheOptions
            noOptionsMessage={() => noOptionsMessage}
            maxMenuHeight={maxMenuHeight}
            isMulti={isMulti}
            isDisabled={disabled || readOnly}
            closeMenuOnSelect={closeMenuOnSelect}
            hideSelectedOptions={hideSelectedOptions}
            isClearable={isClearable}
            isSearchable={isSearchable}
            value={value}
            onChange={onChange}
            components={currentComponents}
            // @ts-ignore
            styles={customStyles}
            onMenuOpen={onMenuOpen}
            onMenuClose={onMenuClose}
            menuIsOpen={isOpen}
          />
        ) : (
          <Select
            placeholder={placeholder}
            options={options}
            noOptionsMessage={() => noOptionsMessage}
            defaultValue={defaultValue}
            maxMenuHeight={maxMenuHeight}
            isMulti={isMulti}
            isDisabled={disabled || readOnly}
            closeMenuOnSelect={closeMenuOnSelect}
            hideSelectedOptions={hideSelectedOptions}
            isClearable={isClearable}
            isSearchable={isSearchable}
            value={value}
            className={isMulti ? "basic-multi-select" : "basic-single"}
            classNamePrefix="select"
            onChange={onChange}
            components={currentComponents}
            // @ts-ignore
            styles={customStyles}
            onMenuOpen={onMenuOpen}
            onMenuClose={onMenuClose}
            menuIsOpen={isOpen}
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
