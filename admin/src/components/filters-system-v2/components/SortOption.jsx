import React from "react";
import SortAscending from "../../../assets/icons/SortAscending";

const SortOption = ({ sortOptions, paramData, setParamData }) => {
  const handleClick = (value) => {
    const param = sortOptions.find((item) => item.label === value);
    setParamData((old) => ({ ...old, sort: param }));
  };
  React.useEffect(() => {
    if (!paramData?.sort) setParamData((old) => ({ ...old, sort: sortOptions[0] }));
  }, []);
  return (
    <div className="flex justify-center items-center text-gray-600 text-xs bg-gray-100 rounded-md px-1">
      <SortAscending />
      <select className="text-gray-600 text-xs min-w-fit bg-gray-100 rounded-md pb-1" value={paramData?.sort?.label} onChange={(e) => handleClick(e.target.value)}>
        {sortOptions.map((item) => (
          <option key={item.label} value={item.label}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortOption;
