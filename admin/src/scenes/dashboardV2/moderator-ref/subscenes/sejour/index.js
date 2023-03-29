import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { academyList, COHORTS, departmentList, ES_NO_LIMIT, regionList, ROLES, translateInscriptionStatus, translatePhase1, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import api from "../../../../../services/api";
import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import BoxWithPercentage from "./components/BoxWithPercentage";
import CardCenterCapacity from "./components/CardCenterCapacity";
import Cardsession from "./components/Cardsession";
import MoreInfo from "./components/MoreInfo";
import OccupationCardHorizontal from "./components/OccupationCardHorizontal";
import Presences from "./components/Presences";
import StatusPhase1 from "./components/StatusPhase1";
import TabSession from "./components/TabSession";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const filterArray = [
    {
      id: "status",
      name: "Statut d’inscription",
      fullValue: "Tous",
      options: Object.keys(YOUNG_STATUS).map((status) => ({ key: status, label: translateInscriptionStatus(status) })),
    },
    {
      id: "statusPhase1",
      name: "Statut de phase 1",
      fullValue: "Tous",
      fixed: [YOUNG_STATUS_PHASE1.AFFECTED],
      options: Object.keys(YOUNG_STATUS_PHASE1)
        .filter((s) => ![YOUNG_STATUS_PHASE1.WAITING_LIST, YOUNG_STATUS_PHASE1.WITHDRAWN].includes(s))
        .map((status) => ({ key: status, label: translatePhase1(status) })),
    },
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          id: "region",
          name: "Région",
          fullValue: "Toutes",
          options: regionList.map((region) => ({ key: region, label: region })),
        }
      : null,
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          id: "academy",
          name: "Académie",
          fullValue: "Toutes",
          options: academyList.map((academy) => ({ key: academy, label: academy })),
        }
      : null,
    {
      id: "department",
      name: "Département",
      fullValue: "Tous",
      options: departmentList.map((department) => ({ key: department, label: department })),
    },
    {
      id: "cohort",
      name: "Cohorte",
      fullValue: "Toutes",
      options: COHORTS.map((cohort) => ({ key: cohort, label: cohort })),
    },
  ].filter((e) => e);

  //useStates
  const [selectedFilters, setSelectedFilters] = useState({
    status: [YOUNG_STATUS.VALIDATED],
    statusPhase1: [YOUNG_STATUS_PHASE1.AFFECTED],
    cohort: ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023"],
    region: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
    department: user.role === ROLES.REFERENT_DEPARTMENT ? [...user.department] : [],
    academy: [],
  });
  const [data, setData] = useState({});
  const [dataCenter, setDataCenter] = useState({});

  const queryYoung = async () => {
    const statusPhaseTerms = selectedFilters?.statusPhase1?.length
      ? { terms: { "statusPhase1.keyword": selectedFilters?.statusPhase1?.filter((s) => s !== YOUNG_STATUS_PHASE1.WAITING_AFFECTATION) } }
      : null;

    const aggsFilter = {
      filter: {
        bool: {
          must: [],
          filter: statusPhaseTerms ? [statusPhaseTerms] : [],
        },
      },
    };

    const body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        statusPhase1: { terms: { field: "statusPhase1.keyword" } },
        pdr: {
          ...aggsFilter,
          aggs: {
            names: { terms: { field: "hasMeetingInformation.keyword", missing: "NR", size: ES_NO_LIMIT } },
          },
        },
        participation: {
          ...aggsFilter,
          aggs: {
            names: { terms: { field: "youngPhase1Agreement.keyword", size: ES_NO_LIMIT } },
          },
        },
        precense: {
          ...aggsFilter,
          aggs: {
            names: { terms: { field: "cohesionStayPresence.keyword", missing: "NR", size: ES_NO_LIMIT } },
          },
        },
        JDM: {
          ...aggsFilter,
          aggs: {
            names: { terms: { field: "presenceJDM.keyword", missing: "NR", size: ES_NO_LIMIT } },
          },
        },
        depart: {
          ...aggsFilter,
          aggs: {
            names: { terms: { field: "departInform.keyword", size: ES_NO_LIMIT } },
          },
        },
        departMotif: {
          ...aggsFilter,
          aggs: {
            names: { terms: { field: "departSejourMotif.keyword", size: ES_NO_LIMIT } },
          },
        },
      },
      size: 0,
      track_total_hits: true,
    };

    if (selectedFilters.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": selectedFilters.region } });
    if (selectedFilters.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": selectedFilters.department } });
    if (selectedFilters.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": selectedFilters.cohort } });
    if (selectedFilters.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": selectedFilters.academy } });
    if (selectedFilters.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": selectedFilters.status } });

    const { responses } = await api.esQuery("young", body);

    if (responses?.length) {
      let result = {};
      result.statusPhase1 = responses[0].aggregations.statusPhase1.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
      result.statusPhase1Total = responses[0].hits.total.value;
      result.pdrTotal = responses[0].aggregations.pdr.doc_count;
      result.participation = responses[0].aggregations.participation.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
      result.participationTotal = responses[0].aggregations.participation.doc_count;
      result.presence = responses[0].aggregations.precense.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
      result.JDM = responses[0].aggregations.JDM.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
      result.depart = responses[0].aggregations.depart.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
      result.departTotal = responses[0].aggregations.depart.doc_count;
      result.departMotif = responses[0].aggregations.departMotif.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
      setData(result);
    }
  };

  const queryCenter = async () => {
    const bodyCohesion = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        typology: { terms: { field: "typology.keyword", size: ES_NO_LIMIT } },
        domains: { terms: { field: "domain.keyword", size: ES_NO_LIMIT } },
        capacity: { sum: { field: "placesTotal" } },
      },
      size: ES_NO_LIMIT,
    };

    if (selectedFilters.region?.length) bodyCohesion.query.bool.filter.push({ terms: { "region.keyword": selectedFilters.region } });
    if (selectedFilters.department?.length) bodyCohesion.query.bool.filter.push({ terms: { "department.keyword": selectedFilters.department } });
    if (selectedFilters.cohort?.length) bodyCohesion.query.bool.filter.push({ terms: { "cohorts.keyword": selectedFilters.cohort } });

    const { responses: responsesCohesion } = await api.esQuery("cohesioncenter", bodyCohesion);

    if (!responsesCohesion.length) return;
    let resultCenter = {};
    resultCenter.typology = responsesCohesion[0].aggregations.typology.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultCenter.domains = responsesCohesion[0].aggregations.domains.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultCenter.capacity = responsesCohesion[0].aggregations.capacity.value;
    resultCenter.totalCenter = responsesCohesion[0].hits.total.value;

    const cohesionCenterId = responsesCohesion[0].hits.hits.map((e) => e._id);
    const bodySession = {
      query: { bool: { must: { match_all: {} }, filter: [{ terms: { cohesionCenterId } }] } },
      aggs: {
        placesTotal: { sum: { field: "placesTotal" } },
        placesLeft: { sum: { field: "placesLeft" } },
        status: { terms: { field: "status.keyword" } },
        timeSchedule: { terms: { field: "hasTimeSchedule.keyword" } },
      },
      size: 0,
    };

    if (selectedFilters.cohort?.length) bodySession.query.bool.filter.push({ terms: { "cohort.keyword": selectedFilters.cohort } });
    const { responses: responsesSession } = await api.esQuery("sessionphase1", bodySession);
    if (responsesSession.length) {
      resultCenter.placesTotalSession = responsesSession[0].aggregations.placesTotal.value;
      resultCenter.placesLeftSession = responsesSession[0].aggregations.placesLeft.value;
      resultCenter.status = responsesSession[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {});
      resultCenter.timeSchedule = responsesSession[0].aggregations.timeSchedule.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {});
      resultCenter.totalSession = responsesSession[0].hits.total.value;
    }
    setDataCenter(resultCenter);
  };

  useEffect(() => {
    queryYoung();
    queryCenter();
  }, [JSON.stringify(selectedFilters)]);

  return (
    <DashboardContainer
      active="sejour"
      availableTab={["general", "engagement", "sejour", "inscription"]}
      navChildren={
        <div className="flex items-center gap-2">
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Séjour”</span>
          </ButtonPrimary>
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Séjour”</span>
          </ButtonPrimary>
        </div>
      }>
      <div className="flex flex-col gap-8">
        <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
        <h1 className="text-[28px] leading-8 font-bold text-gray-900">Volontaires</h1>
        <div className="flex items-stretch gap-4 ">
          <div className="flex flex-col gap-4 w-[30%]">
            <BoxWithPercentage total={data?.pdrTotal || 0} number={data?.pdr?.NR + data?.pdr?.false || 0} title="Point de rassemblement" subLabel="restants à confirmer" />
            <BoxWithPercentage total={data?.participationTotal || 0} number={data?.participation?.false || 0} title="Participation" subLabel="restants à confirmer" />
          </div>
          <StatusPhase1 statusPhase1={data?.statusPhase1} total={data?.statusPhase1Total} />
        </div>
        <Presences presence={data?.presence} JDM={data?.JDM} depart={data?.depart} departTotal={data?.departTotal} departMotif={data?.departMotif} />
        <h1 className="text-[28px] leading-8 font-bold text-gray-900">Centres</h1>
        <div className="grid grid-cols-3 gap-4">
          <CardCenterCapacity nbCenter={dataCenter?.totalCenter || 0} capacity={dataCenter?.capacity || 0} />
          <Cardsession nbValidated={dataCenter?.status?.VALIDATED || 0} nbPending={dataCenter?.status?.WAITING_VALIDATION || 0} />
          <OccupationCardHorizontal total={dataCenter?.placesTotalSession || 0} taken={dataCenter?.placesTotalSession - dataCenter?.placesLeftSession || 0} />
          <BoxWithPercentage total={dataCenter?.totalSession || 0} number={dataCenter?.timeSchedule?.false || 0} title="Emplois du temps" subLabel="restants à renseigner" />
        </div>
        <div className="flex items-stretch gap-4 ">
          <MoreInfo typology={dataCenter?.typology} domains={dataCenter?.domains} />
          <TabSession />
        </div>
      </div>
    </DashboardContainer>
  );
}
