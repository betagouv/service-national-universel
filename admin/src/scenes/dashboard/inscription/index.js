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
import BirthDate from "./birthdate";
import ScholarshopSituation from "./scolarshipSituation";
import ParticularSituation from "./particularSituation";
import PriorityArea from "./priorityArea";
import { YOUNG_STATUS, translate, REFERENT_ROLES, departmentLookUp, department2region, getDepartmentNumber } from "../../../utils";

import api from "../../../services/api";

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
          <ExportAll />
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
          <Status filter={filter} />
          <Title>Dans le détails</Title>
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

import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

const ExportAll = () => {
  async function run() {
    const lines = [];

    const dates = [];
    const d = new Date("2021-02-26");
    while (d < Date.now()) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
    dates.push(new Date(d));
    lines.push(["Région", "Numéro dtp", "Département", "Cible", ...dates.map((e) => e.toISOString().slice(0, 10))]);
    const keys = Object.keys(departmentLookUp).sort((a, b) => a - b);
    for (let i = 0; i < keys.length; i++) {
      const dptCode = keys[i];
      const dptName = departmentLookUp[dptCode];
      const region = department2region[dptName];

      const queries = [];
      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: {
          bool: {
            must: { match_all: {} },
            filter: [
              { term: { "cohort.keyword": "2021" } },
              { term: { "department.keyword": dptName } },
              { terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED"] } },
            ],
          },
        },
        aggs: { range: { date_range: { field: "lastStatusAt", ranges: dates.map((e) => ({ to: e })) } } },
        size: 0,
      });
      const { responses } = await api.esQuery(queries);
      const val = responses[0].aggregations.range.buckets.map((e) => e.doc_count);
      const line = [region, dptCode, dptName, "", ...val];
      lines.push(line);
    }
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const ws = XLSX.utils.json_to_sheet(lines);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "Global.xlsx");
  }

  return <div onClick={run}>Export</div>;
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
