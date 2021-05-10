import React, { useState, useEffect } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

import { setUser } from "../../redux/auth/actions";
import { translate, getFilterLabel, formatStringLongDate } from "../../utils";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import Loader from "../../components/Loader";
const FILTERS = ["SEARCH", "ROLE", "SUBROLE", "REGION", "DEPARTMENT"];
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Chevron from "../../components/Chevron";
import { Filter, FilterRow, ResultTable, Table, TopResultStats, BottomResultStats, ActionBox, Header, Title, MultiLine } from "../../components/list";
import Badge from "../../components/Badge";

export default () => {
  const [responsable, setResponsable] = useState(null);
  const user = useSelector((state) => state.Auth.user);
  const [structureIds, setStructureIds] = useState();
  const getDefaultQuery = () => {
    if (user.role === "supervisor") return { query: { bool: { filter: { terms: { "structureId.keyword": structureIds } } } } };
    else if (user.role === "head_center") return { query: { bool: { filter: { term: { "role.keyword": "head_center" } } } } };
    else return { query: { match_all: {} } };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: 10000 });
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
      <ReactiveBase url={`${apiURL}/es`} app="referent" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                {/* <Subtitle>RESPONSABLE</Subtitle> */}
                <Title>Utilisateurs</Title>
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
                  defaultQuery={getDefaultQuery}
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
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="SUBROLE"
                  dataField="subRole.keyword"
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  react={{ and: FILTERS.filter((e) => e !== "SUBROLE") }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Fonction")}
                />
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveList
                defaultQuery={getDefaultQuery}
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
                        <Hit key={i} hit={hit} user={user} onClick={() => setResponsable(hit)} selected={responsable?._id === hit._id} />
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

const Hit = ({ hit, onClick, user, selected }) => {
  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={onClick}>
      <td>
        <MultiLine>
          <h2>{`${hit.firstName} ${hit.lastName}`}</h2>
          <p>{hit.email}</p>
        </MultiLine>
      </td>
      <td>{hit.role && <Badge text={translate(hit.role)} />}</td>
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
          <Chevron color="#444" />
        </DropdownToggle>
        <DropdownMenu>
          <Link to={`/user/${hit._id}`}>
            <DropdownItem className="dropdown-item">Consulter le profil</DropdownItem>
          </Link>
          <DropdownItem className="dropdown-item" onClick={handleImpersonate}>
            Prendre sa place
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};
