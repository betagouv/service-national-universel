import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";
import { BsDownload } from "react-icons/bs";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import { translate, formatLongDateFR, ES_NO_LIMIT, ROLES, canCreateOrUpdateCohesionCenter, translateTypologieCenter, translateDomainCenter } from "../../utils";

import { COHESION_STAY_START, COHORTS } from "snu-lib";

import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Title } from "../pointDeRassemblement/components/common";
import { FilterButton, TabItem, Badge } from "./components/commons";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import plausibleEvent from "../../services/plausible";
import Breadcrumbs from "../../components/Breadcrumbs";
import Menu from "../../assets/icons/Menu";
import Calendar from "../../assets/icons/Calendar";

import DeleteFilters from "../../components/buttons/DeleteFilters";
import { useHistory } from "react-router-dom";

import ModalRattacherCentre from "./components/ModalRattacherCentre";

const FILTERS = ["SEARCH", "PLACES", "COHORT", "DEPARTMENT", "REGION", "STATUS", "CODE2022"];

export default function List() {
  const user = useSelector((state) => state.Auth.user);

  const [modalVisible, setModalVisible] = useState(false);

  const [currentTab, setCurrentTab] = useState("liste-centre");

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
              <TabItem icon={<Menu />} title="Liste des centres" onClick={() => setCurrentTab("liste-centre")} active={currentTab === "liste-centre"} />
              <TabItem icon={<Calendar />} title="Sessions" onClick={() => setCurrentTab("session")} active={currentTab === "session"} />
            </div>
            <div className={`bg-white rounded-b-lg rounded-tr-lg relative items-start`}>
              <div className="flex flex-col w-full">
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
  const [filterVisible, setFilterVisible] = useState(false);
  const user = useSelector((state) => state.Auth.user);
  const [cohesionCenterIds, setCohesionCenterIds] = useState([]);
  const [cohesionCenter, setCohesionCenter] = useState([]);
  const getDefaultQuery = () => {
    if (user.role === ROLES.ADMIN) {
      return { query: { match_all: {} }, track_total_hits: true };
    } else if (user.role === ROLES.REFERENT_DEPARTMENT) {
      return {
        query: {
          terms: {
            department: user.department,
          },
        },
        track_total_hits: true,
      };
    } else if (user.role === ROLES.REFERENT_REGION) {
      return {
        query: {
          bool: {
            must: { match: { region: user.region } },
          },
        },
        track_total_hits: true,
      };
    }
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });
  useEffect(() => {
    (async () => {
      if (cohesionCenterIds?.length) {
        const { responses } = await api.esQuery("cohesioncenter", {
          size: ES_NO_LIMIT,
          query: { bool: { must: { match_all: {} }, filter: [{ terms: { _id: cohesionCenterIds } }] } },
        });
        if (responses?.length) {
          setCohesionCenter(responses[0]?.hits?.hits || []);
        }
      }
    })();
  }, [cohesionCenterIds]);
  const history = useHistory();

  if (!firstSession) return <div></div>;
  return (
    <ReactiveBase url={`${apiURL}/es`} app="sessionphase1" headers={{ Authorization: `JWT ${api.getToken()}` }}>
      <div className="flex-1 flex-column bg-white flex-wrap">
        <div className="flex flex-row pt-4 justify-between items-center mx-8">
          <div className="flex flex-row">
            <DataSearch
              defaultQuery={getDefaultQuery}
              showIcon={false}
              placeholder="Rechercher par mots clés, ville, code postal..."
              componentId="SEARCH"
              dataField={["nameCentre", "cityCentre", "zipCentre", "codeCentre"]}
              react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
              style={{ marginRight: "1rem", flex: 1 }}
              innerClass={{ input: "searchbox" }}
              className="datasearch-searchfield"
              URLParams={true}
              autosuggest={false}
            />
            <FilterButton onClick={() => setFilterVisible((filterVisible) => !filterVisible)} />
          </div>
          <ExportComponent
            handleClick={() => plausibleEvent("Centres/CTA - Exporter centres")}
            title="Exporter"
            defaultQuery={getExportQuery}
            exportTitle="Session"
            icon={<BsDownload className="text-gray-400" />}
            index="sessionphase1"
            react={{ and: FILTERS }}
            css={{
              override: true,
              button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
              loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
            }}
            transform={async (all) => {
              const { responses } = await api.esQuery("cohesioncenter", {
                size: ES_NO_LIMIT,
                query: { match_all: {} },
                track_total_hits: true,
              });

              const centerList = responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } }));

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
                    Typologie: translateTypologieCenter(center?.typology),
                    Domaine: translateDomainCenter(center?.domain),
                    "Gestionnaire ou propriétaire": center?.complement,
                    Adresse: center?.address,
                    Ville: center?.city,
                    "Code postal": center?.zip,
                    Département: center?.department,
                    Académie: center?.academy,
                    Région: center?.region,
                    "Créé lé": formatLongDateFR(data.createdAt),
                    "Mis à jour le": formatLongDateFR(data.updatedAt),
                  };
                });
            }}
          />
        </div>

        <div className={`mt-3 gap-2 flex flex-wrap mx-8 items-center ${!filterVisible ? "hidden" : ""}`}>
          <MultiDropdownList
            defaultQuery={getDefaultQuery}
            className="dropdown-filter"
            componentId="COHORT"
            placeholder="Cohortes"
            dataField="cohort.keyword"
            react={{ and: FILTERS.filter((e) => e !== "COHORT") }}
            renderItem={(e, count) => {
              return `${translate(e)} (${count})`;
            }}
            title=""
            URLParams={true}
            showSearch={false}
            defaultValue={[firstSession]}
          />
          <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []} />
          <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? user.department : []} />
          {user.role === ROLES.ADMIN ? (
            <MultiDropdownList
              defaultQuery={getDefaultQuery}
              className="dropdown-filter"
              placeholder="Code"
              componentId="CODE2022"
              dataField="codeCentre.keyword"
              react={{ and: FILTERS.filter((e) => e !== "CODE2022") }}
              title=""
              URLParams={true}
              sortBy="asc"
              showSearch={true}
              searchPlaceholder="Rechercher..."
              showMissing
              missingLabel="Non renseigné"
            />
          ) : null}
          <MultiDropdownList
            defaultQuery={getDefaultQuery}
            className="dropdown-filter"
            placeholder="Places restantes"
            componentId="PLACES"
            dataField="placesLeft"
            react={{ and: FILTERS.filter((e) => e !== "PLACES") }}
            title=""
            URLParams={true}
            sortBy="asc"
            showSearch={false}
          />
          <MultiDropdownList
            defaultQuery={getDefaultQuery}
            className="dropdown-filter"
            componentId="STATUS"
            dataField="sessionStatus.keyword"
            react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
            renderItem={(e, count) => {
              return `${translate(e)} (${count})`;
            }}
            title=""
            URLParams={true}
            showSearch={false}
          />
          <DeleteFilters />
        </div>

        <div className="reactive-result">
          <ReactiveListComponent
            defaultQuery={getDefaultQuery}
            paginationAt="bottom"
            showTopResultStats={false}
            react={{ and: FILTERS }}
            onData={({ rawData }) => {
              if (rawData?.hits?.hits) setCohesionCenterIds(rawData.hits.hits.filter((e) => e?._source?.cohesionCenterId).map((e) => e._source.cohesionCenterId));
            }}
            render={({ data }) => (
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
            )}
          />
        </div>
      </div>
    </ReactiveBase>
  );
};
const ListCenter = ({ firstSession }) => {
  const [filterVisible, setFilterVisible] = useState(false);
  // List of sessionPhase1 IDS currently displayed in results
  const [cohesionCenterIds, setCohesionCenterIds] = useState([]);
  // List of cohesionCenter associated to the sessionPhase1
  const [sessionsPhase1, setSessionsPhase1] = useState([]);

  // list of cohorts selected, used for filtering the sessionPhase1 displayed inline
  const [filterCohorts, setFilterConhorts] = useState([]);

  const user = useSelector((state) => state.Auth.user);

  const getDefaultQuery = () => {
    return { query: { match_all: {} }, track_total_hits: true };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

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

  if (!firstSession) return <div></div>;
  return (
    <ReactiveBase url={`${apiURL}/es`} app="cohesioncenter" headers={{ Authorization: `JWT ${api.getToken()}` }}>
      <div className="flex-1 flex-column bg-white mx-8 flex-wrap">
        <div className="flex flex-row pt-4 justify-between items-center">
          <div className="flex flex-row">
            <DataSearch
              defaultQuery={getDefaultQuery}
              showIcon={false}
              placeholder="Rechercher par mots clés, ville, code postal..."
              componentId="SEARCH"
              dataField={["name", "city", "zip", "code2022"]}
              react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
              style={{ marginRight: "1rem", flex: 1 }}
              innerClass={{ input: "searchbox" }}
              className="datasearch-searchfield"
              URLParams={true}
              autosuggest={false}
            />
            <FilterButton onClick={() => setFilterVisible((filterVisible) => !filterVisible)} />
          </div>
          <ExportComponent
            handleClick={() => plausibleEvent("Centres/CTA - Exporter centres")}
            title="Exporter"
            defaultQuery={getExportQuery}
            exportTitle="Centres_de_cohesion"
            index="cohesioncenter"
            react={{ and: FILTERS }}
            css={{
              override: true,
              button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
              loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
            }}
            icon={<BsDownload className="text-gray-400" />}
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
          />
        </div>
        <div className={`mt-3 gap-2 flex flex-wrap items-center ${!filterVisible ? "hidden" : ""}`}>
          <MultiDropdownList
            defaultQuery={getDefaultQuery}
            className="dropdown-filter"
            componentId="COHORT"
            placeholder="Cohortes"
            dataField="cohorts.keyword"
            react={{ and: FILTERS.filter((e) => e !== "COHORT") }}
            renderItem={(e, count) => {
              return `${translate(e)} (${count})`;
            }}
            title=""
            URLParams={true}
            showSearch={false}
            onValueChange={setFilterConhorts}
            defaultValue={[firstSession]}
          />
          <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []} />
          <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? user.department : []} />
          {user.role === ROLES.ADMIN ? (
            <MultiDropdownList
              defaultQuery={getDefaultQuery}
              className="dropdown-filter"
              placeholder="Code"
              componentId="CODE2022"
              dataField="code2022.keyword"
              react={{ and: FILTERS.filter((e) => e !== "CODE2022") }}
              title=""
              URLParams={true}
              sortBy="asc"
              showSearch={true}
              searchPlaceholder="Rechercher..."
              showMissing
              missingLabel="Non renseigné"
            />
          ) : null}
          <DeleteFilters />
        </div>
      </div>
      <div className="reactive-result">
        <ReactiveListComponent
          defaultQuery={getDefaultQuery}
          paginationAt="bottom"
          showTopResultStats={false}
          react={{ and: FILTERS }}
          onData={({ rawData }) => {
            if (rawData?.hits?.hits) setCohesionCenterIds(rawData.hits.hits.map((e) => e._id));
          }}
          render={({ data }) => (
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
                  sessionsPhase1={sessionsPhase1
                    .filter((e) => e?._source?.cohesionCenterId === hit._id && (!filterCohorts.length || filterCohorts.includes(e?._source?.cohort)))
                    .map((e) => e)}
                />
              ))}
              <hr />
            </div>
          )}
        />
      </div>
    </ReactiveBase>
  );
};
const Hit = ({ hit, sessionsPhase1, onClick, history }) => {
  return (
    <>
      <hr />
      <div onClick={onClick} className="flex py-3 items-center px-4 hover:bg-gray-50 cursor-pointer">
        <div className="flex flex-col gap-1 w-[40%]">
          <div className="font-bold leading-6 text-gray-900">{hit?.name}</div>
          <div className="font-normal text-sm leading-4 text-gray-500">{`${hit?.city || ""} • ${hit?.department || ""}`}</div>
        </div>
        <div className="flex items-center flex-wrap w-[60%]">
          {sessionsPhase1.map((sessionPhase1) => (
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
