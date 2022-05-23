import React, { useState, useEffect } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { toastr } from "react-redux-toastr";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import { HiLogin, HiUserAdd } from "react-icons/hi";

import { setUser } from "../../redux/auth/actions";
import { translate, getFilterLabel, formatLongDateFR, formatStringLongDate, ES_NO_LIMIT, ROLES, canUpdateReferent, canDeleteReferent } from "../../utils";
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
import ModalConfirm from "../../components/modals/ModalConfirm";
import plausibleEvent from "../../services/pausible";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import Breadcrumbs from "../../components/Breadcrumbs";

export default function List() {
  const [responsable, setResponsable] = useState(null);
  const user = useSelector((state) => state.Auth.user);
  const [structureIds, setStructureIds] = useState();
  const [structures, setStructures] = useState();
  const [services, setServices] = useState();
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => {
    if (user.role === ROLES.SUPERVISOR) return { query: { bool: { filter: { terms: { "structureId.keyword": structureIds } } } }, track_total_hits: true };
    else return { query: { match_all: {} }, track_total_hits: true };
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
      <Breadcrumbs items={[{ label: "Utilisateurs" }]} />
      <ReactiveBase url={`${apiURL}/es`} app="referent" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Utilisateurs</Title>
              </div>
              <ExportComponent
                handleClick={() => plausibleEvent("Utilisateurs/CTA - Exporter utilisateurs")}
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
                  dataField={["email.keyword", "firstName.folded", "lastName.folded"]}
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
                <DeleteFilters />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                sortOptions={[
                  { label: "Nom (A > Z)", dataField: "lastName.keyword", sortBy: "asc" },
                  { label: "Nom (Z > A)", dataField: "lastName.keyword", sortBy: "desc" },
                  { label: "Prénom (A > Z)", dataField: "firstName.keyword", sortBy: "asc" },
                  { label: "Prénom (Z > A)", dataField: "firstName.keyword", sortBy: "desc" },
                  { label: "Date de création (récent > ancien)", dataField: "createdAt", sortBy: "desc" },
                  { label: "Date de création (ancien > récent)", dataField: "createdAt", sortBy: "asc" },
                  { label: "Dernière connexion (récent > ancien)", dataField: "lastLoginAt", sortBy: "desc" },
                  { label: "Dernière connexion (ancien > récent)", dataField: "lastLoginAt", sortBy: "asc" },
                ]}
                defaultSortOption="Nom (A > Z)"
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th width="30%">Email</th>
                        <th>Rôle</th>
                        <th>Dates</th>
                        <th>Actions</th>
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
}

const Hit = ({ hit, onClick, user, selected, structure }) => {
  const displayActionButton = canUpdateReferent({ actor: user, originalTarget: hit, structure });

  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={onClick}>
      <td>
        <MultiLine>
          <span className="font-bold text-black">{`${hit.firstName} ${hit.lastName}`}</span>
          <p>{hit.email}</p>
        </MultiLine>
      </td>
      <td>
        {hit.role && (
          <div className="flex flex-col items-start">
            <Badge text={translate(hit.role)} className="!bg-[#DAE3FD] !text-[#302B94] !border-[#302B94]" />
            {hit.subRole ? <Badge text={translate(hit.subRole)} /> : null}
          </div>
        )}
      </td>
      <td>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <HiUserAdd className="text-coolGray-600" />
            {formatStringLongDate(hit.createdAt)}
          </div>
          {hit.lastLoginAt ? (
            <div className="flex items-center gap-1">
              <HiLogin className="text-coolGray-600" />
              {formatStringLongDate(hit.lastLoginAt)}
            </div>
          ) : null}
        </div>
      </td>
      {displayActionButton ? (
        <td onClick={(e) => e.stopPropagation()}>
          <Action hit={hit} structure={structure} />
        </td>
      ) : (
        <td />
      )}
    </tr>
  );
};

const Action = ({ hit, structure }) => {
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const handleImpersonate = async () => {
    try {
      plausibleEvent("Utilisateurs/CTA - Prendre sa place");
      const { ok, data, token } = await api.post(`/referent/signin_as/referent/${hit._id}`);
      if (!ok) return toastr.error("Oops, une erreur est survenu lors de la masquarade !");
      if (token) api.setToken(token);
      if (data) dispatch(setUser(data));
      history.push("/dashboard");
    } catch (e) {
      console.log(e);
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };
  const onClickDelete = () => {
    setModal({
      isOpen: true,
      onConfirm: onConfirmDelete,
      title: `Êtes-vous sûr(e) de vouloir supprimer le compte de ${hit.firstName} ${hit.lastName} ?`,
      message: "Cette action est irréversible.",
    });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/referent/${hit._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce profil a été supprimé.");
      return history.go(0);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };
  return (
    <>
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
            {user.role === ROLES.ADMIN ? (
              <DropdownItem className="dropdown-item" onClick={handleImpersonate}>
                Prendre sa place
              </DropdownItem>
            ) : null}
            {canDeleteReferent({ actor: user, originalTarget: hit, structure }) ? (
              <DropdownItem className="dropdown-item" onClick={onClickDelete}>
                Supprimer le profil
              </DropdownItem>
            ) : null}
          </DropdownMenu>
        </UncontrolledDropdown>
      </ActionBox>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
};
