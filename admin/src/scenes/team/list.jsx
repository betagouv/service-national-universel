import React, { useEffect, useState } from "react";
import { HiLogin, HiUserAdd } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import { formatLongDateFR } from "snu-lib";
import Eye from "@/assets/icons/Eye";
import Pencil from "@/assets/icons/Pencil";
import Trash from "@/assets/icons/Trash";
import Badge from "@/components/Badge";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import Invite from "@/components/drawer/components/invite";
import { MultiLine, Table } from "@/components/list";
import ModalConfirm from "@/components/modals/ModalConfirm";
import ModalReferentDeleted from "@/components/modals/ModalReferentDeleted";
import api from "@/services/api";
import { ROLES, canDeleteReferent, canUpdateReferent, formatStringLongDate, translate } from "snu-lib";
import Nav from "./components/nav";
import Panel from "./panel";

export default function List() {
  const user = useSelector((state) => state.Auth.user);
  const [structures, setStructures] = useState();
  const [responsable, setResponsable] = useState(null);
  const [NewUserOpen, setNewUserOpen] = useState(false);
  const [filter, setFilter] = useState({});
  const [currentTab, setCurrentTab] = useState(user.role === ROLES.REFERENT_REGION ? "region" : user.department[0]);

  //List state
  const [data, setData] = useState([]);
  const pageId = "team-list";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  //Filters
  const filterArray = [
    {
      title: "Rôle",
      name: "role",
      missingLabel: "Non renseigné",
      translate: (e) => translate(e),
    },
    {
      title: "Fonction",
      name: "subRole",
      missingLabel: "Non renseigné",
      translate: (e) => translate(e),
    },
  ];

  function updateFilter(n) {
    setFilter((f) => ({ ...f, ...n }));
    const newFilter = Object.entries(n).reduce((e, [key, value]) => {
      return { ...e, [key]: { filter: value } };
    }, {});
    setSelectedFilters((f) => ({ ...f, ...newFilter }));
  }

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
      updateFilter({ department: user.department });
    }
  }, []);

  const onChangeCurrentTab = async (tab) => {
    setCurrentTab(tab);
    setData([]);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <div className="mt-6 flex flex-wrap items-start justify-between px-6">
            <div className="text-2xl font-bold text-black">Mon équipe - {user.role === ROLES.REFERENT_REGION ? `Région ${user.region}` : `Département ${user.department}`}</div>
            <div className="flex items-center ">
              <div className="flex items-stretch mr-2">
                <ExportComponent
                  title="Exporter"
                  filters={filterArray}
                  exportTitle="Mon équipe"
                  route={`/elasticsearch/referent/team/export?tab=${currentTab}`}
                  selectedFilters={selectedFilters}
                  customCss={{
                    override: true,
                    button: `text-blue-600 border-[1px] border-blue-600 rounded-md px-7 py-1  text-sm hover:shadow-button`,
                    loadingButton: `text-blue-600  border border-blue-600 rounded-md px-7 py-1  text-sm`,
                  }}
                  transform={async (all) => {
                    const services = await getService();
                    return all.map((data) => {
                      let structure = {};
                      let department = Array.isArray(data.department) ? data.department : [data.department];
                      department = department.find((d) => filter.department[0] === d);

                      if (data.structureId && structures) {
                        structure = structures.find((s) => s._id === data.structureId);
                        if (!structure) structure = {};
                      }
                      let service = {};
                      if (data.role === ROLES.REFERENT_DEPARTMENT && services) {
                        service = services.find((s) => s.department === department);
                        if (!service) service = {};
                      }

                      return {
                        _id: data._id,
                        Prénom: data.firstName,
                        Nom: data.lastName,
                        Email: data.email,
                        Rôle: translate(data.role),
                        Fonction: translate(data.subRole),
                        Téléphone: data.phone,
                        Portable: data.mobile,
                        Département: department,
                        Région: data.region,
                        Structure: structure?.name,
                        "Nom de la direction du service départemental": service?.directionName,
                        "Adresse du service départemental": service?.address ? service?.address + service?.complementAddress : "",
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
              <button className="ml-2 box-border rounded-lg border-[1px] border-blue-600 px-7 py-1 text-blue-600 hover:shadow-button" onClick={() => setNewUserOpen(true)}>
                Inviter&nbsp;un&nbsp;nouvel&nbsp;utilisateur
              </button>
            </div>
          </div>
          <div className="mb-3 mr-4 flex items-center px-6">
            <Nav filter={filter} updateFilter={updateFilter} currentTab={currentTab} setCurrentTab={onChangeCurrentTab} />
          </div>
          <div className="relative mb-4 items-start mx-4">
            <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
              <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
                <Filters
                  pageId={pageId}
                  route={`/elasticsearch/referent/team/search?tab=${currentTab}`}
                  setData={(value) => setData(value)}
                  filters={filterArray}
                  searchPlaceholder="Rechercher par mots clés, ville, code postal..."
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  paramData={paramData}
                  setParamData={setParamData}
                  size={size}
                />
                <SortOption
                  sortOptions={[
                    { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
                    { label: "Nom (Z > A)", field: "lastName.keyword", order: "desc" },
                    { label: "Prénom (A > Z)", field: "firstName.keyword", order: "asc" },
                    { label: "Prénom (Z > A)", field: "firstName.keyword", order: "desc" },
                    { label: "Date de création (récent > ancien)", field: "createdAt", order: "desc" },
                    { label: "Date de création (ancien > récent)", field: "createdAt", order: "asc" },
                  ]}
                  selectedFilters={selectedFilters}
                  pagination={paramData}
                  onPaginationChange={setParamData}
                />
              </div>

              <div className="mt-2 flex flex-row flex-wrap items-center px-4">
                <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
                <SelectedFilters
                  filterArray={filterArray}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  paramData={paramData}
                  setParamData={setParamData}
                />
              </div>

              <ResultTable
                paramData={paramData}
                setParamData={setParamData}
                currentEntryOnPage={data?.length}
                size={size}
                setSize={setSize}
                render={
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
                }
              />
            </div>
          </div>
        </div>
        <Panel value={responsable} onChange={() => setResponsable(null)} />
      </div>
      <Invite setOpen={setNewUserOpen} open={NewUserOpen} label="Inviter un nouvel utilisateur"></Invite>
    </div>
  );
}

const Hit = ({ hit, onClick, user, selected, structure, setResponsable }) => {
  const displayActionButton = canUpdateReferent({ actor: user, originalTarget: hit, structure });

  return (
    <tr style={{ backgroundColor: selected && "#F3F4F6" }} onClick={onClick} className="group">
      <td>
        <MultiLine>
          <span className="font-bold text-black">{`${hit.firstName} ${hit.lastName}`}</span>
          <p>{hit.email}</p>
        </MultiLine>
      </td>
      <td>
        {hit.role && (
          <div className="flex flex-col items-start">
            <Badge text={translate(hit.role)} className="!border-[#302B94] !bg-[#DAE3FD] !text-[#302B94]" />
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
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });

  const onClickDelete = () => {
    setModal({
      isOpen: true,
      onConfirm: onConfirmDelete,
      title: `Êtes-vous sûr(e) de vouloir supprimer le compte de ${hit.firstName} ${hit.lastName} ?`,
      message: "Cette action est irréversible.",
    });
  };

  const onReferentDeleted = () => {
    setModalReferentDeleted({
      isOpen: true,
    });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/referent/${hit._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      return onReferentDeleted();
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };
  return (
    <>
      <div className="flex flex-row flex-wrap items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:scale-105 group-hover:bg-white" onClick={() => setResponsable(hit)}>
          <Eye width={18} height={18} />
        </div>
        {displayActionButton ? (
          <>
            <Link to={`/user/${hit._id}`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:scale-105 group-hover:bg-white">
                <Pencil width={16} height={16} />
              </div>
            </Link>
            {canDeleteReferent({ actor: user, originalTarget: hit, structure }) ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:scale-105 group-hover:bg-white" onClick={onClickDelete}>
                <Trash width={16} height={16} />
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
      <ModalReferentDeleted isOpen={modalReferentDeleted?.isOpen} onConfirm={() => history.go(0)} />
    </>
  );
};
