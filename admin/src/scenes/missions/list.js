import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { formatStringDate, translate, getFilterLabel } from "../../utils";
import SelectStatusMission from "../../components/selectStatusMission";
import VioletHeaderButton from "../../components/buttons/VioletHeaderButton";
import Loader from "../../components/Loader";
import { RegionFilter } from "../../components/filters";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS", "PLACES", "LOCATION", "TUTOR", "REGION", "DEPARTMENT", "STRUCTURE"];

export default () => {
  const [mission, setMission] = useState(null);
  const [structureIds, setStructureIds] = useState();
  const user = useSelector((state) => state.Auth.user);
  const DEFAULT_QUERY = () => {
    if (user.role === "supervisor") return { query: { bool: { filter: { terms: { "structureId.keyword": structureIds } } } } };
    return { query: { match_all: {} } };
  };

  useEffect(() => {
    if (user.role !== "supervisor") return;
    (async () => {
      const { data } = await api.get(`/structure/network/${user.structureId}`);
      const ids = data.map((s) => s._id);
      console.log(ids);
      setStructureIds(ids);
    })();
    return;
  }, []);
  if (user.role === "supervisor" && !structureIds) return <Loader />;

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Header>
              <div style={{ flex: 1 }}>
                <Title>Missions</Title>
              </div>
              {user.role === "responsible" && user.structureId && (
                <Link to={`/mission/create/${user.structureId}`}>
                  <VioletHeaderButton>
                    <p>Nouvelle mission</p>
                  </VioletHeaderButton>
                </Link>
              )}
              <ExportComponent
                title="Exporter les missions"
                collection="mission"
                transform={(e) => {
                  return e;
                }}
              />
            </Header>
            <Filter>
              <DataSearch
                showIcon={false}
                placeholder="Rechercher par mots clés, mission ou structure..."
                componentId="SEARCH"
                dataField={["name"]}
                react={{ and: FILTERS }}
                // fuzziness={1}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
              />
              <FilterRow>
                <DataSearch
                  defaultQuery={DEFAULT_QUERY}
                  showIcon={false}
                  placeholder="Ville ou code postal"
                  componentId="LOCATION"
                  dataField={["city", "zip"]}
                  react={{ and: FILTERS.filter((e) => e !== "LOCATION") }}
                  fuzziness={1}
                  style={{ flex: 2 }}
                  innerClass={{ input: "searchbox" }}
                  className="searchbox-city"
                  autosuggest={false}
                />
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  componentId="STATUS"
                  dataField="status.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut")}
                />
                <RegionFilter defaultQuery={DEFAULT_QUERY} filters={FILTERS} defaultValue={user.role === "referent_region" && [user.region]} />
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  placeholder="Départements"
                  componentId="DEPARTMENT"
                  dataField="department.keyword"
                  title=""
                  react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT") }}
                  URLParams={true}
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  sortBy="asc"
                  defaultValue={user.role === "referent_department" && [user.department]}
                />
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  placeholder="Domaine"
                  componentId="DOMAIN"
                  dataField="domains.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DOMAIN") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Domaine")}
                />
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  placeholder="Places restantes"
                  componentId="PLACES"
                  dataField="placesLeft"
                  react={{ and: FILTERS.filter((e) => e !== "PLACES") }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                />
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  placeholder="Tuteur"
                  componentId="TUTOR"
                  dataField="tutorName.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "TUTOR") }}
                  title=""
                  URLParams={true}
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                />
                {user.role === "supervisor" ? (
                  <MultiDropdownList
                    defaultQuery={DEFAULT_QUERY}
                    className="dropdown-filter"
                    placeholder="Structure"
                    componentId="STRUCTURE"
                    dataField="structureName.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "STRUCTURE") }}
                    title=""
                    URLParams={true}
                    showSearch={false}
                    sortBy="asc"
                  />
                ) : null}
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
                renderNoResults={() => <div style={{ padding: "10px 25px" }}>Aucun Résultat.</div>}
                renderResultStats={(e) => {
                  return (
                    <div>
                      <TopResultStats>
                        Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                      </TopResultStats>
                      <BottomResultStats>
                        Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                      </BottomResultStats>
                    </div>
                  );
                }}
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th>Mission</th>
                        <th style={{ width: "200px" }}>Dates</th>
                        <th style={{ width: "90px" }}>Places</th>
                        <th style={{ width: "250px" }}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit, i) => (
                        <Hit key={i} hit={hit} onClick={() => setMission(hit)} selected={mission?._id === hit._id} />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          <Panel mission={mission} onChange={() => setMission(null)} />
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ hit, onClick, selected }) => {
  // console.log("h", hit);
  return (
    <tr style={{ backgroundColor: selected ? "#f1f1f1" : "transparent" }} onClick={onClick}>
      <td>
        <TeamMember>
          <div>
            <h2>{hit.name}</h2>
            <p>
              {hit.structureName} {`• ${hit.city} (${hit.department})`}
            </p>
          </div>
        </TeamMember>
      </td>
      <td>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDate(hit.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDate(hit.endAt)}
        </div>
      </td>
      <td>
        {hit.placesTotal <= 1 ? `${hit.placesTotal} place` : `${hit.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {hit.placesTotal - hit.placesLeft} / {hit.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusMission hit={hit} />
      </td>
    </tr>
  );
};

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-top: 25px;
  align-items: flex-start;
  /* justify-content: space-between; */
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
  .searchbox-city {
    min-width: 165px;
    max-width: 165px;
    margin-right: 15px;
    margin-bottom: 15px;
    input {
      padding: 10.5px 12px;
    }
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

const TeamMember = styled.div`
  h2 {
    color: #333;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 5px;
  }
  p {
    color: #606266;
    font-size: 12px;
    margin: 0;
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
