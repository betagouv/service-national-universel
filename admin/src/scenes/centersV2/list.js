import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { translate, getFilterLabel, formatLongDateFR, ES_NO_LIMIT, ROLES, canCreateOrUpdateCohesionCenter, translateSessionStatus, COHORTS } from "../../utils";

import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Table, Header, Title, MultiLine, SubTd } from "../../components/list";
import { FilterButton, TabItem } from "./components/commons";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import plausibleEvent from "../../services/plausible";
import Breadcrumbs from "../../components/Breadcrumbs";
import Menu from "../../assets/icons/Menu";
import Calendar from "../../assets/icons/Calendar";

import { useHistory } from "react-router-dom";

const FILTERS = ["SEARCH", "PLACES", "COHORT", "DEPARTMENT", "REGION", "STATUS", "CODE2022"];

export default function List() {
  const [center, setCenter] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  // List of sessionPhase1 IDS currently displayed in results
  const [cohesionCenterIds, setCohesionCenterIds] = useState([]);
  // List of cohesionCenter associated to the sessionPhase1
  const [sessionsPhase1, setSessionsPhase1] = useState([]);

  // list of cohorts selected, used for filtering the sessionPhase1 displayed inline
  const [filterCohorts, setFilterConhorts] = useState([]);
  const [filterSessionStatus, setfilterSessionStatus] = useState([]);

  const user = useSelector((state) => state.Auth.user);
  const getDefaultQuery = () => {
    return { query: { match_all: {} }, track_total_hits: true };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });
  const [currentTab, setCurrentTab] = useState("liste-centre");
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

  return (
    <div>
      <Breadcrumbs items={[{ label: "Centres" }]} />
      <div className="flex flex-col w-full px-8">
        <div className="py-8 flex items-center justify-between">
          <Title>Centres</Title>
          {canCreateOrUpdateCohesionCenter(user) ? (
            <button
              className="border-[1px] border-blue-600 bg-blue-600 shadow-sm px-4 py-2 text-white hover:!text-blue-600 hover:bg-white transition duration-300 ease-in-out rounded-lg"
              onClick={() => null}>
              Rattacher un centre à un séjour
            </button>
          ) : null}
        </div>
        <div>
          <div className="flex flex-1">
            <TabItem icon={<Menu />} title="Liste des centres" onClick={() => setCurrentTab("liste-centre")} active={currentTab === "liste-centre"} />
            <TabItem icon={<Calendar />} title="Sessions" onClick={() => setCurrentTab("session")} active={currentTab === "session"} />
          </div>
          <ReactiveBase url={`${apiURL}/es`} app="cohesioncenter" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div className={`bg-white rounded-b-lg rounded-tr-lg relative`}>
              <div className="flex-1 flex-column bg-white mx-8 flex-wrap">
                <div className="flex flex-row pt-4 justify-between items-center">
                  <div className="flex flex-row">
                    <DataSearch
                      defaultQuery={getDefaultQuery}
                      showIcon={false}
                      placeholder="Rechercher par mots clés, ville, code postal..."
                      componentId="SEARCH"
                      dataField={["name", "city", "zip", "code", "code2022"]}
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
                      button: `text-grey-700 cursor-pointer bg-white w-28 border border-gray-300 h-10 rounded-md`,
                      loadingButton: `text-grey-700 cursor-pointer bg-white w-28 border border-gray-300 h-10 rounded-md w-full`,
                    }}
                    transform={(all) => {
                      return all.map((data) => {
                        let statutExport = {};
                        COHORTS.forEach((cohort) => {
                          statutExport[`${cohort} statut`] = "";
                          data.cohorts.map((e, index) => {
                            if (e === cohort) {
                              if (data.sessionStatus !== undefined) {
                                statutExport[`${cohort} statut`] = translateSessionStatus(data.sessionStatus[index]) || "";
                              }
                            }
                          });
                        });
                        return {
                          Nom: data.name,
                          id: data._id,
                          "Code (2021)": data.code,
                          "Code (2022)": data.code2022,
                          "Cohorte(s)": data.cohorts?.join(", "),
                          COR: data.COR,
                          "Accessibilité aux personnes à mobilité réduite": translate(data.pmr),
                          Adresse: data.address,
                          Ville: data.city,
                          "Code Postal": data.zip,
                          "N˚ Département": data.departmentCode,
                          Département: data.department,
                          Région: data.region,
                          "Places total": data.placesTotal,
                          "Places disponibles": data.placesLeft,
                          "Tenues livrées": data.outfitDelivered,
                          Observations: data.observations,
                          "Créé lé": formatLongDateFR(data.createdAt),
                          "Mis à jour le": formatLongDateFR(data.updatedAt),
                          ...statutExport,
                        };
                      });
                    }}
                  />
                </div>
                {filterVisible && (
                  <div className="mt-3 gap-2 flex flex-wrap">
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="COHORT"
                      dataField="cohorts.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "COHORT") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Cohortes", "Cohortes")}
                      onValueChange={setFilterConhorts}
                    />
                    <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []} />
                    <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? user.department : []} />
                    {user.role === ROLES.ADMIN ? (
                      <MultiDropdownList
                        defaultQuery={getDefaultQuery}
                        className="dropdown-filter"
                        placeholder="Code 2022"
                        componentId="CODE2022"
                        dataField="code2022.keyword"
                        react={{ and: FILTERS.filter((e) => e !== "CODE2022") }}
                        title=""
                        URLParams={true}
                        sortBy="asc"
                        showSearch={true}
                        searchPlaceholder="Rechercher..."
                        renderLabel={(items) => getFilterLabel(items, "Code 2022", "Code 2022")}
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
                      renderLabel={(items) => getFilterLabel(items, "Places restantes", "Places restantes")}
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
                      renderLabel={(items) => getFilterLabel(items, "Statut", "Statut")}
                      onValueChange={setfilterSessionStatus}
                    />
                    {/*<DeleteFilters />*/}
                  </div>
                )}
              </div>
              {currentTab === "liste-centre" && (
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
                            sessionsPhase1={sessionsPhase1
                              .filter(
                                (e) =>
                                  e?._source?.cohesionCenterId === hit._id &&
                                  (!filterCohorts.length || filterCohorts.includes(e?._source?.cohort)) &&
                                  (!filterSessionStatus.length || filterSessionStatus.includes(e?._source?.status)),
                              )
                              .map((e) => e)}
                            onClick={() => setCenter(hit)}
                            selected={center?._id === hit._id}
                          />
                        ))}
                        <hr />
                      </div>
                    )}
                  />
                </div>
              )}
              {currentTab === "session" && (
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
                      <Table>
                        <thead>
                          <tr>
                            <th style={{ width: "30%", color: "#7E858C", fontSize: 11 }}>Centre</th>
                            <th style={{ width: "20%", color: "#7E858C", fontSize: 11 }}>Cohortes</th>
                            <th style={{ width: "20%", color: "#7E858C", fontSize: 11 }}>Places</th>
                            <th style={{ width: "20%", color: "#7E858C", fontSize: 11 }}>Disponibilités</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionsPhase1.map((hit) => (
                            <HitSession
                              key={hit._id}
                              hit={hit}
                              center={data.find((center) => center._id === hit._source.cohesionCenterId)}
                              sessionsPhase1={sessionsPhase1
                                .filter(
                                  (e) =>
                                    e?._source?.cohesionCenterId === hit._id &&
                                    (!filterCohorts.length || filterCohorts.includes(e?._source?.cohort)) &&
                                    (!filterSessionStatus.length || filterSessionStatus.includes(e?._source?.status)),
                                )
                                .map((e) => e)}
                              onClick={() => setCenter(hit)}
                              selected={center?._id === hit._id}
                            />
                          ))}
                        </tbody>
                      </Table>
                    )}
                  />
                </div>
              )}
            </div>
          </ReactiveBase>
        </div>
      </div>
      <Panel center={center} onChange={() => setCenter(null)} />
    </div>
  );
}

const Badge = ({ cohort, onClick }) => {
  return (
    <div
      key={cohort}
      onClick={onClick}
      className={`rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-1 w-fit border-[1px] ${
        cohort.status === "VALIDATED" ? "border-[#0C7CFF] text-[#0C7CFF] bg-[#F9FCFF] " : "text-gray-500 bg-gray-100 border-gray-100"
      }`}>
      {cohort.cohort}
    </div>
  );
};

const Hit = ({ hit, sessionsPhase1, onClick }) => {
  const history = useHistory();
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
                <Badge onClick={() => history.push(`/centreV2/${sessionPhase1._source.cohesionCenterId}/cohort/${sessionPhase1._source.cohort}`)} cohort={sessionPhase1._source} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const HitSession = ({ hit, onClick, selected, center }) => {
  const history = useHistory();
  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={onClick}>
      <td>
        <MultiLine>
          <span className="font-bold text-black">
            {center?.name}
            {/* <span style={{ fontSize: ".7rem", color: "#9C9C9C" }}> #{hit?._id}</span> */}
          </span>

          <p>{`${center?.city || ""} • ${center?.department || ""}`}</p>
        </MultiLine>
      </td>
      <td>
        <Badge onClick={() => history.push(`/centreV2/${hit._source.cohesionCenterId}`)} cohort={hit._source} />
      </td>
      <td>
        <div>
          {hit._source.placesLeft === 0 ? (
            <div className="text-xs text-grey-500">0 place</div>
          ) : (
            <div className="text-xs text-400">{hit._source.placesLeft > 1 ? hit._source.placesLeft + " places" : hit._source.placesLeft + " place"}</div>
          )}
        </div>
        <div className="text-xs flex flex-row">
          <div className="text-grey-500">sur</div>
          <div>&nbsp;{hit._source.placesTotal}</div>
        </div>
      </td>
      <td>
        {hit._source.placesLeft === 0 ? (
          <div className="text-gray-700 font-bold bg-gray-200 rounded w-fit px-1">COMPLET</div>
        ) : (
          <div className="text-[#0063CB] font-bold bg-[#E8EDFF] rounded w-fit px-1">PLACES DISPONIBLES</div>
        )}
      </td>
    </tr>
  );
};
