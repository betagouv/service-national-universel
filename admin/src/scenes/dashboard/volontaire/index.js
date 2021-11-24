import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import FilterCohort from "../components/FilterCohort";
import FilterRegion from "../components/FilterRegion";
import FilterDepartment from "../components/FilterDepartment";
import SubTab from "./status";

import { YOUNG_STATUS, ROLES } from "../../../utils";

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [filter, setFilter] = useState();

  function updateFilter(n) {
    setFilter({
      ...(filter || { status: Object.keys(YOUNG_STATUS), region: [], department: [], cohort: filter?.cohort || ["2021"] }),
      ...n,
    });
  }

  useEffect(() => {
    const cohort = ["2021"];
    const status = Object.keys(YOUNG_STATUS).filter((e) => e !== "IN_PROGRESS");
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: [user.department], status, cohort });
    } else if (user.role === ROLES.REFERENT_REGION) {
      updateFilter({ region: [user.region], status, cohort });
    } else {
      updateFilter({ cohort });
    }
  }, []);

  return (
    <>
      <Row style={{}}>
        <Col md={3}>
          <Title>Volontaires</Title>
        </Col>
        <Col md={9}>
          {filter ? (
            <>
              <FiltersList>
                <FilterRegion onChange={(region) => updateFilter({ region })} value={filter.region} filter={filter} />
                <FilterDepartment onChange={(department) => updateFilter({ department })} value={filter.department} filter={filter} />
                <FilterWrapper>
                  <FilterCohort
                    options={[
                      { value: "2019", label: "2019" },
                      { value: "2020", label: "2020" },
                      { value: "2021", label: "2021" },
                      { value: "Février 2022", label: "Février 2022" },
                      { value: "Juin 2022", label: "Juin 2022" },
                      { value: "Juillet 2022", label: "Juillet 2022" },
                    ]}
                    onChange={(cohort) => updateFilter({ cohort })}
                    value={filter.cohort}
                  />
                </FilterWrapper>
              </FiltersList>
            </>
          ) : null}
        </Col>
      </Row>
      {filter ? <SubTab filter={filter} /> : null}
    </>
  );
};

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
const FilterWrapper = styled.div`
  margin: 0 5px 10px;
`;
