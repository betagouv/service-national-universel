import React from "react";
import FilterIcon from "../../../../assets/icons/Filter";

export default function CustomFilters({ customFilterOptions, setCustomFilter, customFilter }) {
  return (
    <div className="flex flex-wrap gap-4">
      {customFilterOptions.map((filter) => (
        <FilterButton key={filter.label} filter={filter} setCustomFilter={setCustomFilter} customFilter={customFilter} />
      ))}
    </div>
  );
}

function FilterButton({ filter, setCustomFilter, customFilter }) {
  const checked = filter.label === customFilter?.label;

  function handleChange() {
    if (checked) return setCustomFilter({ label: "", value: null });
    return setCustomFilter(filter);
  }

  return (
    <label className={`text-blue-500 py-2 px-3 m-0 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-slate-50 ${checked && "bg-blue-50"}`}>
      <FilterIcon className="fill-blue-300" />
      {filter.label}
      <input type="checkbox" checked={checked} onChange={() => handleChange()} className="hidden" />
    </label>
  );
}
