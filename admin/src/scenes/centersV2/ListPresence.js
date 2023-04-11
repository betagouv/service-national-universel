import React, { useEffect, useState } from "react";
import { BsDownload } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { ES_NO_LIMIT, getDepartmentNumber, ROLES, translateInscriptionStatus, translatePhase1, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { ExportComponentV2, Filters, ResultTable, Save, SelectedFilters } from "../../components/filters-system";
import api from "../../services/api";
import { Loading, Title } from "./components/commons";

const getAggregCenter = async (cohesionCenterIds, selectedFilters) => {
  let sessionByCenter = {};
  let sessionsPhase1 = {};
  //Fetch Sessiom
  if (cohesionCenterIds?.length) {
    let body = {
      size: ES_NO_LIMIT,
      query: { bool: { must: { match_all: {} }, filter: [{ terms: { "cohesionCenterId.keyword": cohesionCenterIds } }] } },
    };

    if (selectedFilters?.cohorts?.filter?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": selectedFilters.cohorts.filter } });
    const { responses } = await api.esQuery("sessionphase1", body);
    if (responses.length) {
      sessionsPhase1 = responses[0]?.hits?.hits?.map((e) => ({ ...e._source, _id: e._id })) || [];
    }
  }

  //aggrrgation young
  if (sessionsPhase1?.length) {
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        session: {
          terms: { field: "sessionPhase1Id.keyword", size: ES_NO_LIMIT },
          aggs: {
            presence: { terms: { field: "cohesionStayPresence.keyword", missing: "NR" } },
            presenceJDM: { terms: { field: "presenceJDM.keyword", missing: "NR" } },
            depart: { terms: { field: "departInform.keyword", missing: "NR" } },
            sanitaryField: { terms: { field: "cohesionStayMedicalFileReceived.keyword", missing: "NR" } },
          },
        },
      },
      size: 0,
    };
    if (selectedFilters.status?.filter?.length) body.query.bool.filter.push({ terms: { "status.keyword": selectedFilters.status?.filter } });
    if (selectedFilters.statusPhase1?.filter?.length) body.query.bool.filter.push({ terms: { "statusPhase1.keyword": selectedFilters.statusPhase1?.filter } });

    let sessionPhase1Id = sessionsPhase1.map((session) => session._id).filter((id) => id);
    if (sessionPhase1Id.length) body.query.bool.filter.push({ terms: { "sessionPhase1Id.keyword": sessionPhase1Id } });

    const { responses } = await api.esQuery("young", body);
    if (!responses?.length) return;
    const sessionAggreg = responses[0].aggregations.session.buckets.reduce((acc, session) => {
      acc[session.key] = {
        total: session.doc_count,
        presence: session.presence.buckets.reduce((acc, presence) => {
          acc[presence.key] = presence.doc_count;
          return acc;
        }, {}),
        presenceJDM: session.presenceJDM.buckets.reduce((acc, presenceJDM) => {
          acc[presenceJDM.key] = presenceJDM.doc_count;
          return acc;
        }, {}),
        depart: session.depart.buckets.reduce((acc, depart) => {
          acc[depart.key] = depart.doc_count;
          return acc;
        }, {}),
        sanitaryField: session.sanitaryField.buckets.reduce((acc, sanitaryField) => {
          acc[sanitaryField.key] = sanitaryField.doc_count;
          return acc;
        }, {}),
      };
      return acc;
    }, {});

    sessionByCenter = sessionsPhase1.reduce((acc, session) => {
      if (!acc[session.cohesionCenterId]) {
        acc[session.cohesionCenterId] = {
          centerId: session.cohesionCenterId,
          total: sessionAggreg[session._id]?.total || 0,
          presenceOui: sessionAggreg[session._id]?.presence?.true || 0,
          presenceNon: sessionAggreg[session._id]?.presence?.false || 0,
          presenceNR: sessionAggreg[session._id]?.presence?.NR || 0,
          presenceJDMOui: sessionAggreg[session._id]?.presenceJDM?.true || 0,
          presenceJDMNon: sessionAggreg[session._id]?.presenceJDM?.false || 0,
          presenceJDMNR: sessionAggreg[session._id]?.presenceJDM?.NR || 0,
          departOui: sessionAggreg[session._id]?.depart?.true || 0,
          sanitaryFieldOui: sessionAggreg[session._id]?.sanitaryField?.true || 0,
          sanitaryFieldNon: sessionAggreg[session._id]?.sanitaryField?.false || 0,
          sanitaryFieldNR: sessionAggreg[session._id]?.sanitaryField?.NR || 0,
        };
      } else {
        acc[session.cohesionCenterId].total += sessionAggreg[session._id]?.total || 0;
        acc[session.cohesionCenterId].presenceOui += sessionAggreg[session._id]?.presence?.true || 0;
        acc[session.cohesionCenterId].presenceNon += sessionAggreg[session._id]?.presence?.false || 0;
        acc[session.cohesionCenterId].presenceNR += sessionAggreg[session._id]?.presence?.NR || 0;
        acc[session.cohesionCenterId].presenceJDMOui += sessionAggreg[session._id]?.presenceJDM?.true || 0;
        acc[session.cohesionCenterId].presenceJDMNon += sessionAggreg[session._id]?.presenceJDM?.false || 0;
        acc[session.cohesionCenterId].presenceJDMNR += sessionAggreg[session._id]?.presenceJDM?.NR || 0;
        acc[session.cohesionCenterId].departOui += sessionAggreg[session._id]?.depart?.true || 0;
        acc[session.cohesionCenterId].sanitaryFieldOui += sessionAggreg[session._id]?.sanitaryField?.true || 0;
        acc[session.cohesionCenterId].sanitaryFieldNon += sessionAggreg[session._id]?.sanitaryField?.false || 0;
        acc[session.cohesionCenterId].sanitaryFieldNR += sessionAggreg[session._id]?.sanitaryField?.NR || 0;
      }
      return acc;
    }, {});
  }

  for (const id of cohesionCenterIds) {
    if (!sessionByCenter[id]) {
      sessionByCenter[id] = {
        centerId: id,
      };
    }
  }
  return Object.values(sessionByCenter);
};

export default function ListPresence() {
  const user = useSelector((state) => state.Auth.user);
  const [cohesionCenterIds, setCohesionCenterIds] = useState([]);
  const [youngByCenter, setYoungByCenter] = useState([]);
  const history = useHistory();

  const [data, setData] = React.useState([]);
  const pageId = "centrePresence";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({
    size: 20,
    page: 0,
  });

  const filterArray = [
    { title: "Cohorte", name: "cohorts", datafield: "cohorts.keyword", missingLabel: "Non renseignée", parentGroup: "Centre" },
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          title: "Région",
          name: "region",
          datafield: "region.keyword",
          missingLabel: "Non renseignée",
          defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
          parentGroup: "Centre",
        }
      : null,
    {
      title: "Département",
      name: "department",
      datafield: "department.keyword",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
      parentGroup: "Centre",
    },
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          title: "Académie",
          name: "demy",
          datafield: "demy.keyword",
          missingLabel: "Non renseignée",
          parentGroup: "Centre",
        }
      : null,
    {
      name: "status",
      title: "Statut d’inscription",
      fullValue: "Tous",
      options: Object.values(YOUNG_STATUS).map((status) => ({ key: status })),
      translate: translateInscriptionStatus,
      disabledBaseQuery: true,
      parentGroup: "Volontaire",
    },
    {
      name: "statusPhase1",
      title: "Statut de phase 1",
      fullValue: "Tous",
      options: Object.keys(YOUNG_STATUS_PHASE1)
        .filter((s) => ![YOUNG_STATUS_PHASE1.WAITING_LIST, YOUNG_STATUS_PHASE1.WITHDRAWN].includes(s))
        .map((status) => ({ key: status })),
      translate: translatePhase1,
      disabledBaseQuery: true,
      parentGroup: "Volontaire",
    },
    user.role === ROLES.ADMIN ? { title: "Code", name: "code2022", datafield: "code2022.keyword", missingLabel: "Non renseignée", parentGroup: "Centre" } : null,
  ].filter((e) => e);

  const searchBarObject = {
    placeholder: "Rechercher par mots clés, ville, code postal...",
    datafield: ["name", "city", "zip", "code2022"],
  };

  const getDefaultQuery = () => {
    if (user.role === ROLES.ADMIN) {
      return {
        size: ES_NO_LIMIT,
        query: {
          bool: { must: [{ match_all: {} }] },
        },
        track_total_hits: true,
      };
    } else if (user.role === ROLES.REFERENT_DEPARTMENT) {
      return {
        size: ES_NO_LIMIT,
        query: {
          bool: { must: [{ match_all: {} }, { terms: { "department.keyword": user.department } }] },
        },
        track_total_hits: true,
      };
    } else if (user.role === ROLES.REFERENT_REGION) {
      return {
        size: ES_NO_LIMIT,
        query: {
          bool: { must: [{ match_all: {} }, { term: { "region.keyword": user.region } }] },
        },
        track_total_hits: true,
      };
    }
  };

  //Get List of Cohesion Center Ids
  useEffect(() => {
    if (data) setCohesionCenterIds(data.map((center) => center._id));
  }, [data]);

  //fetch list young by session phase 1
  useEffect(() => {
    (async () => {
      const list = await getAggregCenter(cohesionCenterIds, selectedFilters);
      setYoungByCenter(list);
    })();
  }, [cohesionCenterIds]);

  return (
    <div className="flex flex-1 flex-col w-full p-8 gap-8">
      <Title>Centres</Title>
      <div className="flex-1 flex-column bg-white flex-wrap rounded-lg py-4">
        <div className="mx-4">
          <div className="flex flex-row justify-between w-full">
            <Filters
              pageId={pageId}
              esId="cohesioncenter"
              defaultQuery={getDefaultQuery()}
              setData={(value) => setData(value)}
              filters={filterArray}
              searchBarObject={searchBarObject}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
            />
            <ExportComponentV2
              title="Exporter"
              defaultQuery={getDefaultQuery()}
              filters={filterArray}
              exportTitle="Centres_de_cohesion"
              index="cohesioncenter"
              transform={async (all) => {
                const cohesionCenterIds = all?.map((center) => center._id.toString());
                const dataCenter = await getAggregCenter(cohesionCenterIds, selectedFilters);

                return all?.map((data) => {
                  const sessionsPhase1 = dataCenter.find((e) => e.centerId === data._id);
                  return {
                    Id: data._id.toString(),
                    "Code du centre": data?.code2022,
                    Nom: data?.name,
                    "Présence JDM - Présent": sessionsPhase1?.presenceJDMOui || 0,
                    "Présence JDM - Absent": sessionsPhase1?.presenceJDMNon || 0,
                    "Présence JDM - Non renseigné": sessionsPhase1?.presenceJDMNR || 0,
                    "Présence JDM - Non renseigné (%)": (Math.round((sessionsPhase1?.presenceJDMNR / sessionsPhase1?.total) * 100) || 0) + "%",
                    "Présence à l’arrivée - Présent": sessionsPhase1?.presenceOui || 0,
                    "Présence à l’arrivée - Absent": sessionsPhase1?.presenceNon || 0,
                    "Présence à l’arrivée - Non renseigné": sessionsPhase1?.presenceNR || 0,
                    "Présence à l’arrivée - Non renseigné (%)": (Math.round((sessionsPhase1?.presenceNR / sessionsPhase1?.total) * 100) || 0) + "%",
                    Départ: sessionsPhase1?.departOui || 0,
                    "Fiche sanitaire - Renseignée": sessionsPhase1?.sanitaryFieldOui || 0,
                    "Fiche sanitaire - Non renseignée": sessionsPhase1?.sanitaryFieldNon + sessionsPhase1?.sanitaryFieldNR || 0,
                    "Fiche sanitaire - Non renseignée (%)":
                      (Math.round(((sessionsPhase1?.sanitaryFieldNon + sessionsPhase1?.sanitaryFieldNR) / sessionsPhase1?.total) * 100) || 0) + "%",
                    "Total des jeunes": sessionsPhase1?.total || 0,
                  };
                });
              }}
              selectedFilters={selectedFilters}
              searchBarObject={searchBarObject}
              icon={<BsDownload className="text-gray-400" />}
              css={{
                override: true,
                button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
                loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
              }}
            />
          </div>
          <div className="mt-2 flex flex-row flex-wrap items-center">
            <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
            <SelectedFilters
              filterArray={filterArray}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
            />
          </div>
        </div>
        <ResultTable
          paramData={paramData}
          setParamData={setParamData}
          currentEntryOnPage={data?.length}
          render={
            <div className="flex w-full flex-col mt-6 mb-2 border-y-[1px] border-gray-100">
              <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4">
                <div className="w-[30%] uppercase">Centre</div>
                <div className="w-[20%] uppercase">présence JDM</div>
                <div className="w-[20%] uppercase">présence à l’arrivée</div>
                <div className="w-[10%] uppercase">départ</div>
                <div className="w-[20%] uppercase">FICHE SANITAIRE</div>
              </div>
              {data.map((hit) => (
                <Hit
                  key={hit._id}
                  hit={hit}
                  history={history}
                  onClick={() => history.push(`/centre/${hit._id}`)}
                  sessionsPhase1={youngByCenter.find((e) => e.centerId === hit._id)}
                />
              ))}
            </div>
          }
        />
      </div>
    </div>
  );
}

const Hit = ({ hit, sessionsPhase1, onClick, history }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionsPhase1) setIsLoading(false);
  }, [sessionsPhase1]);

  return (
    <div onClick={onClick} className="flex py-3 items-center px-4 cursor-pointer hover:bg-gray-50 border-t-[1px] border-gray-100">
      <div className="flex flex-col gap-1 w-[30%]">
        <div className="font-bold leading-6 text-gray-900 truncate">{hit?.name}</div>
        <div className="font-normal text-xs leading-4 text-gray-500">{`${hit?.city || ""} • ${hit?.department || ""}`}</div>
      </div>
      <div className="flex flex-col gap-2 w-[20%]">
        {isLoading ? (
          <Loading width="w-[50%]" />
        ) : (
          <>
            <span className="text-sm leading-none font-normal text-gray-900">
              <strong>{sessionsPhase1?.presenceJDMOui || 0}</strong> Présents <strong>{sessionsPhase1?.presenceJDMNon || 0}</strong> Absents
            </span>
            <span className="text-xs leading-none font-normal text-gray-500 uppercase">
              <strong>{sessionsPhase1?.presenceJDMNR || 0}</strong> non renseignés ({Math.round((sessionsPhase1?.presenceJDMNR / sessionsPhase1?.total) * 100) || 0}%)
            </span>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2 w-[20%]">
        {isLoading ? (
          <Loading width="w-[50%]" />
        ) : (
          <>
            <span className="text-sm leading-none font-normal text-gray-900">
              <strong>{sessionsPhase1?.presenceOui || 0}</strong> Présents <strong>{sessionsPhase1?.presenceNon || 0}</strong> Absents
            </span>
            <span className="text-xs leading-none font-normal text-gray-500 uppercase">
              <strong>{sessionsPhase1?.presenceNR || 0}</strong> non renseignés ({Math.round((sessionsPhase1?.presenceNR / sessionsPhase1?.total) * 100) || 0}%)
            </span>
          </>
        )}
      </div>
      <div className="flex items-center w-[10%] text-sm leading-none font-normal text-gray-900">
        {isLoading ? <Loading width="w-[50%]" /> : <strong>{sessionsPhase1?.departOui || 0}</strong>}
      </div>
      <div className="flex flex-col gap-2 w-[20%]">
        {isLoading ? (
          <Loading width="w-[50%]" />
        ) : (
          <>
            <span className="text-sm leading-none font-normal text-gray-900">
              <strong>{sessionsPhase1?.sanitaryFieldOui || 0}</strong> Renseignées ({Math.round((sessionsPhase1?.sanitaryFieldOui / sessionsPhase1?.total) * 100) || 0}%)
            </span>
            <span className="text-sm leading-none font-normal text-gray-900">
              <strong>{sessionsPhase1?.sanitaryFieldNR + sessionsPhase1?.sanitaryFieldNon || 0}</strong> Non renseignées (
              {Math.round(((sessionsPhase1?.sanitaryFieldNR + sessionsPhase1?.sanitaryFieldNon) / sessionsPhase1?.total) * 100) || 0}%)
            </span>
          </>
        )}
      </div>
    </div>
  );
};
