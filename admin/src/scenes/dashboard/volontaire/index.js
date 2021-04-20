import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import YearPicker from "../components/YearPicker";
import FilterRegion from "../components/FilterRegion";
import FilterDepartment from "../components/FilterDepartment";

import Status from "./status";

import { YOUNG_STATUS, REFERENT_ROLES } from "../../../utils";

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
        </Col>
      </Row>
      <FiltersList>
        <FilterRegion updateFilter={updateFilter} filter={filter} />
        <FilterDepartment updateFilter={updateFilter} filter={filter} />
        <FilterWrapper>
          <YearPicker options={["2019", "2020", "2021"]} onChange={(cohort) => updateFilter({ cohort })} value={filter.cohort} />
        </FilterWrapper>
      </FiltersList>
      <SubTitle>En quelques chiffres</SubTitle>
      <Status filter={filter} />
    </>
  );
};

// Title line with filters
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 10px;
`;

const SubTitle = styled.h3`
  color: #242526;
  font-size: 24px;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
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
