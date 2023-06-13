import React from "react";

const SortOption = ({ sortOptions, paramData, setParamData }) => {
  const handleClick = (value) => {
    const param = sortOptions.find((item) => item.label === value);
    setParamData((old) => ({ ...old, sort: param }));
  };
  React.useEffect(() => {
    if (!paramData?.sort) setParamData((old) => ({ ...old, sort: sortOptions[0] }));
  }, []);
  return (
    <select className="text-gray-700" value={paramData?.sort?.label} onChange={(e) => handleClick(e.target.value)}>
      {sortOptions.map((item) => (
        <option key={item.label} value={item.label}>
          {item.label}
        </option>
      ))}
    </select>
  );
};

export default SortOption;
