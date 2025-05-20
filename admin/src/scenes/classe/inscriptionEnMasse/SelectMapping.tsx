import { Label, Select, SelectOption } from "@snu/ds/admin";
import React from "react";
import { HiArrowNarrowRight } from "react-icons/hi";

export type SelectMappingProps = {
  fileColumns: string[];
  expectedColumnName: string;
  className?: string;
  selectedFileColumn?: string;
  onChange: (expectedColumnName: string, fileColumn: string) => void;
};

export const SelectMapping: React.FC<SelectMappingProps> = ({ fileColumns, expectedColumnName, selectedFileColumn, className = "", onChange }) => {
  const options = fileColumns.map((column) => ({
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
            value={options.find((option) => option.value === selectedFileColumn)}
            onChange={(option: SelectOption<string | undefined>) => {
              onChange(expectedColumnName, option?.value || "");
            }}
            className="w-full"
            closeMenuOnSelect={true}
            isClearable={true}
          />
        </div>
      </div>

      <div className="w-2/12 flex justify-center">
        <HiArrowNarrowRight className="w-6 h-6 text-gray-400" />
      </div>

      <div className="w-5/12">
        <Label title="Information attendue" name="expectedField" />
        <div className="relative">
          <div className="w-full bg-white border border-green-500 rounded-md py-2 px-3 text-gray-900">{expectedColumnName}</div>
        </div>
      </div>
    </div>
  );
};
