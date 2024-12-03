import React, { useEffect, useState } from "react";
import { HiSortAscending } from "react-icons/hi";
import { Select } from "../..";

const OPTIONS = [
  { value: "DESC", label: "Chronologique (récent > ancien)" },
  { value: "ASC", label: "Chronologique (ancien > récent)" },
];

interface Props {
  sort: "ASC" | "DESC";
  onChange?: (sort: "ASC" | "DESC") => void;
}

const SortOption = ({ sort, onChange }: Props) => {
  const [value, setValue] = useState(sort);

  useEffect(() => {
    setValue(sort);
  }, [sort]);

  return (
    <div className="flex justify-center items-center text-gray-600 text-sm bg-gray-100 rounded-md px-1 cursor-pointer ml-auto">
      <HiSortAscending
        size={16}
        style={{ color: "#6B7280" }}
        className="ml-2"
      />

      <Select
        placeholder="Tri des résultats"
        className="bg-gray-100 w-52"
        defaultValue={value}
        options={OPTIONS}
        // @ts-ignore
        value={OPTIONS.find((option) => option.value === value)}
        isSearchable={false}
        onChange={(option) => {
          onChange?.(option.value);
        }}
        closeMenuOnSelect={true}
        size="sm"
        controlCustomStyle={{
          background: "rgb(243 244 246)",
          border: "none",
          boxShadow: "none",
          outline: "none",
          "&:hover": {
            border: "none",
          },
        }}
      />
    </div>
  );
};

export default SortOption;
