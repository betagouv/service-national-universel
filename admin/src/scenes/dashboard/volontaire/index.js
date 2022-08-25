import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import MultiSelect from "../components/MultiSelect";
import FilterRegion from "../components/FilterRegion";
import FilterDepartment from "../components/FilterDepartment";
import SubTab from "./status";

import { YOUNG_STATUS, ROLES, translate } from "../../../utils";
import { useLocation } from "react-router-dom";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const { state } = useLocation();

  const [filter, setFilter] = useState();

  function updateFilter(n) {
    setFilter((f) => ({ ...f, ...n }));
  }

  const cohortList = ["Juillet 2022", "Juin 2022", "Février 2022", "2021"];

  useEffect(() => {
    if (state !== undefined && state?.params) {
      setFilter(state.params.filter);
    } else {
      setFilter({ status: [YOUNG_STATUS.VALIDATED], cohort: cohortList, region: [], department: [] });
    }
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: [user.department] });
    } else if (user.role === ROLES.REFERENT_REGION) {
      updateFilter({ region: [user.region] });
    }
  }, []);

  const getOptionsStatus = () => {
    let STATUS = Object.keys(YOUNG_STATUS)
      .filter((e) => [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WITHDRAWN, YOUNG_STATUS.DELETED].includes(e))
      .map((s) => ({ label: translate(YOUNG_STATUS[s]), value: s }));
    return STATUS;
  };

  return (
    <>
      <Row>
        <Col style={{ display: "flex" }}>
          <h2 className="m-0 font-bold text-2xl">Volontaires</h2>
          {filter ? (
            <FiltersList>
              <FilterRegion onChange={(region) => updateFilter({ region })} value={filter.region} filter={filter} />
              <FilterDepartment onChange={(department) => updateFilter({ department })} value={filter.department} filter={filter} />
              <MultiSelect
                label="Cohorte(s)"
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
              <MultiSelect label="Statut(s)" options={getOptionsStatus()} value={filter.status} onChange={(status) => updateFilter({ status })} />
            </FiltersList>
          ) : null}
        </Col>
      </Row>
      {filter ? <SubTab filter={filter} /> : null}
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
