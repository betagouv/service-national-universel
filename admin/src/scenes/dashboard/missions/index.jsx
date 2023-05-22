import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import FilterDepartment from "../components/FilterDepartment";
import FilterRegion from "../components/FilterRegion";

import Statistics from "./Statistics";

import { YOUNG_STATUS, REFERENT_ROLES } from "../../../utils";
import DateFilter from "../components/DatePickerDashBoard";
import FilterSource from "../components/FilterSource";

export default function Index() {
  const [filter, setFilter] = useState();
  const user = useSelector((state) => state.Auth.user);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }

  const checkRole = () => {
    const status = Object.keys(YOUNG_STATUS).filter((e) => e !== "IN_PROGRESS");
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: user.department, status });
    } else if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      updateFilter({ region: [user.region], status });
    } else {
      updateFilter({ status: Object.keys(YOUNG_STATUS), region: [] });
    }
  };
  useEffect(() => {
    checkRole();
  }, []);

  useEffect(() => {
    let range;
    //If just the from date is filled
    if (fromDate && !toDate) {
      range = {
        startDate: {
          gte: fromDate,
        },
        endDate: {
          gte: fromDate,
        },
      };
      //If just the to date is filled
    } else if (!fromDate && toDate) {
      range = {
        startDate: {
          lte: toDate,
        },
        endDate: {
          lte: toDate,
        },
      };
      //If both date are filled
    } else if (fromDate && toDate) {
      range = {
        startDate: {
          lte: toDate,
        },
        endDate: {
          gte: fromDate,
        },
      };
      //If none of the dates is filled, reset filter
    } else {
      range = { startDate: {}, endDate: {} };
    }
    updateFilter({ startDate: range.startDate, endDate: range.endDate, fromDate: fromDate, toDate: toDate });
    checkRole();
  }, [fromDate, toDate]);

  return (
    <>
      <Row>
        <Col style={{ display: "flex" }}>
          <h2 className="m-0 text-2xl font-bold">Missions</h2>
          {filter && (
            <>
              <FiltersList>
                <FilterRegion onChange={(region) => updateFilter({ region })} value={filter.region} filter={filter} />
                <FilterDepartment onChange={(department) => updateFilter({ department })} value={filter.department} filter={filter} />
                <FilterSource onChange={(source) => updateFilter({ source })} value={filter.source} filter={filter} />
                <DateFilter title="Date de début" onChange={(e) => setFromDate(e.target.value)} value={fromDate} />
                <DateFilter title="Date de fin" onChange={(e) => setToDate(e.target.value)} value={toDate} />
              </FiltersList>
            </>
          )}
        </Col>
      </Row>
      {filter && <Statistics filter={filter} updateFilter={updateFilter} />}
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
