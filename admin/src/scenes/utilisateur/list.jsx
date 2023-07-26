import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";

import { Listbox, Transition } from "@headlessui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BsDownload } from "react-icons/bs";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { formatLongDateFR, getDepartmentNumber } from "snu-lib";
import Badge from "../../components/Badge";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loader from "../../components/Loader";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters, SortOption } from "../../components/filters-system-v2";
import ModalChangeTutor from "../../components/modals/ModalChangeTutor";
import ModalConfirm from "../../components/modals/ModalConfirm";
import ModalReferentDeleted from "../../components/modals/ModalReferentDeleted";
import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { ROLES, canDeleteReferent, canUpdateReferent, translate } from "../../utils";
import { Title } from "../pointDeRassemblement/components/common";
import ModalUniqueResponsable from "./composants/ModalUniqueResponsable";
import Panel from "./panel";

export default function List() {
  const [responsable, setResponsable] = useState(null);
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const [structures, setStructures] = useState();
  const [services, setServices] = useState();

  //List params
  const [data, setData] = useState([]);
  const pageId = "referent-list";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
    sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
  });
  const [size, setSize] = useState(10);

  const filterArray = [
    {
      title: "Rôle",
      name: "role",
      translate: translate,
      missingLabel: "Non renseigné",
    },
    {
      title: "Région",
      name: "region",
      missingLabel: "Non renseignée",
      defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
    },
    {
      title: "Département",
      name: "department",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
    },
    {
      title: "Fonction",
      name: "subRole",
      missingLabel: "Non renseignée",
      translate: translate,
    },
    {
      title: "Cohorte",
      name: "cohorts",
      missingLabel: "Non renseignée",
      translate: translate,
    },
  ];

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
  }, []);

  if (user.role === ROLES.HEAD_CENTER && !sessionPhase1) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Utilisateurs" }]} />
      <div className="flex w-full flex-col px-8">
        <div className="flex items-center justify-between py-8">
          <Title>Utilisateurs</Title>
          <ExportComponent
            title="Exporter les utilisateurs"
            exportTitle="Utilisateurs"
            route={`/elasticsearch/referent/export${user.role === ROLES.HEAD_CENTER ? "?cohort=" + sessionPhase1?.cohort : ""}`}
            filters={filterArray}
            selectedFilters={selectedFilters}
            setIsOpen={() => true}
            icon={<BsDownload className="text-white h-4 w-4 group-hover:!text-blue-600" />}
            customCss={{
              override: true,
              button: `group ml-auto flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out`,
              loadingButton: `group ml-auto flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out`,
            }}
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
                  Structure: structure?.name || "",
                  "Nom de la direction du service départemental": service?.directionName || "",
                  "Adresse du service départemental": service?.address + service?.complementAddress || "",
                  "Code Postal du service départemental": service?.zip || "",
                  "Ville du service départemental": service?.city || "",
                  "Créé lé": formatLongDateFR(data.createdAt),
                  "Mis à jour le": formatLongDateFR(data.updatedAt),
                  "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
                };
              });
            }}
          />
        </div>
        <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
          <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
            <Filters
              pageId={pageId}
              route={`/elasticsearch/referent/search${user.role === ROLES.HEAD_CENTER ? "?cohort=" + sessionPhase1?.cohort : ""}`}
              setData={(value) => setData(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher par prénom, nom, email..."
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
              paramData={paramData}
              setParamData={setParamData}
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
              <table className="mt-4 mb-2 w-full table-auto font-marianne">
                <thead>
                  <tr className="border-y-[1px] border-y-gray-100 uppercase text-gray-400 text-sm">
                    <th className="pl-4 py-3">Email</th>
                    <th className="text-center px-4 py-3">Rôle</th>
                    <th className="text-center px-4 py-3">Création</th>
                    <th className="text-center px-4 py-3">Dernière connexion</th>
                    <th className="text-center pr-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((hit) => (
                    <Hit structure={structures?.find((s) => s._id === hit.structureId)} key={hit._id} hit={hit} user={user} onClick={() => setResponsable(hit)} />
                  ))}
                </tbody>
              </table>
            }
          />
        </div>
      </div>
      <Panel value={responsable} onChange={() => setResponsable(null)} />
    </>
  );
}

const Hit = ({ hit, onClick, user, structure }) => {
  const displayActionButton = canUpdateReferent({ actor: user, originalTarget: hit, structure });
  dayjs.extend(relativeTime).locale("fr");

  return (
    <tr onClick={onClick} className="border-b-[1px] border-y-gray-100 hover:bg-gray-50">
      <td className="pl-4 py-3">
        <span className="font-bold text-gray-900 leading-6">{`${hit.firstName} ${hit.lastName}`}</span>
        <p className="text-sm text-gray-600 leading-5">{hit.email}</p>
      </td>
      <td className="flex flex-col items-center py-3">
        {hit.role && (
          <>
            <Badge text={translate(hit.role)} className="!border-blue-500 !bg-blue-50 !text-blue-500" />
            {hit.subRole && hit.subRole !== "god" ? <Badge text={translate(hit.subRole)} className="!border-gray-500 !bg-gray-50 !text-gray-500" /> : null}
          </>
        )}
      </td>
      <td className="text-center">
        <p className="text-sm leading-none text-gray-900">{dayjs(hit.createdAt).format("DD/MM/YYYY")}</p>
        <p className="text-sm leading-none text-gray-500 mt-2">{dayjs(hit.createdAt).format("hh:mm")}</p>
      </td>
      <td className="text-center">
        <p className="text-sm leading-none text-gray-900">{dayjs(hit.lastLoginAt).format("DD/MM/YYYY")}</p>
        <p className="text-sm leading-none text-gray-500 mt-2">{dayjs(hit.lastLoginAt).format("hh:mm")}</p>
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
  const [modalTutor, setModalTutor] = useState({ isOpen: false, onConfirm: null });
  const [modalUniqueResponsable, setModalUniqueResponsable] = useState({ isOpen: false });
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });

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

  const onDeleteTutorLinked = (target) => {
    setModalTutor({
      isOpen: true,
      value: target,
      onConfirm: () => onConfirmDelete(target),
    });
  };

  const onUniqueResponsible = (target) => {
    setModalUniqueResponsable({
      isOpen: true,
      responsable: target,
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
      if (!ok && code === "LINKED_STRUCTURE") return onUniqueResponsible(user);
      if (!ok && code === "LINKED_MISSIONS") return onDeleteTutorLinked(hit);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      return onReferentDeleted();
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };
  return (
    <>
      <Listbox>
        {({ open }) => (
          <>
            <div className="relative w-4/5 mx-auto">
              <Listbox.Button className="relative w-full text-left">
                <div className={`${open ? "border-blue-500" : ""} flex items-center gap-0 space-y-0 rounded-lg border-[1px] bg-white py-2 px-2.5`}>
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-900">Choisissez une action</p>
                    </div>
                    <div className="pointer-events-none flex items-center pr-2">
                      {open && <HiOutlineChevronUp className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                      {!open && <HiOutlineChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                    </div>
                  </div>
                </div>
              </Listbox.Button>

              <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="max-h-60 absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <Link className="!cursor-pointer" to={`/user/${hit._id}`} target="_blank">
                    <Listbox.Option className={("text-gray-900", "relative cursor-pointer select-none list-none py-2 pl-3 pr-9 hover:text-white hover:bg-blue-600")}>
                      <span className={"block truncate font-normal text-xs"}>Consulter le profil</span>
                    </Listbox.Option>
                  </Link>
                  {user.role === ROLES.ADMIN ? (
                    <Listbox.Option
                      className={("text-gray-900", "relative cursor-pointer select-none list-none py-2 pl-3 pr-9 hover:text-white hover:bg-blue-600")}
                      onClick={handleImpersonate}>
                      <span className={"block truncate font-normal text-xs"}>Prendre sa place</span>
                    </Listbox.Option>
                  ) : null}
                  {canDeleteReferent({ actor: user, originalTarget: hit, structure }) ? (
                    <Listbox.Option
                      className={("text-gray-900", "relative cursor-pointer select-none list-none py-2 pl-3 pr-9 hover:text-white hover:bg-blue-600")}
                      onClick={onClickDelete}>
                      <div className={"block truncate font-normal text-xs"}>Supprimer le profil</div>
                    </Listbox.Option>
                  ) : null}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
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
      <ModalChangeTutor
        isOpen={modalTutor?.isOpen}
        title={modalTutor?.title}
        message={modalTutor?.message}
        tutor={modalTutor?.value}
        onCancel={() => setModalTutor({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modalTutor?.onConfirm();
          setModalTutor({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalUniqueResponsable
        isOpen={modalUniqueResponsable?.isOpen}
        responsable={modalUniqueResponsable?.responsable}
        onConfirm={() => setModalUniqueResponsable({ isOpen: false })}
      />
      <ModalReferentDeleted isOpen={modalReferentDeleted?.isOpen} onConfirm={() => history.go(0)} />
    </>
  );
};
