import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import Dropdown from "./Dropdown";
import { academyList, ROLES } from "../../../utils";

export default ({ updateFilter, filter }) => {
  const user = useSelector((state) => state.Auth.user);
  if (user.role !== ROLES.ADMIN) return <div />;

  return (
    <FilterWrapper>
      <Dropdown onChange={(academy) => updateFilter({ academy })} selectedOption={filter.academy} options={academyList.sort((a, b) => a.localeCompare(b))} prelabel="Académie" />
    </FilterWrapper>
  );
};

const FilterWrapper = styled.div`
  margin: 0 5px 10px;
`;
