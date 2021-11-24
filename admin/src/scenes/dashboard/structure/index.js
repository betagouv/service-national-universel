import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import Dropdown from "../components/Dropdown";
import FilterRegion from "../components/FilterRegion";
import FilterDepartment from "../components/FilterDepartment";

import Status from "./status";

import { departmentList, regionList, region2department, REFERENT_ROLES } from "../../../utils";

export default () => {
  const [filter, setFilter] = useState();
  const user = useSelector((state) => state.Auth.user);

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }

  useEffect(() => {
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: [user.department] });
    } else if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      updateFilter({ region: [user.region] });
    } else {
      updateFilter({ region: [], department: [] });
    }
  }, []);

  return (
    <>
      <Row style={{}}>
        <Col md={6}>
          <Title>Structures</Title>
        </Col>
        <Col md={6}>
          {filter && (
            <FiltersList>
              <FilterRegion onChange={(region) => updateFilter({ region })} value={filter.region} filter={filter} />
              <FilterDepartment onChange={(department) => updateFilter({ department })} value={filter.department} filter={filter} />
            </FiltersList>
          )}
        </Col>
      </Row>
      {filter && <Status filter={filter} />}
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
const FiltersList = styled.div`
  gap: 1rem;
  flex: 1;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;
