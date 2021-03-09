import React, { useEffect, useState, useReducer } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import YearPicker from "../components/YearPicker";
import Dropdown from "../components/Dropdown";

import Status from "./status";

import { departmentList, regionList, YOUNG_STATUS, translate, region2department, REFERENT_ROLES } from "../../../utils";

export default () => {
  const [filter, setFilter] = useState({ status: Object.keys(YOUNG_STATUS), region: "", department: "", cohort: "2021" });
  const user = useSelector((state) => state.Auth.user);

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }

  useEffect(() => {
    const status = Object.keys(YOUNG_STATUS).filter((e) => e !== "IN_PROGRESS");
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: user.department, status });
    }
    if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      updateFilter({ region: user.region, status });
    }
  }, []);

  return (
    <>
      <Row style={{}}>
        <Col md={12}>
          <Title>Volontaires</Title>
          <SubTitle>En quelques chiffres</SubTitle>
        </Col>
      </Row>
      <FiltersList>
        <FilterRegion updateFilter={updateFilter} filter={filter} />
        <FilterDepartment updateFilter={updateFilter} filter={filter} />
        <FilterWrapper>
          <YearPicker options={["2019", "2020", "2021"]} onChange={(cohort) => updateFilter({ cohort })} value={filter.cohort} />
        </FilterWrapper>
      </FiltersList>
      <Status filter={filter} />
    </>
  );
};

const FilterRegion = ({ updateFilter, filter }) => {
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
      <Dropdown onChange={(region) => updateFilter({ region })} selectedOption={filter.region} options={regionList} prelabel="Régions" />
    </FilterWrapper>
  );
};

const FilterDepartment = ({ updateFilter, filter }) => {
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
      <Dropdown onChange={(department) => updateFilter({ department })} selectedOption={filter.department} options={filteredDepartment} prelabel="Départements" />
    </FilterWrapper>
  );
};

// Title line with filters
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 10px;
`;

const SubTitle = styled.h2`
  color: #242526;
  font-size: 26px;
  margin-bottom: 10px;
  font-weight: normal;
`;
const FiltersList = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;
const FilterWrapper = styled.div`
  margin: 0 5px 10px;
`;

// Export button
const ExportButton = styled.button`
  border: 0;
  border-radius: 8px;
  padding: 7px 10px 7px 40px;
  color: #242526;
  font-size: 14px;
  font-weight: bold;
  background-image: url(${require("../../../assets/export_icon.png")});
  background-color: white;
  background-repeat: no-repeat;
  background-position: 10px center;
`;
