import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import YearPicker from "../components/YearPicker";
import FilterStatus from "../components/FilterStatus";
import Checkbox from "../components/Checkbox";
import FilterAcademy from "../components/FilterAcademy";
import FilterRegion from "../components/FilterRegion";
import FilterDepartment from "../components/FilterDepartment";
import Schools from "./schools";
import Gender from "./gender";

import Status from "./status";
import Goals from "./goals";

import BirthDate from "./birthdate";
import ScholarshipSituation from "./scolarshipSituation";
import ScholarshipGrade from "./scolarshipGrade";
import ParticularSituation from "./particularSituation";
import PriorityArea from "./priorityArea";
import RuralArea from "./ruralArea";
import { YOUNG_STATUS, translate, ROLES } from "../../../utils";

export default () => {
  const [filter, setFilter] = useState();
  const user = useSelector((state) => state.Auth.user);

  function updateFilter(n) {
    setFilter({ ...(filter || { status: Object.keys(YOUNG_STATUS), academy: "", region: "", department: "", cohort: filter?.cohort || ["2021"] }), ...n });
  }

  useEffect(() => {
    const status = Object.keys(YOUNG_STATUS).filter((e) => e !== "IN_PROGRESS");
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: user.department, status });
    } else if (user.role === ROLES.REFERENT_REGION) {
      updateFilter({ region: user.region, status });
    } else {
      updateFilter();
    }
  }, []);

  return (
    <>
      <Row style={{}}>
        <Col md={6}>
          <Title>Inscriptions</Title>
        </Col>
        <Col md={6}>
          {filter ? (
            <>
              <FiltersList>
                <FilterAcademy updateFilter={updateFilter} filter={filter} />
                <FilterRegion updateFilter={updateFilter} filter={filter} />
                <FilterDepartment updateFilter={updateFilter} filter={filter} />
              </FiltersList>
            </>
          ) : null}
        </Col>
        {filter ? (
          <Col md={12}>
            <FiltersList>
              <YearPicker
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
            </FiltersList>
            <FiltersList>
              <FilterStatus value={filter.status} onChange={(status) => updateFilter({ status })} />
            </FiltersList>
          </Col>
        ) : null}
      </Row>
      {filter && (
        <>
          <Row>
            <Col md={12}>
              <SubTitle>Pilotage</SubTitle>
            </Col>
          </Row>
          <Goals filter={filter} />
          <Row>
            <Col md={12}>
              <SubTitle>Statut des inscriptions</SubTitle>
            </Col>
          </Row>
          <Status filter={filter} />
          <SubTitle>Dans le détails</SubTitle>
          <Row>
            <Col md={12} lg={6}>
              <BirthDate filter={filter} />
            </Col>
            <Col md={12} lg={6}>
              <ParticularSituation filter={filter} />
            </Col>
            <Col md={12}>
              <ScholarshipSituation filter={filter} />
            </Col>
            <Col md={12}>
              <ScholarshipGrade filter={filter} />
            </Col>
            <Col md={12} lg={4}>
              <Gender filter={filter} />
            </Col>
            <Col md={12} lg={4}>
              <PriorityArea filter={filter} />
            </Col>
            <Col md={12} lg={4}>
              <RuralArea filter={filter} />
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
