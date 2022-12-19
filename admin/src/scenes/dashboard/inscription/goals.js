import React, { useEffect, useMemo, useState } from "react";
import { Col, Row } from "reactstrap";
import { YOUNG_STATUS_COLORS, departmentList, department2region, REFERENT_ROLES } from "../../../utils";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue } from "../../../components/dashboard";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import { YOUNG_STATUS } from "snu-lib";
import WithTooltip from "../../../components/WithTooltip";

export default function Goal({ filter }) {
  const user = useSelector((state) => state.Auth.user);

  const [total2020Affected, setTotal2020Affected] = useState();
  const [totalValidated, setTotalValidated] = useState();
  const [openApplications, setOpenApplications] = useState();
  const [inscriptionGoals, setInscriptionGoals] = useState();
  const goal = useMemo(
    () => inscriptionGoals && inscriptionGoals.reduce((acc, current) => acc + (current.max && !isNaN(Number(current.max)) ? Number(current.max) : 0), 0),
    [inscriptionGoals],
  );
  const totalInscription = useMemo(() => {
    return Number((filter.cohort === "2021" && total2020Affected) || 0) + Number(totalValidated || 0);
  }, [total2020Affected, totalValidated]);
  const percent = useMemo(() => {
    if (!goal || !totalInscription) return 0;
    return ((totalInscription / (goal || 1)) * 100).toFixed(2);
  }, [goal, totalInscription]);
  const percent2 = useMemo(() => {
    if (!openApplications || !goal) return 0;
    return ((openApplications / (goal || 1)) * 100).toFixed(2);
  }, [openApplications, goal]);

  async function fetch2020Affected() {
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": "2020" } }, { term: { "statusPhase1.keyword": "AFFECTED" } }] } },
      aggs: { status: { terms: { field: "statusPhase1.keyword" } } },
      size: 0,
    };

    if (filter.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": filter.academy } });
    if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
    if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });

    const { responses } = await api.esQuery("young", body);
    if (responses.length) {
      const m = api.getAggregations(responses[0]);
      setTotal2020Affected(m.AFFECTED || 0);
    }
  }

  async function fetchOpenApplications() {
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: { status: { terms: { field: "status.keyword" } } },
      size: 0,
    };

    if (filter.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
    if (filter.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": filter.academy } });
    if (filter.region?.length)
      body.query.bool.filter.push({
        bool: {
          should: [
            { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": filter.region } }] } },
            { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": filter.region } }] } },
          ],
        },
      });
    if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });

    const { responses } = await api.esQuery("young", body);
    if (responses.length) {
      const m = api.getAggregations(responses[0]);
      setOpenApplications(
        (m[YOUNG_STATUS.IN_PROGRESS] || 0) +
          (m[YOUNG_STATUS.WAITING_VALIDATION] || 0) +
          (m[YOUNG_STATUS.WAITING_CORRECTION] || 0) +
          (m[YOUNG_STATUS.VALIDATED] || 0) +
          (m[YOUNG_STATUS.WAITING_LIST] || 0) +
          (m[YOUNG_STATUS.REINSCRIPTION] || 0),
      );
    }
  }

  async function fetchValidated() {
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [{ terms: { "cohort.keyword": filter.cohort } }, { term: { "status.keyword": "VALIDATED" } }] } },
      aggs: { status: { terms: { field: "status.keyword" } } },
      size: 0,
    };

    if (filter.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": filter.academy } });
    if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
    if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });

    const { responses } = await api.esQuery("young", body);
    if (responses.length) {
      const m = api.getAggregations(responses[0]);
      setTotalValidated(m.VALIDATED || 0);
    }
  }

  useEffect(() => {
    (async () => {
      fetch2020Affected();
      fetchValidated();
      getInscriptionGoals(filter.region, filter.department, filter.academy);
      fetchOpenApplications();
    })();
  }, [JSON.stringify(filter)]);

  const getInscriptionGoals = async (regions, departements, academy) => {
    function filterByRegionAndDepartement(e) {
      if (departements.length) return departements.includes(e.department);
      else if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return user.department.includes(e.department);
      if (regions.length) return regions.includes(e.region);
      if (academy.length) return academy.includes(e.academy);
      return true;
    }

    let dataMerged = [];
    for (const cohort of filter.cohort) {
      const { data, ok } = await api.get("/inscription-goal/" + cohort);
      if (!ok) return toastr.error("Une erreur s'est produite.");

      data.forEach(
        ({ department, region, academy, max }) =>
          (dataMerged[department] = { department, region, academy, max: (dataMerged[department]?.max ? dataMerged[department].max : 0) + max }),
      );
    }

    setInscriptionGoals(
      departmentList.map(
        (d) =>
          Object.values(dataMerged)
            .filter(filterByRegionAndDepartement)
            .find((e) => e.department === d) || { department: d, region: department2region[d], max: null },
      ),
    );
  };

  return (
    <>
      <Row>
        <Col md={3}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
            <CardTitle>Objectif d&apos;inscriptions</CardTitle>
            <CardValueWrapper>
              <CardValue>{goal || "-"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Col>
        <Col md={3}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS} style={filter.cohort === "2021" ? { padding: "22px 15px 6px" } : {}}>
            <CardTitle>Nombre d&apos;inscrits {filter.cohort === "2021" && "*"}</CardTitle>
            <CardValueWrapper>
              <CardValue>{totalInscription || "0"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
            {filter.cohort === "2021" && <div style={{ fontSize: "10px", color: "#888" }}>* 2021 validés et 2020 affectés</div>}
          </Card>
        </Col>
        <Col md={3}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
            <CardTitle>Taux de remplissage</CardTitle>
            <CardValueWrapper>
              <CardValue style={goal && percent >= 100 ? { color: "firebrick" } : {}}>{goal ? `${percent} %` : "-"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Col>
        <Col md={3}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
            <CardTitle>
              <div className="flex justify-between">
                <WithTooltip tooltipText="Nombre de dossiers ouverts (en cours, en attente de validation, en attente de correction, sur liste complémentaire, validés) de jeunes scolarisés dans la région (ou si non scolarisés, résidents dans la région) divisé par l’objectif d’inscription régional.">
                  Taux d&apos;ouverture de dossiers (i)
                </WithTooltip>
                <div></div>
              </div>
            </CardTitle>
            <CardValueWrapper>
              <CardValue style={openApplications && percent2 >= 100 ? { color: "firebrick" } : {}}>{openApplications ? `${percent2} %` : "-"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Col>
      </Row>
    </>
  );
}
