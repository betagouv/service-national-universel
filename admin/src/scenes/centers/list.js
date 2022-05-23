import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { translate, getFilterLabel, formatLongDateFR, ES_NO_LIMIT, ROLES, canCreateOrUpdateCohesionCenter, translateSessionStatus, COHORTS } from "../../utils";

import VioletButton from "../../components/buttons/VioletButton";
import Chevron from "../../components/Chevron";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, Header, Title, MultiLine, SubTd } from "../../components/list";
import Badge from "../../components/Badge";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import plausibleEvent from "../../services/pausible";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import Breadcrumbs from "../../components/Breadcrumbs";

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
  const handleShowFilter = () => setFilterVisible(!filterVisible);
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
                    <VioletButton>
                      <p>Créer un nouveau centre</p>
                    </VioletButton>
                  </Link>
                ) : null}
                <ExportComponent
                  handleClick={() => plausibleEvent("Centres/CTA - Exporter centres")}
                  title="Exporter les centres"
                  defaultQuery={getExportQuery}
                  exportTitle="Centres_de_cohesion"
                  index="cohesioncenter"
                  react={{ and: FILTERS }}
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
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  defaultQuery={getDefaultQuery}
                  showIcon={false}
                  placeholder="Rechercher par mots clés, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["name", "city", "zip", "code", "code2022"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  // fuzziness={1}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  URLParams={true}
                  autosuggest={false}
                />
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
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [user.department] : []} />
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
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
                    return `${translate(e)}`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut", "Statut")}
                  onValueChange={setfilterSessionStatus}
                />
                <DeleteFilters />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                onData={({ rawData }) => {
                  if (rawData?.hits?.hits) setCohesionCenterIds(rawData.hits.hits.map((e) => e._id));
                }}
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th style={{ width: "40%" }}>Centre</th>
                        <th style={{ width: "20%" }}>Cohorte(s)</th>
                        <th style={{ width: "20%" }}>Places</th>
                        <th style={{ width: "20%" }}>Disponibilité</th>
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
          <Panel center={center} onChange={() => setCenter(null)} />
        </div>
      </ReactiveBase>
    </div>
  );
}

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
      <td>
        {sessionsPhase1.map((sessionPhase1) => (
          <SubTd key={sessionPhase1._id}>
            <div className="flex items-center">
              <Badge text={sessionPhase1._source.cohort} />
              {sessionPhase1._source.status ? (
                <div
                  className={`border text-xs rounded-full p-1 ${
                    sessionPhase1._source.status === "DRAFT" ? "border-[#CECECE] bg-[#F6F6F6] text-[#9A9A9A] " : "border-[#A4D8BC]  bg-[#F5FCF3] text-[#27AF66]"
                  }`}>
                  {translateSessionStatus(sessionPhase1._source.status)}
                </div>
              ) : null}
            </div>
          </SubTd>
        ))}
      </td>
      <td>
        {sessionsPhase1.map((sessionPhase1) => (
          <SubTd key={sessionPhase1._id}>
            <MultiLine>
              <span className="font-bold text-black">{sessionPhase1._source.placesLeft} places disponibles</span>
              <p>sur {sessionPhase1._source.placesTotal} places proposées</p>
            </MultiLine>
          </SubTd>
        ))}
      </td>
      <td>
        {sessionsPhase1.map((sessionPhase1) => (
          <SubTd key={sessionPhase1._id}>{sessionPhase1._source.placesLeft > 0 ? <Badge text="Places disponibles" color="#6CC763" /> : <Badge text="Complet" />}</SubTd>
        ))}
      </td>
    </tr>
  );
};
