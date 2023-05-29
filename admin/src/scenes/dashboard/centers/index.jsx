import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import FilterRegion from "../components/FilterRegion";
import FilterDepartment from "../components/FilterDepartment";
import FilterCohorte from "../components/FilterCohorte";

import Status from "./status";
import Presence from "./presence";

import { REFERENT_ROLES } from "../../../utils";

export default function Index() {
  const [filter, setFilter] = useState();
  const user = useSelector((state) => state.Auth.user);

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }

  useEffect(() => {
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: user.department });
    } else if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      updateFilter({ region: [user.region] });
    } else {
      updateFilter({ region: [], department: [] });
    }
  }, []);

  return (
    <>
      <Row>
        <Col style={{ display: "flex" }}>
          <h2 className="m-0 text-2xl font-bold">Centres</h2>
          {filter && (
            <>
              <FiltersList>
                <FilterCohorte onChange={(cohort) => updateFilter({ cohort })} value={filter.cohort} filter={filter} />
                <FilterRegion onChange={(region) => updateFilter({ region })} value={filter.region} filter={filter} />
                <FilterDepartment onChange={(department) => updateFilter({ department })} value={filter.department} filter={filter} />
              </FiltersList>
            </>
          )}
        </Col>
      </Row>
      {filter && <Status filter={filter} />}
      <Presence />
    </>
  );
}

const FiltersList = styled.div`
  gap: 1rem;
  flex: 1;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;
