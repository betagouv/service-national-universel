import React, { useState } from "react";
import { Col, DropdownItem, DropdownMenu, DropdownToggle, Label, Pagination, PaginationItem, PaginationLink, Row, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, ReactiveList, SingleList, MultiDropdownList, MultiList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";

import { Link } from "react-router-dom";

const FILTERS = ["SEARCH", "STATUT", "FORMAT"];

export default () => {
  const [tuteur, setTuteur] = useState(null);

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="referent" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                {/* <Subtitle>RESPONSABLE</Subtitle> */}
                <Title>Tuteurs</Title>
              </div>
              {/* <Export>
                <ExportComponent
                  title="Exporter les tuteurs"
                  collection="user"
                  transform={(e) => {
                    return e;
                  }}
                />
              </Export> */}
            </Header>
            <Filter>
              <DataSearch
                showIcon={false}
                placeholder="Rechercher par mots clés, mission ou structure..."
                componentId="SEARCH"
                dataField={["email.keyword", "firstName", "lastName"]}
                react={{ and: FILTERS }}
                // fuzziness={2}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
              />
              <FilterRow>
                {/* <MultiDropdownList
                  className="dropdown-filter"
                    placeholder="STATUT"
                    componentId="STATUS"
                    dataField="status.keyword"
                    renderItem={(e) => translate(e)}
                    title=""
                    URLParams={true}
                    showSearch={false}
                  />
                  <MultiDropdownList
                  className="dropdown-filter"
                    placeholder="FORMAT"
                    componentId="FORMAT"
                    dataField="missionFormat.keyword"
                    renderItem={(e) => translate(e)}
                    title=""
                    URLParams={true}
                    showSearch={false}
                  />*/}
              </FilterRow>
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
                // dataField="createdAt"
                // sortBy="desc"
                loader={<div style={{ padding: "0 20px" }}>Chargement...</div>}
                dataField="created_at"
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
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th width="30%">Email</th>
                        <th>Roles</th>
                        <th>Cree le</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => (
                        <Hit hit={hit} onClick={() => setTuteur(hit)} />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          <Panel value={tuteur} onChange={() => setTuteur(null)} />
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ hit, onClick }) => {
  return (
    <tr onClick={onClick}>
      <td>
        <div style={{ color: "#1e242f", fontSize: 15, textTransform: "capitalize" }}>{`${hit.firstName} ${hit.lastName}`}</div>
        {hit.email}
      </td>
      <td>
        <Tag>{hit.role}</Tag>
      </td>
      <td>{hit.createdAt}</td>
      <td onClick={(e) => e.stopPropagation()}>
        <Action hit={hit} />
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
            View
          </DropdownItem>
          <DropdownItem tag="div">Duplicator</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  align-items: flex-start;
  margin-top: 25px;
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
  background-color: rgb(244, 244, 245);
  border: 1px solid rgb(233, 233, 235);
  color: rgb(144, 147, 153);
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 13px;
  white-space: nowrap;
  font-weight: 400;
  cursor: pointer;
  margin-right: 5px;
  text-transform: capitalize;
`;

const Export = styled.div`
  button {
    background-color: #5245cc;
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
