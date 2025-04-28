import React from "react";
import { HiArrowNarrowRight } from "react-icons/hi";

export type SelectMappingProps = {
  fileColumn: string[];
  expectedField: string;
  className?: string;
};

export const SelectMapping: React.FC<SelectMappingProps> = ({ fileColumn, expectedField, className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-5/12">
        <p className="mb-1 text-sm text-gray-500">Nom de la colonne dans votre fichier</p>
        <div className="relative">
          <select className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            {fileColumn.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-2/12 flex justify-center">
        <HiArrowNarrowRight className="w-6 h-6 text-gray-400" />
      </div>

      <div className="w-5/12">
        <p className="mb-1 text-sm text-gray-500">Information attendue</p>
        <div className="relative">
          <div className="w-full bg-white border border-green-500 rounded-md py-2 px-3 text-gray-900">{expectedField}</div>
        </div>
      </div>
    </div>
  );
};
