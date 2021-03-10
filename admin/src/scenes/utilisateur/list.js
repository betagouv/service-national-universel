import React, { useState, useEffect } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { setUser } from "../../redux/auth/actions";
import { translate, getFilterLabel, formatStringLongDate } from "../../utils";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";

const FILTERS = ["SEARCH", "ROLE", "REGION", "DEPARTMENT"];

export default () => {
  const [responsable, setResponsable] = useState(null);
  const user = useSelector((state) => state.Auth.user);
  const [structureIds, setStructureIds] = useState();
  const DEFAULT_QUERY = () => (user.role === "supervisor" ? { query: { bool: { filter: { terms: { "structureId.keyword": structureIds } } } } } : { query: { match_all: {} } });

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
  if (user.role === "supervisor" && !structureIds) return <div>Chargement</div>;

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="referent" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                {/* <Subtitle>RESPONSABLE</Subtitle> */}
                <Title>Utilisateur</Title>
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
                placeholder="Rechercher par prénom, nom, email..."
                componentId="SEARCH"
                dataField={["email.keyword", "firstName", "lastName"]}
                react={{ and: FILTERS }}
                // fuzziness={2}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
                queryFormat="and"
              />
              <FilterRow>
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  componentId="ROLE"
                  dataField="role.keyword"
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  react={{ and: FILTERS.filter((e) => e !== "ROLE") }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Rôle")}
                />
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  placeholder="Région"
                  componentId="REGION"
                  dataField="region.keyword"
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  react={{ and: FILTERS.filter((e) => e !== "REGION") }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  sortBy="asc"
                />
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  placeholder="Département"
                  componentId="DEPARTMENT"
                  dataField="department.keyword"
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT") }}
                  title=""
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
                renderNoResults={() => <div style={{ padding: "10px 25px" }}>Aucun résultat.</div>}
                onError={() => {
                  window.location.href = "/auth?unauthorized=1";
                }}
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
                        <th>Rôle</th>
                        <th>Crée le</th>
                        <th>Dernière connexion le</th>
                        {!["referent_department", "referent_region"].includes(user.role) && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit, i) => (
                        <Hit key={i} hit={hit} user={user} onClick={() => setResponsable(hit)} />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          <Panel value={responsable} onChange={() => setResponsable(null)} />
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ hit, onClick, user }) => {
  return (
    <tr onClick={onClick}>
      <td>
        <div style={{ color: "#1e242f", fontSize: 15, textTransform: "capitalize" }}>{`${hit.firstName} ${hit.lastName}`}</div>
        {hit.email}
      </td>
      <td>
        <Tag>{translate(hit.role)}</Tag>
      </td>
      <td>{formatStringLongDate(hit.createdAt)}</td>
      <td>{formatStringLongDate(hit.lastLoginAt)}</td>
      {!["referent_department", "referent_region"].includes(user.role) && (
        <td onClick={(e) => e.stopPropagation()}>
          <Action hit={hit} />
        </td>
      )}
    </tr>
  );
};

const Action = ({ hit, color }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleImpersonate = async () => {
    try {
      const { ok, data, token } = await api.post(`/referent/signin_as/referent/${hit._id}`);
      if (!ok) return toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
      if (token) api.setToken(token);
      if (data) dispatch(setUser(data));
      history.push("/dashboard");
    } catch (e) {
      console.log(e);
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };
  return (
    <ActionBox color={"#444"}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          Choisissez une action
          <div className="down-icon">
            <svg viewBox="0 0 407.437 407.437">
              <polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 " />
            </svg>
          </div>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem className="dropdown-item" onClick={handleImpersonate}>
            Prendre sa place
          </DropdownItem>
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

const ActionBox = styled.div`
  .dropdown-menu {
    min-width: 0;
    width: 200px;
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      :hover {
        color: inherit;
      }
    }
  }
  button {
    ${({ color }) => `
      background-color: ${color}15;
      border: 1px solid ${color};
      color: ${color};
    `}
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    border-radius: 0.5rem;
    padding: 0 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    outline: 0;
    width: 100%;
    max-width: 250px;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: ${({ color }) => `${color}`};
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      /* border-left: 1px solid ${({ color }) => `${color}`}; */
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: ${({ color }) => `${color}`};
      }
    }
  }
  .dropdown-item {
    border-radius: 0;
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    :hover {
      background-color: #f3f3f3;
    }
  }
`;
