import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import React, { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { HiLogin, HiUserAdd } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import Badge from "../../components/Badge";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import ExportComponent from "../../components/ExportXlsx";
import Invite from "../../components/header/invite";
import { Filter, FilterRow, MultiLine, ResultTable, Table, Title } from "../../components/list";
import ModalConfirm from "../../components/modals/ModalConfirm";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import { apiURL } from "../../config";
import api from "../../services/api";
import plausibleEvent from "../../services/pausible";
import { canUpdateReferent, ES_NO_LIMIT, formatLongDateFR, formatStringLongDate, getFilterLabel, ROLES, translate, canDeleteReferent } from "../../utils";
import Nav from "./components/nav";
import Panel from "./panel";
import { BiPencil } from "react-icons/bi";
import { HiOutlineTrash } from "react-icons/hi";

export default function List() {
  const user = useSelector((state) => state.Auth.user);
  const FILTERS = ["SEARCH", "ROLE", "SUBROLE"];
  const [structures, setStructures] = useState();
  const [responsable, setResponsable] = useState(null);
  const [NewUserOpen, setNewUserOpen] = useState(false);
  const [filter, setFilter] = useState({});

  function updateFilter(n) {
    setFilter((f) => ({ ...f, ...n }));
  }

  const getDefaultQuery = () => {
    let body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      track_total_hits: true,
    };
    if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
    if (filter.role?.length) body.query.bool.filter.push({ terms: { "role.keyword": filter.role } });
    return body;
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  const getStructures = async () => {
    const { data, ok } = await api.get("/structure");
    if (!ok) return;
    setStructures(data);
  };

  const getService = async () => {
    const { data, ok } = await api.get(`/department-service`);
    if (!ok) return;
    return data;
  };

  useEffect(() => {
    getStructures();
    getService();
    updateFilter({ region: [user.region] });
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      updateFilter({ department: [user.department] });
    }
  }, []);

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="team" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <div className="flex justify-between items-start px-6 mt-6">
              <Title>Mon équipe - {user.role === ROLES.REFERENT_REGION ? user.region : user.department}</Title>
              <div className="flex items-center ">
                <div className="mr-2">
                  <ExportComponent
                    handleClick={() => plausibleEvent("Utilisateurs/CTA - Exporter mon équipe")}
                    title="Exporter mon équipe"
                    exportTitle="Mon équipe"
                    index="team"
                    defaultQuery={getExportQuery}
                    react={{ and: FILTERS }}
                    transform={async (all) => {
                      const services = await getService();
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
                </div>
                <button
                  className=" box-border border-[1px] rounded-lg border-brand-purple text-brand-purple  hover:shadow-button px-7 py-1 ml-2"
                  onClick={() => setNewUserOpen(true)}>
                  Inviter un nouvel utilisateur
                </button>
              </div>
            </div>
            <div className="flex items-center px-6 mb-3 mr-4">
              <Nav filter={filter} updateFilter={updateFilter} />
            </div>
            <div className="flex items-center px-6 mb-3 mr-4">{/* Card */}</div>
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
              <FilterRow visible className="flex justify-center">
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
                ]}
                defaultSortOption="Nom (A > Z)"
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th width="20%">Email</th>
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
                          setResponsable={setResponsable}
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
      <Invite setOpen={setNewUserOpen} open={NewUserOpen} label="Inviter un nouvel utilisateur"></Invite>
    </div>
  );
}

const Hit = ({ hit, onClick, user, selected, structure, setResponsable }) => {
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
      <td onClick={(e) => e.stopPropagation()}>
        <Action hit={hit} structure={structure} displayActionButton={displayActionButton} setResponsable={setResponsable} />
      </td>
    </tr>
  );
};

const Action = ({ hit, structure, displayActionButton, setResponsable }) => {
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

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
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };
  return (
    <>
      <div className="flex flex-row items-center flex-wrap gap-4">
        <div className="bg-gray-100 rounded-full p-1  hover:scale-105" onClick={() => setResponsable(hit)}>
          <AiOutlineEye className="h-6 w-6 flex justify-center items-center text-gray-600 text-xs" />
        </div>
        {displayActionButton ? (
          <>
            <Link to={`/user/${hit._id}`}>
              <div className="bg-gray-100 rounded-full p-1  hover:scale-105">
                <BiPencil className="h-6 w-6 flex justify-center items-center text-gray-600 text-xs" />
              </div>
            </Link>
            {canDeleteReferent({ actor: user, originalTarget: hit, structure }) ? (
              <div className="bg-gray-100 rounded-full p-1  hover:scale-105" onClick={onClickDelete}>
                <HiOutlineTrash className="h-6 w-6 flex justify-center items-center text-gray-600 text-xs" />
              </div>
            ) : null}
          </>
        ) : null}
      </div>

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
