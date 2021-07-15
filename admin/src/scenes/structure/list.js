import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { translate, corpsEnUniforme, formatLongDateFR, ES_NO_LIMIT } from "../../utils";
import VioletButton from "../../components/buttons/VioletButton";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, Header, Title, MultiLine } from "../../components/list";
import Badge from "../../components/Badge";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import Chevron from "../../components/Chevron";

const FILTERS = ["SEARCH", "LEGAL_STATUS", "DEPARTMENT", "REGION", "CORPS", "WITH_NETWORK", "LOCATION"];
const formatLongDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};

export default () => {
  const [structure, setStructure] = useState(null);
  // List of structure IDS currently displayed in results
  const [structureIds, setStructureIds] = useState([]);
  // List of missions associated to the structures
  const [missions, setMissions] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);

  useEffect(() => {
    (async () => {
      if (structureIds?.length) {
        const queries = [
          { index: "mission", type: "_doc" },
          { size: ES_NO_LIMIT, query: { bool: { must: { match_all: {} }, filter: [{ terms: { "structureId.keyword": structureIds } }] } } },
        ];
        const { responses } = await api.esQuery(queries);
        setMissions(responses[0]?.hits?.hits || []);
      }
    })();
  }, [structureIds]);

  const user = useSelector((state) => state.Auth.user);
  const getDefaultQuery = () => (user.role === "supervisor" ? { query: { bool: { filter: { term: { "networkId.keyword": user.structureId } } } } } : { query: { match_all: {} } });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });
  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="structure" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Structures</Title>
              </div>
              <div style={{ display: "flex" }}>
                <Link to="/structure/create">
                  <VioletButton>
                    <p>Inviter une nouvelle structure</p>
                  </VioletButton>
                </Link>
                <ExportComponent
                  title="Exporter les structures"
                  defaultQuery={getExportQuery}
                  collection="structure"
                  react={{ and: FILTERS }}
                  transform={(data) => {
                    return {
                      _id: data._id,
                      "Nom de la structure": data.name,
                      "Numéro de SIRET": data.siret,
                      Description: data.description,
                      "Site internet": data.website,
                      Facebook: data.facebook,
                      Twitter: data.twitter,
                      Instagram: data.instagram,
                      Statut: data.status,
                      "Est une tête de réseau": data.isNetwork,
                      "Nom de la tête de réseau": data.networkName,
                      "Statut juridique": data.legalStatus,
                      "Type d'association": data.associationTypes,
                      "Type de structure publique": data.structurePubliqueType,
                      "Type de service de l'état": data.structurePubliqueEtatType,
                      "Type de structure privée": data.structurePriveeType,
                      "Adresse de la structure": data.address,
                      "Code postal de la structure": data.zip,
                      "Ville de la structure": data.city,
                      "Département de la structure": data.department,
                      "Région de la structure": data.region,
                      "Pays de la structure": data.country,
                      "Créé lé": formatLongDateFR(data.createdAt),
                      "Mis à jour le": formatLongDateFR(data.updatedAt),
                    };
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
                  dataField={["name", "city", "zip"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                  queryFormat="and"
                />
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === "referent_region" ? [user.region] : []} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === "referent_department" ? [user.department] : []} />
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Statut juridique"
                  componentId="LEGAL_STATUS"
                  dataField="legalStatus.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "LEGAL_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Corps en uniforme"
                  componentId="CORPS"
                  dataField="structurePubliqueEtatType.keyword"
                  transformData={(data) => {
                    return data.filter((d) => corpsEnUniforme.includes(d.key));
                  }}
                  react={{ and: FILTERS.filter((e) => e !== "CORPS") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                />

                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Affiliation à un réseau national"
                  componentId="WITH_NETWORK"
                  dataField="networkName.keyword"
                  title=""
                  react={{ and: FILTERS.filter((e) => e !== "WITH_NETWORK") }}
                  URLParams={true}
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  sortBy="asc"
                />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                onData={({ rawData }) => {
                  if (rawData?.hits?.hits) setStructureIds(rawData.hits.hits.map((e) => e._id));
                }}
                render={({ data }) => {
                  return (
                    <Table>
                      <thead>
                        <tr>
                          <th width="50%">Structures</th>
                          <th width="20%">Missions</th>
                          <th>Contexte</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((hit) => (
                          <Hit
                            hit={hit}
                            key={hit._id}
                            missions={missions.filter((e) => e._source.structureId === hit._id)}
                            onClick={() => setStructure(hit)}
                            selected={structure?._id === hit._id}
                          />
                        ))}
                      </tbody>
                    </Table>
                  );
                }}
              />
            </ResultTable>
          </div>
          <Panel value={structure} onChange={() => setStructure(null)} />
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ hit, onClick, selected, missions }) => {
  const missionsInfo = {
    count: missions.length || "0",
    placesTotal: missions.reduce((acc, e) => acc + e._source.placesTotal, 0),
  };
  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={onClick}>
      <td>
        <MultiLine>
          <h2>{hit.name}</h2>
          <p>
            {translate(hit.legalStatus)} • Créée le {formatLongDate(hit.createdAt)}
          </p>
        </MultiLine>
      </td>
      <td>
        <div style={{ fontWeight: "bold" }}>{missionsInfo.count} missions</div>
        <div>{missionsInfo.placesTotal} places</div>
      </td>
      <td>
        {hit.status === "DRAFT" ? <Badge text={translate(hit.status)} color="#d9bb71" /> : null}
        {hit.isNetwork === "true" ? <Badge text="Tête de réseau" color="#00f" /> : null}
        {hit.networkName ? (
          <Link to={`structure/${hit.networkId}`}>
            <Badge text={hit.networkName} color="#5245cc" />
          </Link>
        ) : null}
        {hit.department ? <Badge text={translate(hit.department)} /> : null}
        {corpsEnUniforme.includes(hit.structurePubliqueEtatType) ? <Badge text="Corps en uniforme" /> : null}
      </td>
    </tr>
  );
};
