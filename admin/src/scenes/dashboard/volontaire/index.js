import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import YearPicker from "../components/YearPicker";
import FilterRegion from "../components/FilterRegion";
import FilterDepartment from "../components/FilterDepartment";
import SubTab from "./status";

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
        <Col md={3}>
          <Title>Volontaires</Title>
        </Col>
        <Col md={9}>
          {filter ? (
            <>
              <FiltersList>
                <FilterRegion updateFilter={updateFilter} filter={filter} />
                <FilterDepartment updateFilter={updateFilter} filter={filter} />
                <FilterWrapper>
                  <YearPicker
                    options={[
                      { key: "2019", label: "2019" },
                      { key: "2020", label: "2020" },
                      { key: "2021", label: "2021" },
                      { key: "Février 2022", label: "Février 2022" },
                      { key: "Juin 2022", label: "Juin 2022" },
                      { key: "Juillet 2022", label: "Juillet 2022" },
                      { key: "", label: "Toutes" },
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
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;
const FilterWrapper = styled.div`
  margin: 0 5px 10px;
`;
