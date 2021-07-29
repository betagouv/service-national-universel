import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import YearPicker from "../components/YearPicker";
import FilterRegion from "../components/FilterRegion";
import FilterDepartment from "../components/FilterDepartment";

import Status from "./status";

import { YOUNG_STATUS, ROLES } from "../../../utils";

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [filter, setFilter] = useState();

  function updateFilter(n) {
    setFilter({ ...(filter || { status: Object.keys(YOUNG_STATUS), region: "", department: "", cohort: "2021" }), ...n });
  }

  useEffect(() => {
    const cohort = "2021";
    const status = Object.keys(YOUNG_STATUS).filter((e) => e !== "IN_PROGRESS");
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: user.department, status, cohort });
    } else if (user.role === ROLES.REFERENT_REGION) {
      updateFilter({ region: user.region, status, cohort });
    } else {
      updateFilter({ cohort });
    }
  }, []);

  return (
    <>
      <Row style={{}}>
        <Col md={12}>
          <Title>Volontaires</Title>
        </Col>
      </Row>
      {filter ? (
        <>
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
      ) : null}
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
