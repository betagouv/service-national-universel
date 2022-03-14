import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import FilterDepartment from "../components/FilterDepartment";
import FilterRegion from "../components/FilterRegion";

import Statistics from "./Statistics";

import { YOUNG_STATUS, REFERENT_ROLES } from "../../../utils";
import DatePicker from "../components/DatePicker";

export default function Index() {
  const [filter, setFilter] = useState();
  const user = useSelector((state) => state.Auth.user);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }

  useEffect(() => {
    const status = Object.keys(YOUNG_STATUS).filter((e) => e !== "IN_PROGRESS");
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: [user.department], status });
    } else if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      updateFilter({ region: [user.region], status });
    } else {
      updateFilter({ status: Object.keys(YOUNG_STATUS), region: [] });
    }
  }, []);

  useEffect(() => {
    if (startDate !== "" && endDate === "") {
      updateFilter({
        startDate: {
          gte: new Date(startDate).toISOString(),
        },
        endDate: {
          gte: new Date(startDate).toISOString(),
        },
      });
    } else if (startDate === "" && endDate !== "") {
      updateFilter({
        startDate: {
          lte: endDate,
        },
        endDate: {
          lte: endDate,
        },
      });
    } else if (startDate !== "" && endDate !== "") {
      updateFilter({
        startDate: {
          gte: startDate,
          lte: endDate,
        },
        endDate: {
          gte: startDate,
          lte: endDate,
        },
      });
    } else {
      updateFilter({ startDate: {}, endDate: {} });
    }
  }, [startDate, endDate]);

  return (
    <>
      <Row>
        <Col style={{ display: "flex" }}>
          <h2 className="m-0 font-bold text-2xl">Missions</h2>
          {filter && (
            <>
              <FiltersList>
                <FilterRegion onChange={(region) => updateFilter({ region })} value={filter.region} filter={filter} />
                <FilterDepartment onChange={(department) => updateFilter({ department })} value={filter.department} filter={filter} />
                <DatePicker title="Date de début" onChange={(e) => setStartDate(e.target.value)} value={startDate} />
                <DatePicker title="Date de fin" onChange={(e) => setEndDate(e.target.value)} value={endDate} />
              </FiltersList>
            </>
          )}
        </Col>
      </Row>
      {filter && <Statistics filter={filter} />}
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
