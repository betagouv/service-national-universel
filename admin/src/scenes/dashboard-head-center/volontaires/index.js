import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import MultiSelect from "../../dashboard/components/MultiSelect";
import Status from "./status";
import { YOUNG_STATUS, REFERENT_ROLES } from "../../../utils";

export default function Index() {
  const [filter, setFilter] = useState();
  const user = useSelector((state) => state.Auth.user);

  function updateFilter(n) {
    setFilter({ ...(filter || { status: Object.keys(YOUNG_STATUS), region: [], department: [], cohort: ["2021"] }), ...n });
  }

  useEffect(() => {
    const status = Object.keys(YOUNG_STATUS).filter((e) => !["IN_PROGRESS", "NOT_ELIGIBLE"].includes(e));
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: [user.department], status });
    } else if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      updateFilter({ region: [user.region], status });
    } else {
      updateFilter();
    }
  }, []);

  return (
    <>
      <Row style={{}}>
        <Col md={6}>
          <Title>Volontaires</Title>
        </Col>
        <Col md={6}>
          {filter && (
            <>
              <FiltersList>
                <FilterWrapper>
                  <MultiSelect
                    label="Cohorte(s)"
                    options={[
                      { value: "2019", label: "2019" },
                      { value: "2020", label: "2020" },
                      { value: "2021", label: "2021" },
                    ]}
                    onChange={(cohort) => updateFilter({ cohort })}
                    value={filter.cohort}
                  />
                </FilterWrapper>
              </FiltersList>
            </>
          )}
        </Col>
      </Row>
      {filter && <Status filter={filter} />}
    </>
  );
}

// Title line with filters
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
