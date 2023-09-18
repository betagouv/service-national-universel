import React from "react";
import { HiSortAscending } from "react-icons/hi";

const SortOption = ({ sortOptions, paramData, setParamData, selectedFilters }) => {
  const [isSearching, setIsSearching] = React.useState(false);
  const [lastChoice, setLastChoice] = React.useState(null);
  const handleClick = (value) => {
    const param = sortOptions.find((item) => item.label === value);
    setParamData((old) => ({ ...old, sort: param }));
    setLastChoice(param);
  };
  React.useEffect(() => {
    if (!paramData?.sort) setParamData((old) => ({ ...old, sort: sortOptions[0] }));
  }, []);

  // useEffect to check if user is searching, if yes then set sort to relevance (in the frontend, back end will handle it)
  React.useEffect(() => {
    if (selectedFilters?.searchbar?.filter?.length > 0 && selectedFilters.searchbar.filter[0] !== "") setIsSearching(true);
    else {
      if (lastChoice) setParamData((old) => ({ ...old, sort: lastChoice }));
      setIsSearching(false);
    }
  }, [selectedFilters]);

  return (
    <div className="flex justify-center items-center text-gray-600 text-sm bg-gray-100 rounded-md px-1 cursor-pointer">
      <HiSortAscending size={16} style={{ color: "#6B7280" }} className="ml-2" />
      <select className="text-gray-600 text-xs min-w-fit bg-gray-100 rounded-md pb-1 cursor-pointer" value={paramData?.sort?.label} onChange={(e) => handleClick(e.target.value)}>
        {isSearching ? (
          <option value="Relevance">Pertinence</option>
        ) : (
          <>
            {sortOptions.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};

export default SortOption;
