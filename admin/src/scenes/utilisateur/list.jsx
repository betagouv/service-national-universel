import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import { HiHome } from "react-icons/hi";

import dayjs from "@/utils/dayjs.utils";
import { Badge, Container, DropdownButton, Header, Page } from "@snu/ds/admin";
import { BsDownload } from "react-icons/bs";
import { IoFlashOutline } from "react-icons/io5";
import { canViewReferent, formatLongDateFR, getDepartmentNumber, canSigninAs, ERRORS } from "snu-lib";
import Loader from "../../components/Loader";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters, SortOption } from "../../components/filters-system-v2";
import ModalChangeTutor from "../../components/modals/ModalChangeTutor";
import ModalConfirm from "../../components/modals/ModalConfirm";
import ModalReferentDeleted from "../../components/modals/ModalReferentDeleted";
import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { ROLES, canDeleteReferent, translate } from "../../utils";
import ModalUniqueResponsable from "./composants/ModalUniqueResponsable";
import Panel from "./panel";
import { signinAs } from "@/utils/signinAs";
import { getCohortGroups } from "@/services/cohort.service";

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

    ![ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role)
      ? {
          title: "Cohorte",
          name: "cohorts",
          missingLabel: "Non renseignée",
          translate: translate,
        }
      : null,
  ].filter(Boolean);

  useEffect(() => {
    (async () => {
      if ([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role)) return;
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
    <Page>
      <Header
        title={[ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) ? "Liste de mes contacts" : "Utilisateurs"}
        breadcrumb={[
          { title: <HiHome size={20} className="text-gray-400 hover:text-gray-500" />, to: "/" },
          { title: [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) ? "Mes contacts" : "Utilisateurs" },
        ]}
        actions={[
          <ExportComponent
            key={0}
            title="Exporter"
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
          />,
        ]}
      />
      <Container className="!p-0">
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
              intermediateFilters={[getCohortGroups("cohorts")]}
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
              <table className="mt-6 mb-2 flex w-full flex-col divide-y table-auto divide-gray-100 border-gray-100">
                <thead>
                  <tr className="flex items-center py-3 px-4 text-xs font-[500] leading-5 uppercase text-gray-500 bg-gray-50 cursor-default">
                    <span className="w-[30%]">Utilisateurs</span>
                    <span className="w-[30%]">Rôles / Fonctions</span>
                    <span className="w-[17%]">Création</span>
                    <span className="w-[18%]">Dernière connexion</span>
                    <span className="w-[5%]">Actions</span>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((hit) => (
                    <Hit structure={structures?.find((s) => s._id === hit.structureId)} key={hit._id} hit={hit} user={user} onClick={() => setResponsable(hit)} />
                  ))}
                </tbody>
                <tr className="flex items-center py-3 px-4 text-xs font-[500] leading-5 uppercase text-gray-500 bg-gray-50 cursor-default">
                  <span className="w-[30%]">Utilisateurs</span>
                  <span className="w-[30%]">Rôles / Fonctions</span>
                  <span className="w-[17%]">Création</span>
                  <span className="w-[18%]">Dernière connexion</span>
                  <span className="w-[5%]">Actions</span>
                </tr>
              </table>
            }
          />
        </div>
      </Container>
      <Panel value={responsable} onChange={() => setResponsable(null)} />
    </Page>
  );
}

const Hit = ({ hit, onClick, user, structure }) => {
  const displayActionButton = canViewReferent(user, hit);

  return (
    <tr className="flex items-center py-3 px-4 hover:bg-gray-50" onClick={onClick}>
      <td className="w-[30%] table-cell truncate cursor-pointer">
        <span className="font-bold text-gray-900 text-base leading-5">
          {hit.firstName} {hit.lastName}
        </span>
        <p className="text-xs text-gray-500 leading-5">{hit.email}</p>
      </td>
      <td className="flex w-[30%] flex-col gap-2">
        {hit.role && (
          <>
            <Badge title={translate(hit.role)} />
            {hit.subRole && hit.subRole !== "god" ? <Badge title={translate(hit.subRole)} status={"secondary"} /> : null}
          </>
        )}
      </td>
      <td className="w-[17%]">
        <p className="text-sm leading-none text-gray-900">{dayjs(hit.createdAt).format("DD/MM/YYYY")}</p>
        <p className="text-sm leading-none text-gray-500 mt-2">{dayjs(hit.createdAt).format("hh:mm")}</p>
      </td>
      <td className="w-[18%]">
        <p className="text-sm leading-none text-gray-900">{dayjs(hit.lastLoginAt).format("DD/MM/YYYY")}</p>
        <p className="text-sm leading-none text-gray-500 mt-2">{dayjs(hit.lastLoginAt).format("hh:mm")}</p>
      </td>
      {displayActionButton ? (
        <td className="flex w-[5%] flex-col gap-2">
          <Action hit={hit} structure={structure} />
        </td>
      ) : (
        <td className="flex w-[5%] flex-col gap-2" />
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
  const [handleImpersonateLoading, setHandleImpersonateLoading] = useState(false);

  const handleImpersonate = async () => {
    try {
      if (handleImpersonateLoading) return;
      setHandleImpersonateLoading(true);
      plausibleEvent("Utilisateurs/CTA - Prendre sa place");
      const data = await signinAs("referent", hit._id);
      dispatch(setUser(data));
      history.push("/dashboard");
      setHandleImpersonateLoading(false);
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
      if (!ok && code === ERRORS.OPERATION_UNAUTHORIZED) return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === ERRORS.LINKED_STRUCTURE) return onUniqueResponsible(hit);
      if (!ok && code === ERRORS.LINKED_MISSIONS) return onDeleteTutorLinked(hit);
      if (!ok && code === ERRORS.LINKED_CLASSES) return onUniqueResponsible(hit);
      if (!ok && code === ERRORS.LINKED_ETABLISSEMENT) return onUniqueResponsible(hit);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      return onReferentDeleted();
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };

  return (
    <>
      <DropdownButton
        title={<IoFlashOutline size={20} />}
        mode={"badge"}
        rightIcon={false}
        buttonClassName={"rounded-[50%] !p-0 !w-10 !h-10 border-none hover:bg-white hover:text-blue-600"}
        position="right"
        optionsGroup={[
          {
            key: "actions",
            title: "",
            items: [
              {
                key: "view",
                render: (
                  <Link to={`/user/${hit._id}`} className="appearance-none w-full">
                    <p>Consulter le profil</p>
                  </Link>
                ),
              },
              canSigninAs(user, hit, "referent") ? { key: "takePlace", render: <p>Prendre sa place</p>, action: handleImpersonate } : null,
              canDeleteReferent({ actor: user, originalTarget: hit, structure }) ? { key: "delete", render: <p>Supprimer le profil</p>, action: onClickDelete } : null,
            ].filter(Boolean),
          },
        ]}
      />

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
