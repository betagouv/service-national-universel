import React, { useState, useEffect } from "react";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { translate, corpsEnUniforme } from "../../utils";
import VioletHeaderButton from "../../components/buttons/VioletHeaderButton";

const FILTERS = ["SEARCH", "LEGAL_STATUS", "DEPARTMENT", "REGION", "CORPS", "WITH_NETWORK"];
const formatLongDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};

export default () => {
  const [structure, setStructure] = useState(null);
  const user = useSelector((state) => state.Auth.user);
  const DEFAULT_QUERY = () => (user.role === "supervisor" ? { query: { bool: { filter: { term: { "networkId.keyword": user.structureId } } } } } : { query: { match_all: {} } });
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
                  <VioletHeaderButton>
                    <p>Inviter une nouvelle structure</p>
                  </VioletHeaderButton>
                </Link>
                <VioletHeaderButton>
                  <ExportComponent
                    title="Exporter les structures"
                    collection="structure"
                    transform={(e) => {
                      return e;
                    }}
                  />
                </VioletHeaderButton>
              </div>
            </Header>
            <Filter>
              <DataSearch
                showIcon={false}
                placeholder="Rechercher par mots clés, mission ou structure..."
                componentId="SEARCH"
                dataField={["name"]}
                react={{ and: FILTERS }}
                // fuzziness={2}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
              />
              <FilterRow>
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
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
                  defaultQuery={DEFAULT_QUERY}
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
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  placeholder="Départements"
                  componentId="DEPARTMENT"
                  dataField="department.keyword"
                  title=""
                  react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT") }}
                  URLParams={true}
                  showSearch={false}
                  sortBy="asc"
                  defaultValue={user.role === "referent_department" && [user.department]}
                />
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  placeholder="Régions"
                  componentId="REGION"
                  dataField="region.keyword"
                  title=""
                  react={{ and: FILTERS.filter((e) => e !== "REGION") }}
                  URLParams={true}
                  showSearch={false}
                  sortBy="asc"
                  defaultValue={user.role === "referent_region" && [user.region]}
                />
                <MultiDropdownList
                  className="dropdown-filter"
                  placeholder="Affiliation à un réseau national"
                  componentId="WITH_NETWORK"
                  dataField="networkName.keyword"
                  title=""
                  react={{ and: FILTERS.filter((e) => e !== "WITH_NETWORK") }}
                  URLParams={true}
                  showSearch={false}
                  sortBy="asc"
                />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveList
                defaultQuery={DEFAULT_QUERY}
                componentId="result"
                react={{ and: FILTERS }}
                pagination={true}
                paginationAt="both"
                innerClass={{ pagination: "pagination" }}
                size={30}
                showLoader={true}
                dataField="createdAt"
                sortBy="desc"
                loader={<div style={{ padding: "0 20px" }}>Chargement...</div>}
                innerClass={{ pagination: "pagination" }}
                renderNoResults={() => <div style={{ padding: "10px 25px" }}>Aucun résultat.</div>}
                renderResultStats={(e) => {
                  return (
                    <>
                      <TopResultStats>
                        Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                      </TopResultStats>
                      <BottomResultStats>
                        Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                      </BottomResultStats>
                    </>
                  );
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
                        {data.map((hit, k) => (
                          <Hit hit={hit} key={k} onClick={() => setStructure(hit)} selected={structure?._id === hit._id} />
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

const Hit = ({ hit, onClick, selected }) => {
  const [missionsInfo, setMissionsInfo] = useState({ count: "-", placesTotal: "-" });
  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "mission", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": hit._id } }] } },
      });

      const { responses } = await api.esQuery(queries);
      setMissionsInfo({
        count: responses[0].hits.hits.length,
        placesTotal: responses[0].hits.hits.reduce((acc, e) => acc + e._source.placesTotal, 0),
      });
    })();
  }, [hit]);
  return (
    <tr style={{ backgroundColor: selected ? "#f1f1f1" : "transparent" }} onClick={onClick}>
      <td>
        <div style={{ fontWeight: "bold" }}>{hit.name}</div>
        <div style={{ color: "#718096" }}>
          {translate(hit.legalStatus)} • Créée le {formatLongDate(hit.createdAt)}
        </div>
      </td>
      <td>
        <div style={{ fontWeight: "bold" }}>{missionsInfo.count} missions</div>
        <div>{missionsInfo.placesTotal} places</div>
      </td>
      <td>
        {hit.status === "DRAFT" ? <TagStatus>{translate(hit.status)}</TagStatus> : null}
        {hit.isNetwork === "true" ? <TagNetwork>Tête de réseau</TagNetwork> : null}
        {hit.networkName ? (
          <Link to={`structure/${hit.networkId}`}>
            <TagParent>{hit.networkName}</TagParent>
          </Link>
        ) : null}
        {hit.department ? <TagDepartment>{translate(hit.department)}</TagDepartment> : null}
        {corpsEnUniforme.includes(hit.structurePubliqueEtatType) ? <TagDepartment>Corps en uniforme</TagDepartment> : null}
      </td>
    </tr>
  );
};

const Header = styled.div`
  padding: 0 40px 0;
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  justify-content: space-between;
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 30px;
`;

const Filter = styled.div`
  padding: 0 25px;
  margin-bottom: 20px;

  .searchbox {
    display: block;
    width: 100%;
    background-color: #fff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    color: #767676;
    border: 0;
    outline: 0;
    padding: 15px 20px;
    height: auto;
    border-radius: 6px;
    margin-right: 15px;
    ::placeholder {
      color: #767676;
    }
  }
`;

const FilterRow = styled.div`
  padding: 15px 0 0;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  .dropdown-filter {
    margin-right: 15px;
    margin-bottom: 15px;
  }
  button {
    background-color: #fff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    border: 0;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 14px;
    color: #242526;
    min-width: 150px;
    margin-right: 15px;
    cursor: pointer;
    div {
      width: 100%;
      overflow: visible;
    }
  }
`;

const ResultTable = styled.div`
  background-color: #fff;
  position: relative;
  margin: 20px 0;
  padding-bottom: 10px;
  .pagination {
    display: flex;
    justify-content: flex-end;
    padding: 10px 25px;
    background: #fff;
    a {
      background: #f7fafc;
      color: #242526;
      padding: 3px 10px;
      font-size: 12px;
      margin: 0 5px;
    }
    a.active {
      font-weight: 700;
      /* background: #5245cc;
      color: #fff; */
    }
    a:first-child {
      background-image: url(${require("../../assets/left.svg")});
    }
    a:last-child {
      background-image: url(${require("../../assets/right.svg")});
    }
    a:first-child,
    a:last-child {
      font-size: 0;
      height: 24px;
      width: 30px;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 8px;
    }
  }
`;

const ResultStats = styled.div`
  color: #242526;
  font-size: 12px;
  padding-left: 25px;
`;

const TopResultStats = styled(ResultStats)`
  position: absolute;
  top: 25px;
  left: 0;
`;
const BottomResultStats = styled(ResultStats)`
  position: absolute;
  top: calc(100% - 50px);
  left: 0;
`;

const Table = styled.table`
  width: 100%;
  color: #242526;
  margin-top: 10px;
  th {
    border-top: 1px solid #f4f5f7;
    border-bottom: 1px solid #f4f5f7;
    padding: 15px;
    font-weight: 400;
    font-size: 14px;
    text-transform: uppercase;
  }
  td {
    padding: 15px;
    font-size: 14px;
    font-weight: 300;
    strong {
      font-weight: 700;
      margin-bottom: 5px;
      display: block;
    }
  }
  td:first-child,
  th:first-child {
    padding-left: 25px;
  }
  tbody tr {
    border-bottom: 1px solid #f4f5f7;
    :hover {
      background-color: #e6ebfa;
    }
  }
`;

const Tag = styled.span`
  align-self: flex-start;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 13px;
  white-space: nowrap;
  font-weight: 400;
  cursor: pointer;
  margin-right: 5px;
`;

const TagDepartment = styled(Tag)`
  background: #f7f7f7;
  color: #9a9a9a;
  border: 0.5px solid #cecece;
`;

const TagParent = styled(Tag)`
  color: #5245cc;
  background: rgba(82, 69, 204, 0.1);
  border: 0.5px solid #5245cc;
`;

const TagNetwork = styled(Tag)`
  color: #00f;
  background: rgba(82, 69, 204, 0.1);
  border: 0.5px solid #00f;
`;

const TagStatus = styled(Tag)`
  color: #d9bb71;
  background: #d9bb7133;
  border: 0.5px solid #d9bb71;
`;
