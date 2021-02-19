import React, { useEffect, useState, useReducer } from "react";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";
import { useSelector } from "react-redux";

import YearPicker from "../components/YearPicker";
import Dropdown from "../components/Dropdown";
import Checkbox from "../components/Checkbox";

import Schools from "./schools";
import Gender from "./gender";
import Status from "./status";
import BirthDate from "./birthdate";
import ScholarshopSituation from "./scolarshipSituation";
import ParticularSituation from "./particularSituation";
import PriorityArea from "./priorityArea";

import { departmentList, regionList, YOUNG_STATUS, translate, region2department, REFERENT_ROLES } from "../../../utils";

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
              <YearPicker options={["2020", "2021"]} onChange={(cohort) => updateFilter({ cohort })} value={filter.cohort} />
            </FilterWrapper>
          </FiltersList>
          <Status filter={filter} />
          <Title>Dans le détails</Title>
          <FiltersList>
            <FilterStatus value={filter.status} onChange={(status) => updateFilter({ status })} />
            {/*   <FilterWrapper>
          <ExportButton onClick={onExportButtonClicked}>Exporter les données</ExportButton>
        </FilterWrapper> */}
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

const FilterRegion = ({ updateFilter, filter }) => {
  const user = useSelector((state) => state.Auth.user);
  if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return <div />;

  if (user.role === REFERENT_ROLES.REFERENT_REGION) {
    return (
      <FilterWrapper>
        <Dropdown disabled onChange={() => {}} selectedOption={filter.region} options={[]} prelabel="Régions" />
      </FilterWrapper>
    );
  }

  return (
    <FilterWrapper>
      <Dropdown onChange={(region) => updateFilter({ region })} selectedOption={filter.region} options={regionList} prelabel="Régions" />
    </FilterWrapper>
  );
};

const FilterDepartment = ({ updateFilter, filter }) => {
  const user = useSelector((state) => state.Auth.user);
  const filteredDepartment = () => {
    if (!filter.region) return departmentList;
    return region2department[filter.region];
  };

  if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
    return (
      <FilterWrapper>
        <Dropdown disabled onChange={() => {}} selectedOption={filter.department} options={[]} prelabel="Départements" />
      </FilterWrapper>
    );
  }

  return (
    <FilterWrapper>
      <Dropdown onChange={(department) => updateFilter({ department })} selectedOption={filter.department} options={filteredDepartment} prelabel="Départements" />
    </FilterWrapper>
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
const FiltersList = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;
const FilterWrapper = styled.div`
  margin: 0 5px 10px;
`;

// Export button
const ExportButton = styled.button`
  border: 0;
  border-radius: 8px;
  padding: 7px 10px 7px 40px;
  color: #242526;
  font-size: 14px;
  font-weight: bold;
  background-image: url(${require("../../../assets/export_icon.png")});
  background-color: white;
  background-repeat: no-repeat;
  background-position: 10px center;
`;
