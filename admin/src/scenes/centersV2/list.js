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
import { SearchStyle, ResultTable, Table, Header, Title, MultiLine, SubTd } from "../../components/list";
import { FilterButton, TabItem } from "./components/commons";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import plausibleEvent from "../../services/plausible";
import Breadcrumbs from "../../components/Breadcrumbs";
import Menu from "../../assets/icons/Menu";
import Calendar from "../../assets/icons/Calendar";

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
      <ReactiveBase url={`${apiURL}/es`} app="cohesioncenter" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Header>
              <div style={{ flex: 1 }}>
                <Title>Centres</Title>
              </div>
              <div className="flex gap-2">
                {canCreateOrUpdateCohesionCenter(user) ? (
                  <Link to={`/centre/nouveau`} onClick={() => plausibleEvent("Centres/CTA - Créer centre")}>
                    <div className="bg-blue-600 text-white font-500 text-sm w-60 h-9 text-center rounded leading-9">Rattacher un centre à un séjour</div>
                  </Link>
                ) : null}
              </div>
            </Header>
            <div className=" flex flex-1 mx-[10px] z-0 mt-2">
              <nav className="flex flex-1 gap-1">
                <TabItem icon={<Menu />} title="Liste des centres" onClick={() => setCurrentTab("liste-centre")} active={currentTab === "liste-centre"} />
                <TabItem icon={<Calendar />} title="Sessions" onClick={() => setCurrentTab("session")} active={currentTab === "session"} />
              </nav>
            </div>
            <div className={`bg-white rounded-b-lg rounded-tr-lg mx-[10px] z-10`}>
              <div className="flex flex-column bg-white mx-8 flex-wrap">
                <div className="flex flex-row pt-4 justify-between items-center">
                  <div className="flex flex-row w-96">
                    <DataSearch
                      defaultQuery={getDefaultQuery}
                      showIcon={false}
                      placeholder="Rechercher par mots clés, ville, code postal..."
                      componentId="SEARCH"
                      dataField={["name", "city", "zip", "code", "code2022"]}
                      react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                      style={{ marginRight: "1rem", flex: 1 }}
                      innerClass={{ input: "searchbox" }}
                      className="datasearch-searchfield "
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
                  <div className="mt-3 gap-2 flew-wrap border-8">
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
                      renderItem={(e) => {
                        return `${translate(e)}`;
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
                <div>
                  <ResultTable className="mt-0 mx-0 rounded-b-lg">
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
                              <th style={{ width: "40%", color: "#7E858C", fontSize: 11 }}>Centre</th>
                              <th style={{ width: "60%", color: "#7E858C", fontSize: 11 }}>Cohortes à venir</th>
                            </tr>
                          </thead>
                          <tbody>
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
                          </tbody>
                        </Table>
                      )}
                    />
                  </ResultTable>
                </div>
              )}
              {currentTab === "session" && (
                <div>
                  <div>
                    <ResultTable className="mt-0 mx-0 rounded-b-lg">
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
                    </ResultTable>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Panel center={center} onChange={() => setCenter(null)} />
        </div>
      </ReactiveBase>
    </div>
  );
}

const Badge = ({ cohort, status, onClick }) => {
  return (
    <div
      key={cohort}
      onClick={onClick}
      className={`hover:bg-red-500 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-1 w-fit ${
        status === "VALIDATED" ? "border-[1px] border-[#0C7CFF] text-[#0C7CFF] bg-[#F9FCFF] " : "text-gray-500 bg-gray-100"
      }`}>
      {cohort}
    </div>
  );
};

const Hit = ({ hit, onClick, selected, sessionsPhase1 }) => {
  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={onClick}>
      <td>
        <MultiLine>
          <span className="font-bold text-black">
            {hit?.name}
            {/* <span style={{ fontSize: ".7rem", color: "#9C9C9C" }}> #{hit?._id}</span> */}
          </span>

          <p>{`${hit?.city || ""} • ${hit?.department || ""}`}</p>
        </MultiLine>
      </td>
      <td className="flex flex-row items-center">
        {sessionsPhase1.map((sessionPhase1) => (
          <SubTd key={sessionPhase1._id}>
            <div className="flex items-center">
              <Badge onClick={() => console.log(sessionPhase1._source.cohort)} cohort={sessionPhase1._source.cohort} status={sessionPhase1._source.status} />
            </div>
          </SubTd>
        ))}
      </td>
    </tr>
  );
};

const HitSession = ({ hit, onClick, selected, center }) => {
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
        <Badge onClick={() => console.log(hit._source.cohort)} cohort={hit._source.cohort} status={hit._source.status} />
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
