import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { translate, getFilterLabel, formatLongDateFR, ES_NO_LIMIT, ROLES } from "../../utils";
import VioletButton from "../../components/buttons/VioletButton";
import Chevron from "../../components/Chevron";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, Header, Title, MultiLine, SubTd } from "../../components/list";
import Badge from "../../components/Badge";
import ReactiveListComponent from "../../components/ReactiveListComponent";

const FILTERS = ["SEARCH", "PLACES", "COHORT", "DEPARTMENT", "REGION"];

export default function List() {
  const [center, setCenter] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  // List of sessionPhase1 IDS currently displayed in results
  const [cohesionCenterIds, setCohesionCenterIds] = useState([]);
  // List of cohesionCenter associated to the sessionPhase1
  const [sessionsPhase1, setSessionsPhase1] = useState([]);

  // list of cohorts selected, used for filtering the sessionPhase1 displayed inline
  const [filterCohorts, setFilterConhorts] = useState([]);

  const user = useSelector((state) => state.Auth.user);
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => {
    return { query: { match_all: {} } };
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
      <ReactiveBase url={`${apiURL}/es`} app="cohesioncenter" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Header>
              <div style={{ flex: 1 }}>
                <Title>Centres</Title>
              </div>
              <ExportComponent
                title="Exporter les centres"
                defaultQuery={getExportQuery}
                exportTitle="Centres_de_cohesion"
                index="cohesioncenter"
                react={{ and: FILTERS }}
                transform={(all) => {
                  return all.map((data) => {
                    return {
                      Nom: data.name,
                      Code: data.code,
                      Pays: data.country,
                      COR: data.COR,
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
                    };
                  });
                }}
              />
              {user.role === ROLES.ADMIN ? (
                <Link to={`/centre/nouveau`}>
                  <VioletButton>
                    <p>Créer un nouveau centre</p>
                  </VioletButton>
                </Link>
              ) : null}
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  defaultQuery={getDefaultQuery}
                  showIcon={false}
                  placeholder="Rechercher par mots clés, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["name", "city", "zip", "code"]}
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
                            .filter((e) => e?._source?.cohesionCenterId === hit._id && (!filterCohorts.length || filterCohorts.includes(e?._source?.cohort)))
                            .map((e) => e._source)}
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
          <h2>
            {hit?.name}
            {/* <span style={{ fontSize: ".7rem", color: "#9C9C9C" }}> #{hit?._id}</span> */}
          </h2>

          <p>{`${hit?.city || ""} • ${hit?.department || ""}`}</p>
        </MultiLine>
      </td>
      <td>
        {sessionsPhase1.map((sessionPhase1) => (
          <SubTd key={sessionPhase1._id}>
            <Badge text={sessionPhase1.cohort} />
          </SubTd>
        ))}
      </td>
      <td>
        {sessionsPhase1.map((sessionPhase1) => (
          <SubTd key={sessionPhase1._id}>
            <MultiLine>
              <h2>{sessionPhase1.placesLeft} places disponibles</h2>
              <p>sur {sessionPhase1.placesTotal} places proposées</p>
            </MultiLine>
          </SubTd>
        ))}
      </td>
      <td>
        {sessionsPhase1.map((sessionPhase1) => (
          <SubTd key={sessionPhase1._id}>{sessionPhase1.placesLeft > 0 ? <Badge text="Places disponibles" color="#6CC763" /> : <Badge text="Complet" />}</SubTd>
        ))}
      </td>
    </tr>
  );
};
