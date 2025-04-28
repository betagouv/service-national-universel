import React from "react";
import { HiArrowNarrowRight } from "react-icons/hi";
import { IoChevronDown } from "react-icons/io5";

export type SelectMappingProps = {
  fileColumn: string;
  expectedField: string;
  expectedFieldOptions: string[];
  onChangeExpectedField: (value: string) => void;
  className?: string;
};

export const SelectMapping: React.FC<SelectMappingProps> = ({ fileColumn, expectedField, expectedFieldOptions, onChangeExpectedField, className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-5/12">
        <p className="mb-1 text-sm text-gray-500">Nom de la colonne dans votre fichier</p>
        <div className="relative">
          <button type="button" className="relative w-full bg-white border border-red-500 text-left rounded-md py-2 px-3 text-gray-900 cursor-default">
            <span className="block truncate">{fileColumn}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
              <IoChevronDown className="h-5 w-5 text-gray-400" />
            </span>
          </button>
        </div>
      </div>

      <div className="w-2/12 flex justify-center">
        <HiArrowNarrowRight className="w-6 h-6 text-gray-400" />
      </div>

      <div className="w-5/12">
        <p className="mb-1 text-sm text-gray-500">Information attendue</p>
        <div className="relative">
          <select
            value={expectedField}
            onChange={(e) => onChangeExpectedField(e.target.value)}
            className="block w-full bg-white border border-green-500 rounded-md py-2 pl-3 pr-10 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Sélectionner une option</option>
            {expectedFieldOptions.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
