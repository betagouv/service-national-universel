import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BsDownload } from "react-icons/bs";
import api from "../../services/api";
import {
  COHESION_STAY_START,
  COHORTS,
  translate,
  formatLongDateFR,
  ES_NO_LIMIT,
  ROLES,
  canCreateOrUpdateCohesionCenter,
  translateTypologieCenter,
  translateDomainCenter,
  getDepartmentNumber,
} from "snu-lib";
import { Title } from "../pointDeRassemblement/components/common";
import { TabItem, Badge } from "./components/commons";
import Breadcrumbs from "../../components/Breadcrumbs";
import Menu from "../../assets/icons/Menu";
import Calendar from "../../assets/icons/Calendar";

import { useHistory, useParams } from "react-router-dom";

import ModalRattacherCentre from "./components/ModalRattacherCentre";

import { Filters, ResultTable, getDefaultQuery, Save, SelectedFilters, ExportComponent } from "../../components/filters-system-v2";

export default function List() {
  const user = useSelector((state) => state.Auth.user);

  const history = useHistory();
  const { currentTab } = useParams();

  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    const listTab = ["liste-centre", "session"];
    if (!currentTab || !listTab.includes(currentTab)) return history.replace(`/centre/liste/liste-centre`);
  }, [currentTab]);

  const [firstSession, setFirstSession] = useState(null);
  const getFirstCohortAvailable = () => {
    for (const session of COHORTS) {
      if (Object.prototype.hasOwnProperty.call(COHESION_STAY_START, session) && COHESION_STAY_START[session].getTime() > new Date().getTime()) {
        return setFirstSession(session);
      }
    }
  };

  useEffect(() => {
    getFirstCohortAvailable();
  }, []);

  return (
    <div className="mb-8">
      <Breadcrumbs items={[{ label: "Centres" }]} />
      <ModalRattacherCentre isOpen={modalVisible} onCancel={() => setModalVisible(false)} user={user} />
      <div className="flex flex-row">
        <div className="flex flex-1 flex-col w-full px-8">
          <div className="py-8 flex items-center justify-between">
            <Title>Centres</Title>
            {canCreateOrUpdateCohesionCenter(user) ? (
              <button
                className="border-[1px] border-blue-600 bg-blue-600 shadow-sm px-4 py-2 text-white hover:!text-blue-600 hover:bg-white transition duration-300 ease-in-out rounded-lg"
                onClick={() => setModalVisible(true)}>
                Rattacher un centre à un séjour
              </button>
            ) : null}
          </div>
          <div>
            <div className="flex flex-1">
              <TabItem icon={<Menu />} title="Liste des centres" onClick={() => history.replace(`/centre/liste/liste-centre`)} active={currentTab === "liste-centre"} />
              <TabItem icon={<Calendar />} title="Sessions" onClick={() => history.replace(`/centre/liste/session`)} active={currentTab === "session"} />
            </div>
            <div className={`bg-white rounded-b-lg rounded-tr-lg mb-8 relative items-start`}>
              <div className="flex flex-col w-full pt-4">
                {currentTab === "liste-centre" && <ListCenter firstSession={firstSession} />}
                {currentTab === "session" && <ListSession firstSession={firstSession} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ListSession = ({ firstSession }) => {
  const user = useSelector((state) => state.Auth.user);
  const [cohesionCenterIds, setCohesionCenterIds] = useState([]);
  const [cohesionCenter, setCohesionCenter] = useState([]);

  const history = useHistory();

  const [data, setData] = React.useState([]);
  const pageId = "centerSession";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({
    page: 0,
  });
  const filterArray = [
    { title: "Cohorte", name: "cohort", missingLabel: "Non renseignée", defaultValue: [firstSession] },
    { title: "Région", name: "region", missingLabel: "Non renseignée" },
    {
      title: "Département",
      name: "department",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
    { title: "Places restantes", name: "placesLeft", missingLabel: "Non renseignée" },
    { title: "Emploi du temps", name: "hasTimeSchedule", missingLabel: "Non renseignée", translate: translate },
  ];
  if (user.role === ROLES.ADMIN) filterArray.push({ title: "Code", name: "code", missingLabel: "Non renseignée" });

  useEffect(() => {
    (async () => {
      if (cohesionCenterIds?.length) {
        const { responses } = await api.esQuery("cohesioncenter", {
          size: ES_NO_LIMIT,
          query: { bool: { must: { match_all: {} }, filter: { terms: { _id: cohesionCenterIds } } } },
        });
        if (responses?.length) {
          setCohesionCenter(responses[0]?.hits?.hits || []);
        }
      }
    })();
  }, [cohesionCenterIds]);
  React.useEffect(() => {
    if (data) setCohesionCenterIds(data.map((pdr) => pdr._id));
  }, [data]);

  if (!firstSession) return <div></div>;
  return (
    <div className="flex-1 flex-column bg-white flex-wrap">
      <div className="mx-4">
        <div className="flex flex-row justify-between w-full">
          <Filters
            pageId={pageId}
            route="/elasticsearch/sessionphase1/search"
            setData={(value) => setData(value)}
            filters={filterArray}
            searchPlaceholder="Rechercher par mots clés, ville, code postal..."
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
          />
          <ExportComponent
            title="Exporter"
            exportTitle="Session"
            route="/elasticsearch/sessionphase1/export"
            transform={async (all) => {
              const { responses } = await api.esQuery("cohesioncenter", {
                size: ES_NO_LIMIT,
                query: { bool: { must: { match_all: {} }, filter: [{ terms: { _id: [...new Set(all.map((s) => s.cohesionCenterId))].filter((e) => e) } }] } },
                track_total_hits: true,
              });

              const centerList = responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } }));

              console.log([...new Set(all.map((s) => s.headCenterId))]);

              const { responses: responses2 } = await api.esQuery("referent", {
                size: ES_NO_LIMIT,
                query: { bool: { must: { match_all: {} }, filter: [{ terms: { _id: [...new Set(all.map((s) => s.headCenterId))].filter((e) => e) } }] } },
                track_total_hits: true,
              });

              const headCenters = responses2[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } }));

              return all
                .sort(function (a, b) {
                  let res = a?.nameCentre?.localeCompare(b?.nameCentre);

                  if (res === 0) {
                    res = COHESION_STAY_START[a.cohort] - COHESION_STAY_START[b.cohort];
                  }
                  return res;
                })
                .map((data) => {
                  const center = centerList.find((e) => e?.id?.toString() === data?.cohesionCenterId?.toString());
                  const headCenter = headCenters.find((e) => e?.id?.toString() === data?.headCenterId?.toString());
                  return {
                    "Id centre": center?.id?.toString(),
                    "Code du centre": center?.code2022,
                    "Nom du centre": center?.name,
                    "Désignation du centre": center?.centerDesignation,
                    "Id de la session": data?._id?.toString(),
                    "Cohort de la session": data.cohort,
                    "Statut de la session": translate(data.status),
                    "Accessibilité aux personnes à mobilité réduite": translate(center?.pmr),
                    "Capacité maximale d'accueil": center?.placesTotal,
                    "Place total de la session": data.placesTotal,
                    "Place restante de la session": data.placesLeft,
                    "Emploi du temps": data.hasTimeSchedule === "true" ? "Déposé" : "Non déposé",
                    Typologie: translateTypologieCenter(center?.typology),
                    Domaine: translateDomainCenter(center?.domain),
                    "Gestionnaire ou propriétaire": center?.complement,
                    Adresse: center?.address,
                    Ville: center?.city,
                    "Code postal": center?.zip,
                    Département: center?.department,
                    Académie: center?.academy,
                    Région: center?.region,
                    "Prénom du chef de centre": headCenter?.firstName || "",
                    "Nom du chef de centre": headCenter?.lastName || "",
                    "Email du chef de centre": headCenter?.email || "",
                    "Téléphone du chef de centre": headCenter?.mobile || headCenter?.phone || "",
                    "Créé le": formatLongDateFR(data.createdAt),
                    "Mis à jour le": formatLongDateFR(data.updatedAt),
                  };
                });
            }}
            selectedFilters={selectedFilters}
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
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>
      </div>
      <ResultTable
        paramData={paramData}
        setParamData={setParamData}
        currentEntryOnPage={data?.length}
        render={
          <div className="flex w-full flex-col gap-1 mt-6 mb-2">
            <hr />
            <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4">
              <div className="w-[40%]">Centre</div>
              <div className="w-[20%]">Cohortes</div>
              <div className="w-[20%]">Places</div>
              <div className="w-[20%]">Disponibilités</div>
            </div>
            {data.map((hit) => (
              <HitSession
                onClick={() => history.push(`/centre/${hit?.cohesionCenterId}?cohorte=${hit.cohort}`)}
                key={hit._id}
                center={cohesionCenter.filter((e) => e._id === hit.cohesionCenterId)[0]}
                hit={hit}
              />
            ))}
            <hr />
          </div>
        }
      />
    </div>
  );
};

const ListCenter = ({ firstSession }) => {
  const user = useSelector((state) => state.Auth.user);

  const [data, setData] = React.useState([]);
  const pageId = "centreList";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({
    page: 0,
  });
  const filterArray = [
    { title: "Cohorte", name: "cohorts", missingLabel: "Non renseignée" },
    {
      title: "Région",
      name: "region",
      missingLabel: "Non renseignée",
      defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
    },
    {
      title: "Département",
      name: "department",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
    },
  ];
  if (user.role === ROLES.ADMIN) filterArray.push({ title: "Code", name: "code2022", missingLabel: "Non renseignée" });

  // List of sessionPhase1 IDS currently displayed in results
  const [cohesionCenterIds, setCohesionCenterIds] = useState([]);
  // List of cohesionCenter associated to the sessionPhase1
  const [sessionsPhase1, setSessionsPhase1] = useState([]);

  useEffect(() => {
    (async () => {
      if (cohesionCenterIds?.length) {
        const { responses } = await api.esQuery("sessionphase1", {
          size: ES_NO_LIMIT,
          query: { bool: { must: { match_all: {} }, filter: [{ terms: { "cohesionCenterId.keyword": cohesionCenterIds } }] } },
        });
        if (responses.length) {
          setSessionsPhase1(responses[0]?.hits?.hits || []);
        }
      }
    })();
  }, [cohesionCenterIds]);

  const history = useHistory();

  React.useEffect(() => {
    if (data) setCohesionCenterIds(data.map((center) => center._id));
  }, [data]);

  if (!firstSession) return <div></div>;
  return (
    <div className="flex-1 flex-column bg-white flex-wrap">
      <div className="mx-4">
        <div className="flex flex-row justify-between w-full">
          <Filters
            pageId={pageId}
            route="/elasticsearch/cohesioncenter/search"
            setData={(value) => setData(value)}
            filters={filterArray}
            searchPlaceholder="Rechercher par mots clés, ville, code postal..."
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
          />
          <ExportComponent
            title="Exporter"
            filters={filterArray}
            exportTitle="Centres_de_cohesion"
            route="/elasticsearch/cohesioncenter/export"
            transform={(all) => {
              return all?.map((data) => {
                return {
                  Id: data._id.toString(),
                  "Code du centre": data?.code2022,
                  Nom: data?.name,
                  "Désignation du centre": data?.centerDesignation,
                  "Cohorte(s)": data?.cohorts?.sort((a, b) => COHESION_STAY_START[a.cohort] - COHESION_STAY_START[b.cohort]).join(", "),
                  "Accessibilité aux personnes à mobilité réduite": translate(data?.pmr),
                  "Capacité maximale d'accueil": data?.placesTotal,
                  Typologie: translateTypologieCenter(data?.typology),
                  Domaine: translateDomainCenter(data?.domain),
                  "Gestionnaire ou propriétaire": data?.complement,
                  Adresse: data?.address,
                  Ville: data?.city,
                  "Code postal": data?.zip,
                  Département: data?.department,
                  Académie: data?.academy,
                  Région: data?.region,
                  "Créé lé": formatLongDateFR(data.createdAt),
                  "Mis à jour le": formatLongDateFR(data.updatedAt),
                };
              });
            }}
            selectedFilters={selectedFilters}
            searchPlaceholder="Rechercher par mots clés, ville, code postal..."
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
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>
      </div>

      <ResultTable
        paramData={paramData}
        setParamData={setParamData}
        currentEntryOnPage={data?.length}
        render={
          <div className="flex w-full flex-col gap-1 mt-6 mb-2">
            <hr />
            <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4">
              <div className="w-[40%]">Centre</div>
              <div className="w-[60%]">Cohortes à venir</div>
            </div>
            {data.map((hit) => (
              <Hit
                key={hit._id}
                hit={hit}
                history={history}
                onClick={() => history.push(`/centre/${hit._id}`)}
                sessionsPhase1={sessionsPhase1.filter((e) => e?._source?.cohesionCenterId === hit._id).map((e) => e)}
              />
            ))}
            <hr />
          </div>
        }
      />
    </div>
  );
};
const Hit = ({ hit, sessionsPhase1, onClick, history }) => {
  const orderedSession = sessionsPhase1.sort((a, b) => COHESION_STAY_START[a._source.cohort] - COHESION_STAY_START[b._source.cohort]);
  return (
    <>
      <hr />
      <div onClick={onClick} className="flex py-3 items-center px-4 hover:bg-gray-50 cursor-pointer">
        <div className="flex flex-col gap-1 w-[40%]">
          <div className="font-bold leading-6 text-gray-900">{hit?.name}</div>
          <div className="font-normal text-sm leading-4 text-gray-500">{`${hit?.city || ""} • ${hit?.department || ""}`}</div>
        </div>
        <div className="flex items-center flex-wrap w-[60%]">
          {orderedSession.map((sessionPhase1) => (
            <div className="p-1" key={sessionPhase1._id}>
              <div className="flex items-center">
                <Badge
                  onClick={(e) => {
                    e.stopPropagation();
                    history.push(`/centre/${sessionPhase1._source.cohesionCenterId}?cohorte=${sessionPhase1._source.cohort}`);
                  }}
                  cohort={sessionPhase1._source}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
const HitSession = ({ center, hit, onClick }) => {
  return (
    <>
      <hr />
      <div onClick={onClick} className="flex py-3 items-center px-4 hover:bg-gray-50 cursor-pointer">
        <div className="flex flex-col gap-1 w-[40%]">
          <div className="font-bold leading-6 text-gray-900">{center?._source.name}</div>
          <div className="font-normal text-sm leading-4 text-gray-500">{`${center?._source.city || ""} • ${center?._source.department || ""}`}</div>
        </div>
        <div className="flex items-center flex-wrap w-[20%]">
          <Badge cohort={hit} />
        </div>
        <div className="flex flex-col w-[20%]">
          <div>
            {hit.placesLeft === 0 ? (
              <div className="text-xs text-grey-500">0 place</div>
            ) : (
              <div className="text-xs text-400">{hit.placesLeft > 1 ? hit.placesLeft + " places" : hit.placesLeft + " place"}</div>
            )}
          </div>
          <div className="text-xs flex flex-row">
            <div className="text-grey-500">sur</div>
            <div>&nbsp;{hit.placesTotal}</div>
          </div>
        </div>
        <div className="flex items-center flex-wrap w-[20%]">
          {hit.placesLeft === 0 ? (
            <div className="text-gray-700 font-bold bg-gray-200 rounded w-fit px-1 text-sm">COMPLET</div>
          ) : (
            <div className="text-[#0063CB] font-bold bg-[#E8EDFF] rounded w-fit px-1 text-sm">PLACES DISPONIBLES</div>
          )}
        </div>
      </div>
    </>
  );
};
