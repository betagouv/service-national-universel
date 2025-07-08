import React from "react";
import { HiOutlineSortAscending } from "react-icons/hi";
import DropdownButton from "./DropdownButton";
import FilterDropdown from "./FilterDropdown";

const SortDropdown = ({ buttonClass = "rounded-md", items, className = "" }) => (
  <FilterDropdown name="Trier" icon={<HiOutlineSortAscending />} buttonClass={buttonClass} className={className}>
    {items.map(({ name, handleClick, isActive }) => (
      <DropdownButton key={name} name={name} handleClick={handleClick} isActive={isActive} />
    ))}
  </FilterDropdown>
);

export default SortDropdown;
