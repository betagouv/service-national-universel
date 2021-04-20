import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import YearPicker from "../components/YearPicker";
import Checkbox from "../components/Checkbox";
import FilterRegion from "../components/FilterRegion";
import FilterDepartment from "../components/FilterDepartment";
import Schools from "./schools";
import Gender from "./gender";

import Status from "./status";
import Goals from "./goals";

import BirthDate from "./birthdate";
import ScholarshopSituation from "./scolarshipSituation";
import ParticularSituation from "./particularSituation";
import PriorityArea from "./priorityArea";
import { YOUNG_STATUS, translate, REFERENT_ROLES } from "../../../utils";

export default () => {
  const [filter, setFilter] = useState();
  const user = useSelector((state) => state.Auth.user);

  function updateFilter(n) {
    setFilter({ ...(filter || { status: Object.keys(YOUNG_STATUS), region: "", department: "", cohort: "2021" }), ...n });
  }

  useEffect(() => {
    const status = Object.keys(YOUNG_STATUS).filter((e) => e !== "IN_PROGRESS");
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: user.department, status });
    } else if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      updateFilter({ region: user.region, status });
    } else {
      updateFilter();
    }
  }, []);

  return (
    <>
      <Row style={{}}>
        <Col md={12}>
          <Title>Inscriptions</Title>
        </Col>
      </Row>
      {filter && (
        <>
          <FiltersList>
            <FilterRegion updateFilter={updateFilter} filter={filter} />
            <FilterDepartment updateFilter={updateFilter} filter={filter} />
            <FilterWrapper>
              <YearPicker options={["2019", "2020", "2021"]} onChange={(cohort) => updateFilter({ cohort })} value={filter.cohort} />
            </FilterWrapper>
          </FiltersList>
          {user.role === "admin" && (
            <>
              <Row>
                <Col md={12}>
                  <SubTitle>Pilotage</SubTitle>
                </Col>
              </Row>
              <Goals filter={filter} />
            </>
          )}

          <Row>
            <Col md={12}>
              <SubTitle>Statut des inscriptions</SubTitle>
            </Col>
          </Row>
          <Status filter={filter} />
          <SubTitle>Dans le détails</SubTitle>
          <FiltersList>
            <FilterStatus value={filter.status} onChange={(status) => updateFilter({ status })} />
          </FiltersList>
          <Row>
            <Col md={12} lg={6}>
              <BirthDate filter={filter} />
            </Col>
            <Col md={12} lg={6}>
              <ParticularSituation filter={filter} />
            </Col>
            <Col md={12}>
              <ScholarshopSituation filter={filter} />
            </Col>
            <Col md={12} lg={6}>
              <Gender filter={filter} />
            </Col>
            <Col md={12} lg={6}>
              <PriorityArea filter={filter} />
            </Col>
            <Col md={12}>
              <Schools filter={filter} />
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

const FilterStatus = ({ value = [], onChange }) => {
  const user = useSelector((state) => state.Auth.user);

  function updateStatus(e) {
    const i = value.indexOf(e);
    if (i == -1) return onChange([...value, e]);
    const newArr = [...value];
    newArr.splice(i, 1);
    return onChange(newArr);
  }

  let STATUS = Object.keys(YOUNG_STATUS);
  if (user.role !== REFERENT_ROLES.ADMIN) STATUS = STATUS.filter((e) => e !== "IN_PROGRESS");
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {STATUS.map((e, i) => {
        return (
          <FilterWrapper key={i}>
            <Checkbox isChecked={value.includes(YOUNG_STATUS[e])} onChange={(status) => updateStatus(status)} name={e} label={translate(YOUNG_STATUS[e])} />
          </FilterWrapper>
        );
      })}
    </div>
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
