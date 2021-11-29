import React, { useState, useEffect } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { toastr } from "react-redux-toastr";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

import { setUser } from "../../redux/auth/actions";
import { translate, getFilterLabel, formatLongDateFR, formatStringLongDate, ES_NO_LIMIT, ROLES, canUpdateReferent } from "../../utils";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import Loader from "../../components/Loader";
const FILTERS = ["SEARCH", "ROLE", "SUBROLE", "REGION", "DEPARTMENT"];
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Chevron from "../../components/Chevron";
import { Filter, FilterRow, ResultTable, Table, ActionBox, Header, Title, MultiLine } from "../../components/list";
import Badge from "../../components/Badge";
import ExportComponent from "../../components/ExportXlsx";
import ReactiveListComponent from "../../components/ReactiveListComponent";

export default () => {
  const [responsable, setResponsable] = useState(null);
  const user = useSelector((state) => state.Auth.user);
  const [structureIds, setStructureIds] = useState();
  const [structures, setStructures] = useState();
  const [services, setServices] = useState();
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => {
    if (user.role === ROLES.SUPERVISOR) return { query: { bool: { filter: { terms: { "structureId.keyword": structureIds } } } } };
    else return { query: { match_all: {} } };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });
  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get("/structure");
      if (!ok) return;
      setStructures(data);
    })();
    (async () => {
      const { data, ok } = await api.get(`/department-service`);
      if (!ok) return;
      setServices(data);
    })();
    if (user.role !== ROLES.SUPERVISOR) return;
    (async () => {
      const { data } = await api.get(`/structure/${user.structureId}/children`);
      const ids = data.map((s) => s._id);
      setStructureIds(ids);
    })();
  }, []);
  if (user.role === ROLES.SUPERVISOR && !structureIds) return <Loader />;

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="referent" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Utilisateurs</Title>
              </div>
              <ExportComponent
                title="Exporter les utilisateurs"
                exportTitle="Utilisateurs"
                index="referent"
                defaultQuery={getExportQuery}
                react={{ and: FILTERS }}
                transform={(all) => {
                  return all.map((data) => {
                    let structure = {};
                    if (data.structureId && structures) {
                      structure = structures.find((s) => s._id === data.structureId);
                      if (!structure) structure = {};
                    }
                    let service = {};
                    if (data.role === ROLES.REFERENT_DEPARTMENT && services) {
                      service = services.find((s) => s.department === data.department);
                      if (!service) service = {};
                    }
                    return {
                      _id: data._id,
                      Prénom: data.firstName,
                      Nom: data.lastName,
                      Email: data.email,
                      Rôle: data.role,
                      Fonction: data.subRole,
                      Téléphone: data.phone,
                      Portable: data.mobile,
                      Département: data.department,
                      Région: data.region,
                      Structure: structure?.name,
                      "Nom de la direction du service départemental": service?.directionName,
                      "Adresse du service départemental": service?.address + service?.complementAddress,
                      "Code Postal du service départemental": service?.zip,
                      "Ville du service départemental": service?.city,
                      "Créé lé": formatLongDateFR(data.createdAt),
                      "Mis à jour le": formatLongDateFR(data.updatedAt),
                      "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
                    };
                  });
                }}
              />
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  showIcon={false}
                  placeholder="Rechercher par prénom, nom, email..."
                  componentId="SEARCH"
                  dataField={["email.keyword", "firstName", "lastName"]}
                  react={{ and: FILTERS }}
                  // fuzziness={2}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                  URLParams={true}
                  queryFormat="and"
                />
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
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
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
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th width="30%">Email</th>
                        <th>Rôle</th>
                        <th>Crée le</th>
                        <th>Dernière connexion le</th>
                        {[ROLES.ADMIN, ROLES.SUPERVISOR].includes(user.role) && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => (
                        <Hit
                          structure={structures?.find((s) => s._id === hit.structureId)}
                          key={hit._id}
                          hit={hit}
                          user={user}
                          onClick={() => setResponsable(hit)}
                          selected={responsable?._id === hit._id}
                        />
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

const Hit = ({ hit, onClick, user, selected, structure }) => {
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
      {canUpdateReferent({ actor: user, originalTarget: hit, structure }) ? (
        <td onClick={(e) => e.stopPropagation()}>
          <Action hit={hit} />
        </td>
      ) : (
        <td />
      )}
    </tr>
  );
};

const Action = ({ hit, color }) => {
  const user = useSelector((state) => state.Auth.user);
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
  console.log("🚀 ~ file: list.js ~ line 252 ~ Action ~ user", user.role, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT);
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
          {user.role !== ROLES.REFERENT_REGION && user.role !== ROLES.REFERENT_DEPARTMENT ? (
            <DropdownItem className="dropdown-item" onClick={handleImpersonate}>
              Prendre sa place
            </DropdownItem>
          ) : null}
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};
