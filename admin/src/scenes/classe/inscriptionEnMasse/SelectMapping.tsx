import React, { useState } from "react";
import { HiArrowNarrowRight } from "react-icons/hi";
import { Label, Select, SelectOption } from "@snu/ds/admin";

export type SelectMappingProps = {
  fileColumn: string[];
  expectedField: string;
  className?: string;
};

export const SelectMapping: React.FC<SelectMappingProps> = ({ fileColumn, expectedField, className = "" }) => {
  const [selectedColumn, setSelectedColumn] = useState(fileColumn[0] || "");

  const options = fileColumn.map((column) => ({
    value: column,
    label: column,
  }));

  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-5/12">
        <Label title="Nom de la colonne dans votre fichier" name="fileColumn" />
        <div className="relative">
          <Select
            options={options}
            value={options.find((option) => option.value === selectedColumn)}
            onChange={(option: SelectOption<string>) => setSelectedColumn(option.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="w-2/12 flex justify-center">
        <HiArrowNarrowRight className="w-6 h-6 text-gray-400" />
      </div>

      <div className="w-5/12">
        <Label title="Information attendue" name="expectedField" />
        <div className="relative">
          <div className="w-full bg-white border border-green-500 rounded-md py-2 px-3 text-gray-900">{expectedField}</div>
        </div>
      </div>
    </div>
  );
};
