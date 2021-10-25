import React, { useEffect, useMemo, useState } from "react";
import { Col, Row } from "reactstrap";
import { YOUNG_STATUS_COLORS, departmentList, department2region } from "../../../utils";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue } from "../../../components/dashboard";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";

export default ({ filter }) => {
  const [total2020Affected, setTotal2020Affected] = useState();
  const [total2021Validated, setTotal2021Validated] = useState();
  const [inscriptionGoals, setInscriptionGoals] = useState();
  const goal = useMemo(
    () => inscriptionGoals && inscriptionGoals.reduce((acc, current) => acc + (current.max && !isNaN(Number(current.max)) ? Number(current.max) : 0), 0),
    [inscriptionGoals]
  );
  const totalInscription = useMemo(() => {
    return Number(total2020Affected || 0) + Number(total2021Validated || 0);
  }, [total2020Affected, total2021Validated]);
  const percent = useMemo(() => {
    if (!goal || !totalInscription) return 0;
    return Math.round((totalInscription / (goal || 1)) * 100);
  }, [goal, totalInscription]);

  async function fetch2020Affected() {
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": "2020" } }, { term: { "statusPhase1.keyword": "AFFECTED" } }] } },
      aggs: { status: { terms: { field: "statusPhase1.keyword" } } },
      size: 0,
    };

    if (filter.region) body.query.bool.filter.push({ term: { "region.keyword": filter.region } });
    if (filter.department) body.query.bool.filter.push({ term: { "department.keyword": filter.department } });

    const { responses } = await api.esQuery("young", body);
    if (responses.length) {
      const m = api.getAggregations(responses[0]);
      setTotal2020Affected(m.AFFECTED || 0);
    }
  }

  async function fetch2021Validated() {
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": "2021" } }, { term: { "status.keyword": "VALIDATED" } }] } },
      aggs: { status: { terms: { field: "status.keyword" } } },
      size: 0,
    };

    if (filter.region) body.query.bool.filter.push({ term: { "region.keyword": filter.region } });
    if (filter.department) body.query.bool.filter.push({ term: { "department.keyword": filter.department } });

    const { responses } = await api.esQuery("young", body);
    if (responses.length) {
      const m = api.getAggregations(responses[0]);
      setTotal2021Validated(m.VALIDATED || 0);
    }
  }

  useEffect(() => {
    (async () => {
      fetch2020Affected();
      fetch2021Validated();
      getInscriptionGoals(filter.region, filter.department);
    })();
  }, [JSON.stringify(filter)]);

  const getInscriptionGoals = async (region, departement) => {
    function filterByRegionAndDepartement(e) {
      if (departement) return e.department === departement;
      if (region) return e.region === region;
      return true;
    }
    const { data, ok, code } = await api.get("/inscription-goal");
    if (!ok) return toastr.error("Une erreur s'est produite.");
    setInscriptionGoals(
      departmentList.map((d) => data.filter(filterByRegionAndDepartement).find((e) => e.department === d) || { department: d, region: department2region[d], max: null })
    );
  };

  return (
    <>
      <Row>
        <Col md={4}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
            <CardTitle>Objectif d'inscriptions</CardTitle>
            <CardValueWrapper>
              <CardValue>{goal || "-"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Col>
        <Col md={4}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS} style={{ padding: "22px 15px 6px" }}>
            <CardTitle>Nombre d'inscrits *</CardTitle>
            <CardValueWrapper>
              <CardValue>{totalInscription || "0"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
            <div style={{ fontSize: "10px", color: "#888" }}>* 2021 validés et 2020 affectés</div>
          </Card>
        </Col>
        <Col md={4}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
            <CardTitle>Taux de remplissage</CardTitle>
            <CardValueWrapper>
              <CardValue style={goal && percent >= 100 ? { color: "firebrick" } : {}}>{goal ? `${percent} %` : "-"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Col>
      </Row>
    </>
  );
};
