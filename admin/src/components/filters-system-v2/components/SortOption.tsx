import { Select } from "@snu/ds/admin";
import React, { useMemo } from "react";
import { HiSortAscending } from "react-icons/hi";

interface Option {
  label: string;
  value: string;
}

interface Pagnination {
  page?: number;
  sort?: { label: string | null } | null;
}

interface Props {
  sortOptions: Option[];
  pagination?: Pagnination;
  onPaginationChange: React.Dispatch<React.SetStateAction<Pagnination>>;
  selectedFilters?: { [key: string]: { filter?: string[] } };
}

const SortOption = ({ sortOptions, pagination, onPaginationChange, selectedFilters }: Props) => {
  const [isSearching, setIsSearching] = React.useState(false);
  const [lastChoice, setLastChoice] = React.useState<Option | null>(null);

  const options = useMemo(
    () =>
      sortOptions.map((item) => ({
        value: item.label,
        label: item.label,
      })),
    [sortOptions],
  );

  React.useEffect(() => {
    if (!pagination?.sort) onPaginationChange((old) => ({ ...old, sort: sortOptions[0] }));
  }, []);

  // useEffect to check if user is searching, if yes then set sort to relevance (in the frontend, back end will handle it)
  React.useEffect(() => {
    if (selectedFilters?.searchbar?.filter?.length && selectedFilters.searchbar.filter[0] !== "") {
      setIsSearching(true);
    } else {
      if (lastChoice) onPaginationChange((old) => ({ ...old, sort: lastChoice }));
      setIsSearching(false);
    }
  }, [selectedFilters]);

  const handleClick = (value) => {
    const param = sortOptions.find((item) => item.label === value) || null;
    onPaginationChange((old) => ({ ...old, sort: param }));
    setLastChoice(param);
  };

  return (
    <div className="flex justify-center items-center text-gray-600 text-sm bg-gray-100 rounded-md px-1 cursor-pointer">
      <HiSortAscending size={16} style={{ color: "#6B7280" }} className="ml-2" />

      <Select
        placeholder="Tri des résultats"
        className="bg-gray-100 w-52"
        defaultValue={options[0].value}
        options={isSearching ? options : [{ value: "Relevance", label: "Pertinence" }, ...options]}
        value={options.find((option) => option.value === pagination?.sort?.label) || null}
        isSearchable={false}
        onChange={(option) => {
          handleClick(option.value);
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
