import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Col, DropdownItem, DropdownMenu, DropdownToggle, Label, Pagination, PaginationItem, PaginationLink, Row, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, ReactiveList, SingleList, MultiDropdownList, MultiList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";

import { formatStringDate, translate, getFilterLabel } from "../../utils";
import CustomFilter from "./customFilter";
import SelectStatusMission from "../../components/selectStatusMission";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS", "PLACES", "LOCATION", "REGION", "DEPARTMENT"];

export default () => {
  const [mission, setMission] = useState(null);

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Header>
              <div style={{ flex: 1 }}>
                <Title>Missions</Title>
              </div>
              <ButtonContainer>
                <Link to="/mission/create">
                  <button>Nouvelle mission</button>
                </Link>
                <ExportComponent
                  title="Exporter les missions"
                  collection="mission"
                  transform={(e) => {
                    return e;
                  }}
                />
              </ButtonContainer>
            </Header>
            <Filter>
              <Row>
                <Col md={12}>
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
                </Col>
              </Row>
              <Row style={{ marginTop: "20px" }}>
                <Col md={2}>
                  <DataSearch
                    showIcon={false}
                    placeholder="Ville ou code postal"
                    componentId="LOCATION"
                    dataField={["city", "zip"]}
                    react={{ and: FILTERS.filter((e) => e !== "LOCATION") }}
                    fuzziness={1}
                    style={{ flex: 2 }}
                    innerClass={{ input: "searchbox searchbox-city" }}
                    autosuggest={false}
                  />
                </Col>
                <Col md={2}>
                  <MultiDropdownList
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
                </Col>
                <Col md={2}>
                  <MultiDropdownList
                    className="dropdown-filter"
                    placeholder="Régions"
                    componentId="REGION"
                    dataField="region.keyword"
                    title=""
                    react={{ and: FILTERS.filter((e) => e !== "REGION") }}
                    URLParams={true}
                    showSearch={false}
                    sortBy="asc"
                  />
                </Col>
                <Col md={2}>
                  <MultiDropdownList
                    className="dropdown-filter"
                    placeholder="Départements"
                    componentId="DEPARTMENT"
                    dataField="department.keyword"
                    title=""
                    react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT") }}
                    URLParams={true}
                    showSearch={false}
                    sortBy="asc"
                  />
                </Col>
                <Col md={2}>
                  <MultiDropdownList
                    className="dropdown-filter"
                    placeholder="Domaine"
                    componentId="DOMAIN"
                    dataField="domains.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "DOMAIN") }}
                    title=""
                    URLParams={true}
                    showSearch={false}
                  />
                </Col>
                <Col md={2}>
                  <div className="dropdown-filter">
                    <MultiDropdownList
                      className="dropdown-filter"
                      placeholder="Places restantes"
                      componentId="PLACES"
                      dataField="placesLeft"
                      react={{ and: FILTERS.filter((e) => e !== "PLACES") }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                    />
                  </div>
                </Col>
              </Row>
            </Filter>
            <ResultTable>
              <ReactiveList
                componentId="result"
                react={{ and: FILTERS }}
                pagination={true}
                paginationAt="both"
                innerClass={{ pagination: "pagination" }}
                size={10}
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
                        <th width="40%">Mission</th>
                        <th>Dates</th>
                        <th>Places</th>
                        <th width="20%">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit, i) => (
                        <Hit key={i} hit={hit} onClick={() => setMission(hit)} />
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

const Hit = ({ hit, onClick }) => {
  // console.log("h", hit);
  return (
    <tr onClick={onClick}>
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
          {hit.placesTaken} / {hit.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusMission hit={hit} />
      </td>
    </tr>
  );
};

const Action = ({ hit, color }) => {
  return (
    <ActionBox color={color}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          En attente de validation
          <div className="down-icon">
            <svg viewBox="0 0 407.437 407.437">
              <polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 " />
            </svg>
          </div>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem tag={Link} to={"#"}>
            Voir
          </DropdownItem>
          <DropdownItem tag="div">Dupliquer</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
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

const Button = styled.div`
  background-color: #3182ce;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  :hover {
    background-color: #5a9bd8;
  }
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

  .searchbox-city {
    padding: 11px 12px;
    margin-right: 10px;
  }

  .dropdown-filter {
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
    text-transform: uppercase;
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

const Tag = styled.span`
  background-color: rgb(253, 246, 236);
  border: 1px solid rgb(250, 236, 216);
  color: rgb(230, 162, 60);
  align-self: flex-start;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 13px;
  white-space: nowrap;
  font-weight: 400;
  cursor: pointer;
  margin-right: 5px;
`;

const ButtonContainer = styled.div`
  button {
    background-color: #5245cc;
    margin-left: 1rem;
    border: none;
    border-radius: 5px;
    padding: 7px 30px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    :hover {
      background: #372f78;
    }
  }
`;

const ActionBox = styled.div`
  .dropdown-menu {
    min-width: 0;
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      padding: 5px 15px;
    }
  }
  button {
    background-color: #feb951;
    border: 1px solid #feb951;
    display: inline-flex;
    align-items: center;
    text-align: left;
    border-radius: 4px;
    padding: 0 0 0 12px;
    font-size: 12px;
    min-width: 130px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    outline: 0;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: #fff;
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      border-left: 2px solid #fbd392;
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: #fff;
      }
    }
  }
  ${({ color }) =>
    color === "green" &&
    `
    button {
      background-color: transparent;
      border: 1px solid #6BC763;
      color: #6BC763;
      .edit-icon {
        path {
          fill: #6BC763;
        }
      }
      .down-icon {
        border-left: 1px solid #6BC763;
        svg polygon {
          fill: #6BC763;
        }
      }
    }  
  `}
  ${({ color }) =>
    color === "red" &&
    `
    button {
      background-color: transparent;
      border: 1px solid #F1545B;
      color: #F1545B;
      .edit-icon {
        path {
          fill: #F1545B;
        }
      }
      .down-icon {
        border-left: 1px solid #F1545B;
        svg polygon {
          fill: #F1545B;
        }
      }
    }  
  `}
`;
