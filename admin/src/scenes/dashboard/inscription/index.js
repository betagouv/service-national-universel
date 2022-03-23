import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import MultiSelect from "../components/MultiSelect";

import FilterRegion from "../components/FilterRegion";
import FilterDepartment from "../components/FilterDepartment";
//import Schools from "./schools";
import Gender from "./gender";

import Status from "./status";
import Goals from "./goals";

import BirthDate from "./birthdate";
import ScholarshipSituation from "./scolarshipSituation";
import ScholarshipGrade from "./scolarshipGrade";
import ParticularSituation from "./particularSituation";
import PriorityArea from "./priorityArea";
import RuralArea from "./ruralArea";
import { YOUNG_STATUS, translate, ROLES, academyList } from "../../../utils";
import UnavailableFeature from "../../../components/unavailableFeature";

export default function Index({ onChangeFilter = () => {} }) {
  const [filter, setFilter] = useState();
  const user = useSelector((state) => state.Auth.user);

  function updateFilter(n) {
    setFilter({
      ...(filter || {
        status: Object.keys(YOUNG_STATUS),
        academy: [],
        region: [],
        department: [],
        cohort: filter?.cohort || ["Février 2022", "Juin 2022", "Juillet 2022", "2022"],
      }),
      ...n,
    });
  }

  useEffect(() => {
    const status = Object.keys(YOUNG_STATUS).filter((e) => !["NOT_ELIGIBLE"].includes(e));
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: [user.department], status });
    } else if (user.role === ROLES.REFERENT_REGION || user.role === ROLES.VISITOR) {
      updateFilter({ region: [user.region], status });
    } else {
      updateFilter();
    }
  }, []);

  useEffect(() => {
    onChangeFilter(filter);
  }, [filter]);

  const getOptionsStatus = () => {
    let STATUS = Object.keys(YOUNG_STATUS).map((s) => ({ label: translate(YOUNG_STATUS[s]), value: s }));
    if (user.role !== ROLES.ADMIN) STATUS = STATUS.filter((e) => !["NOT_ELIGIBLE"].includes(e.value));
    return STATUS;
  };

  return (
    <>
      <Row>
        <Col style={{ display: "flex" }}>
          <h2 className="m-0 font-bold text-2xl">Inscriptions</h2>
          {filter ? (
            <FiltersList>
              {user.role === ROLES.ADMIN ? (
                <MultiSelect
                  label="Académie(s)"
                  options={academyList.map((a) => ({ value: a, label: a }))}
                  value={filter.academy}
                  onChange={(academy) => updateFilter({ academy })}
                />
              ) : null}
              <FilterRegion onChange={(region) => updateFilter({ region })} value={filter.region} />

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
      {filter && (
        <>
          <Row>
            <Col md={12}>
              <h3 className="mt-4 mb-2 text-xl">Pilotage</h3>
            </Col>
          </Row>
          <Goals filter={filter} />
          <Row>
            <Col md={12}>
              <h3 className="mt-4 mb-2 text-xl">Statut des inscriptions</h3>
            </Col>
          </Row>
          <Status filter={filter} />
          <h3 className="mt-4 mb-2 text-xl">Dans le détail</h3>
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
              <UnavailableFeature
                functionality="Tableau des établissements"
                text="Pour consulter les établissements de vos volontaires et des volontaires scolarisés dans votre département, rendez-vous sur les exports volontaires :"
                link="https://admin.snu.gouv.fr/volontaire"
                textLink="Cliquez ici"
              />
              {/* <Schools filter={filter} /> */}
            </Col>
          </Row>
        </>
      )}
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
