import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import Dropdown from "./Dropdown";
import { departmentList, region2department, REFERENT_ROLES } from "../../../utils";

export default ({ updateFilter, filter }) => {
  const user = useSelector((state) => state.Auth.user);
  const filteredDepartment = () => {
    if (!filter.region) return departmentList;
    return region2department[filter.region];
  };

  if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
    return (
      <FilterWrapper>
        <Dropdown disabled onChange={() => {}} selectedOption={filter.department} options={[]} prelabel="Départements" />
      </FilterWrapper>
    );
  }

  return (
    <FilterWrapper>
      <Dropdown
        onChange={(department) => updateFilter({ department })}
        selectedOption={filter.department}
        options={filteredDepartment().sort((a, b) => a.localeCompare(b))}
        prelabel="Départements"
      />
    </FilterWrapper>
  );
};

const FilterWrapper = styled.div`
  margin: 0 5px 10px;
`;
