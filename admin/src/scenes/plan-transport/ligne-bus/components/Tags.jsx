import React from "react";
import Select from "react-select/creatable";
import { AiOutlinePlus } from "react-icons/ai";
import { IoCloseOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { ROLES } from "snu-lib";

export default function Tags({ placeholder, options, onChange, onCreateOption, values, isLoading, onDeleteOption }) {
  const user = useSelector((state) => state.Auth.user);
  return (
    <div className="flex flex-col gap-3">
      {user.role === ROLES.ADMIN && (
        <Select
          styles={customStyles}
          theme={(theme) => ({
            ...theme,
            borderRadius: 6,
          })}
          value={null}
          onChange={(option) => onChange(option.value)}
          options={options}
          isSearchable
          isDisabled={isLoading}
          placeholder={placeholder}
          noOptionsMessage={() => "Aucune options"}
          formatCreateLabel={(inputValue) => {
            return (
              <div className="flex items-center gap-2">
                <AiOutlinePlus className="h-5 w-5 text-gray-400" />
                <div className="text-sm leading-5 text-gray-700">
                  Créer <b>&quot;{inputValue}&quot;</b>
                </div>
              </div>
            );
          }}
          onCreateOption={onCreateOption}
        />
      )}
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <div key={index} className={`flex max-w-[170px] items-center gap-2 rounded-lg bg-[#E8EDFF] p-2 ${isLoading && "opacity-70"}`}>
            <div className="flex-1 text-xs leading-4 text-[#0063CB]">{options.find((option) => option.value === value)?.label}</div>
            {user.role === ROLES.ADMIN && <IoCloseOutline className="cursor-pointer text-lg text-[#3B82F6]" onClick={() => !isLoading && onDeleteOption(value)} />}
          </div>
        ))}
      </div>
    </div>
  );
}

const customStyles = {
  indicatorSeparator: () => {
    return { display: "none" };
  },
  dropdownIndicator: () => {
    return { display: "none" };
  },
};
