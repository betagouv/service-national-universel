import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import Dropdown from "./Dropdown";
import { regionList, REFERENT_ROLES } from "../../../utils";

export default ({ updateFilter, filter }) => {
  const user = useSelector((state) => state.Auth.user);
  if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return <div />;

  if (user.role === REFERENT_ROLES.REFERENT_REGION) {
    return (
      <FilterWrapper>
        <Dropdown disabled onChange={() => {}} selectedOption={filter.region} options={[]} prelabel="Régions" />
      </FilterWrapper>
    );
  }

  return (
    <FilterWrapper>
      <Dropdown onChange={(region) => updateFilter({ region })} selectedOption={filter.region} options={regionList.sort((a, b) => a.localeCompare(b))} prelabel="Régions" />
    </FilterWrapper>
  );
};

const FilterWrapper = styled.div`
  margin: 0 5px 10px;
`;
