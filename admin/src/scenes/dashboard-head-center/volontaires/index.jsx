import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import MultiSelect from "../../dashboard/components/MultiSelect";
import Status from "./status";
import { YOUNG_STATUS, REFERENT_ROLES } from "../../../utils";

export default function Index() {
  const [filter, setFilter] = useState();
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);

  function updateFilter(n) {
    setFilter({ ...(filter || { status: Object.keys(YOUNG_STATUS), region: [], department: [], cohort: sessionPhase1?.cohort ? [sessionPhase1?.cohort] : undefined }), ...n });
  }

  useEffect(() => {
    if (!sessionPhase1) return;
    updateFilter({ cohort: [sessionPhase1.cohort] });
  }, [sessionPhase1]);

  useEffect(() => {
    const status = Object.keys(YOUNG_STATUS).filter((e) => !["IN_PROGRESS", "NOT_ELIGIBLE"].includes(e));
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: user.department, status });
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
          <h2 className="m-0 text-2xl font-bold">Volontaires</h2>
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
                      { value: "Février 2022", label: "Février 2022" },
                      { value: "Juin 2022", label: "Juin 2022" },
                      { value: "Juillet 2022", label: "Juillet 2022" },
                      { value: "Février 2023 - C", label: "Février 2023 - C" },
                      { value: "Avril 2023 - A", label: "Avril 2023 - A" },
                      { value: "Avril 2023 - B", label: "Avril 2023 - B" },
                      { value: "Juin 2023", label: "Juin 2023" },
                      { value: "Juillet 2023", label: "Juillet 2023" },
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

const FiltersList = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;
const FilterWrapper = styled.div`
  margin: 0 5px 10px;
`;
