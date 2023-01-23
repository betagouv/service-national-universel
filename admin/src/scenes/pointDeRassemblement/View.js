import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { canCreateMeetingPoint, canDeleteMeetingPoint, canDeleteMeetingPointSession, canUpdateMeetingPoint, START_DATE_SESSION_PHASE1 } from "snu-lib";
import Pencil from "../../assets/icons/Pencil";
import Trash from "../../assets/icons/Trash";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loader from "../../components/Loader";
import { capture } from "../../sentry";
import api from "../../services/api";
import VerifyAddress from "../phase0/components/VerifyAddress";
import { Title } from "./components/common";
import Field from "./components/Field";
import ModalConfirmDelete from "./components/ModalConfirmDelete";
import ModalCreation from "./components/ModalCreation";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function View(props) {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const urlParams = new URLSearchParams(window.location.search);
  const mount = React.useRef(false);
  const [data, setData] = React.useState(null);
  const [modalCreation, setModalCreation] = React.useState({ isOpen: false });
  const [modalDelete, setModalDelete] = React.useState({ isOpen: false });
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [editInfo, setEditInfo] = React.useState(false);
  const [editSession, setEditSession] = React.useState(false);
  const [currentCohort, setCurrentCohort] = React.useState("");
  const [nbYoung, setNbYoung] = React.useState([]);
  const [lines, setLines] = React.useState([]);
  const [pdrInSchema, setPdrInSchema] = React.useState(false);

  const setYoungsFromES = async (id) => {
    let body = {
      query: { bool: { filter: [{ terms: { "meetingPointId.keyword": [id] } }, { terms: { "status.keyword": ["VALIDATED"] } }] } },
      aggs: { cohort: { terms: { field: "cohort.keyword" } } },
      size: 0,
    };

    const { responses } = await api.esQuery("young", body);
    setNbYoung(responses[0].aggregations.cohort.buckets.map((b) => ({ cohort: b.key, count: b.doc_count })));
  };

  const setLinesFromES = async (id) => {
    let body = {
      query: { bool: { filter: [{ terms: { "meetingPointsIds.keyword": [id] } }] } },
      aggs: { cohort: { terms: { field: "cohort.keyword" } } },
      size: 0,
    };

    const { responses } = await api.esQuery("lignebus", body);
    setLines(responses[0].aggregations.cohort.buckets.map((b) => ({ cohort: b.key, count: b.doc_count })));
  };

  const getPDR = async () => {
    try {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { ok, code, data: reponsePDR } = await api.get(`/point-de-rassemblement/${id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération du point de rassemblement", code);
        return history.push("/point-de-rassemblement");
      }
      setData({ ...reponsePDR, addressVerified: true });

      //check if pdr is in schema
      const { ok: okSchema, code: codeSchema, data: reponseSchema } = await api.get(`/point-de-rassemblement/${reponsePDR._id.toString()}/in-schema`);
      if (!okSchema) {
        toastr.error("Oups, une erreur est survenue lors de la récupération du point de rassemblement", codeSchema);
        return history.push("/point-de-rassemblement");
      }
      setPdrInSchema(reponseSchema);

      await setYoungsFromES(id);
      await setLinesFromES(id);

      return reponsePDR.cohorts;
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du point de rassemblement");
    }
  };

  React.useEffect(() => {
    (async () => {
      if (mount.current === false) {
        const cohorts = await getPDR();
        setCurrentCohort(urlParams.get("cohort") || cohorts[0]);
        mount.current = true;
      }
    })();
  }, [props.match.params.id]);

  React.useEffect(() => {
    if (editInfo === false || editSession === false) {
      getPDR();
      setErrors({});
    }
  }, [editInfo, editSession]);

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setData({
      ...data,
      addressVerified: true,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      address: isConfirmed ? suggestion.address : data.address,
      zip: isConfirmed ? suggestion.zip : data.zip,
      city: isConfirmed ? suggestion.city : data.city,
    });
  };

  const changeComplement = (e) => {
    let complementAddressToUpdate = data.complementAddress;
    complementAddressToUpdate = complementAddressToUpdate.filter((c) => c.cohort !== currentCohort);
    complementAddressToUpdate.push({ cohort: currentCohort, complement: e, edit: true });
    setData({ ...data, complementAddress: complementAddressToUpdate });
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      const { ok, code } = await api.remove(`/point-de-rassemblement/${data._id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression du point de rassemblement", code);
        return setIsLoading(false);
      }
      toastr.success("Le point de rassemblement a bien été supprimé");
      history.push("/point-de-rassemblement");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression du point de rassemblement");
      setIsLoading(false);
    }
  };

  const onDeleteSession = async () => {
    try {
      setIsLoading(true);
      const { ok, code, data: PDR } = await api.put(`/point-de-rassemblement/delete/cohort/${data._id}`, { cohort: currentCohort });
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression du séjour", code);
        return setIsLoading(false);
      }
      toastr.success("Le séjour a bien été supprimé");
      setCurrentCohort(PDR?.cohorts?.sort((a, b) => START_DATE_SESSION_PHASE1[a] - START_DATE_SESSION_PHASE1[b])[0]);
      setData(PDR);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression du séjour");
      setIsLoading(false);
    }
  };

  const onSubmitInfo = async () => {
    try {
      setIsLoading(true);
      const error = {};
      if (!data?.name) {
        error.name = "Le nom est obligatoire";
      }
      if (!data?.address) {
        error.address = "L'adresse est obligatoire";
      }
      if (!data?.city) {
        error.city = "La ville est obligatoire";
      }
      if (!data?.zip) {
        error.zip = "Le code postal est obligatoire";
      }
      if (!data?.addressVerified) {
        error.addressVerified = "L'adresse n'a pas été vérifiée";
      }
      console.log(error);
      setErrors(error);
      if (Object.keys(error).length > 0) return setIsLoading(false);
      const {
        ok,
        code,
        data: PDR,
      } = await api.put(`/point-de-rassemblement/${data._id}`, {
        name: data.name,
        address: data.address,
        city: data.city,
        zip: data.zip,
        department: data.department,
        region: data.region,
        location: data.location,
      });

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la création du point de rassemblement", code);
        return setIsLoading(false);
      }
      setData(PDR);
      setEditInfo(false);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la création du point de rassemblement");
      setIsLoading(false);
    }
  };

  const onSubmitSession = async () => {
    try {
      setIsLoading(true);
      const complementAddressToUpdate = data.complementAddress;
      for await (const infoToUpdate of complementAddressToUpdate) {
        if (infoToUpdate?.edit) {
          const {
            ok,
            code,
            data: PDR,
          } = await api.put(`/point-de-rassemblement/cohort/${data._id}`, {
            cohort: infoToUpdate.cohort,
            complementAddress: infoToUpdate.complement,
          });

          if (!ok) {
            toastr.error("Oups, une erreur est survenue lors de la modifications des compléments d'adresse", code);
            return setIsLoading(false);
          }
          setData(PDR);
        }
      }

      setEditSession(false);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modifications des compléments d'adresse");
      setIsLoading(false);
    }
  };

  if (!data) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Point de rassemblement", to: "/point-de-rassemblement" }, { label: "Fiche point de rassemblement" }]} />
      <div className="flex flex-col m-8 gap-6">
        <div className="flex items-center justify-between">
          <Title>{data.name}</Title>
          <div className="flex items-center gap-2">
            {canDeleteMeetingPoint(user) ? (
              <button
                className="border-[1px] border-red-600 bg-red-600 shadow-sm px-4 py-2 text-white hover:!text-red-600 hover:bg-white transition duration-300 ease-in-out rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() =>
                  setModalDelete({
                    isOpen: true,
                    title: "Supprimer le point de rassemblement",
                    message: "Êtes-vous sûr de vouloir supprimer ce point de rassemblement ?",
                    onDelete: onDelete,
                  })
                }
                disabled={isLoading}>
                Supprimer
              </button>
            ) : null}
            {canCreateMeetingPoint(user) ? (
              <button
                className="border-[1px] border-blue-600 bg-blue-600 shadow-sm px-4 py-2 text-white hover:!text-blue-600 hover:bg-white transition duration-300 ease-in-out rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setModalCreation({ isOpen: true })}
                disabled={isLoading}>
                Rattacher le point à un séjour
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col rounded-lg pt-8 pb-12 px-8 bg-white gap-8">
          <div className="flex items-center justify-between">
            <div className="text-lg leading-6 font-medium text-gray-900">Informations générales</div>
            {canUpdateMeetingPoint(user) ? (
              <>
                {!editInfo ? (
                  <div data-tip="" data-for="tooltip-edit-disabled">
                    {pdrInSchema && (
                      <ReactTooltip id="tooltip-edit-disabled" className="bg-white shadow-xl drop-shadow-sm rounded-xl" arrowColor="white" disable={false}>
                        <div className="text-red-400 text-center">
                          Action impossible : point de rassemblement utilisé dans un schéma de répartition. <br />
                          Rapprochez-vous de la Sous-Direction
                        </div>
                      </ReactTooltip>
                    )}
                    <button
                      className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setEditInfo(true)}
                      disabled={isLoading || pdrInSchema}>
                      <Pencil stroke="#2563EB" className="w-[12px] h-[12px]" />
                      Modifier
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-gray-100 text-gray-700 bg-gray-100 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setEditInfo(false)}
                      disabled={isLoading}>
                      Annuler
                    </button>
                    <button
                      className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={onSubmitInfo}
                      disabled={isLoading}>
                      <Pencil stroke="#2563EB" className="w-[12px] h-[12px] mr-[6px]" />
                      Enregistrer les changements
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
          <div className="flex">
            <div className="flex flex-col w-[45%] gap-4 ">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Nom du point de rassemblement</div>
                <Field
                  label={"Nom du point de rassemblement"}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  value={data.name}
                  error={errors?.name}
                  readOnly={!editInfo}
                />
              </div>
            </div>
            <div className="flex w-[10%] justify-center items-center">
              <div className="w-[1px] h-4/5 border-r-[1px] border-gray-300"></div>
            </div>
            <div className="flex flex-col w-[45%] justify-between">
              <div className="flex flex-col gap-3">
                <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>
                <Field
                  label={"Adresse"}
                  onChange={(e) => setData({ ...data, address: e.target.value, addressVerified: false })}
                  value={data.address}
                  error={errors?.address}
                  readOnly={!editInfo}
                />
                <div className="flex items-center gap-3">
                  <Field
                    label="Code postal"
                    onChange={(e) => setData({ ...data, zip: e.target.value, addressVerified: false })}
                    value={data.zip}
                    error={errors?.zip}
                    readOnly={!editInfo}
                  />
                  <Field
                    label="Ville"
                    onChange={(e) => setData({ ...data, city: e.target.value, addressVerified: false })}
                    value={data.city}
                    error={errors?.city}
                    readOnly={!editInfo}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Field label="Département" onChange={(e) => setData({ ...data, department: e.target.value })} value={data.department} readOnly={true} disabled={editInfo} />
                  <Field label="Région" onChange={(e) => setData({ ...data, region: e.target.value })} value={data.region} readOnly={true} disabled={editInfo} />
                </div>
                {editInfo ? (
                  <div className="flex flex-col gap-2">
                    <VerifyAddress
                      address={data.address}
                      zip={data.zip}
                      city={data.city}
                      onSuccess={onVerifyAddress(true)}
                      onFail={onVerifyAddress()}
                      isVerified={data.addressVerified === true}
                      buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
                      verifyText="Pour vérifier  l'adresse vous devez remplir les champs adresse, code postal et ville."
                    />
                    {errors?.addressVerified && <div className="text-[#EF4444]">{errors.addressVerified}</div>}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        {data?.cohorts?.length > 0 ? (
          <div className="flex flex-col rounded-lg pt-3 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-8">
              <nav className="-mb-px flex space-x-8 " aria-label="Tabs">
                {data?.cohorts
                  ?.sort((a, b) => START_DATE_SESSION_PHASE1[a] - START_DATE_SESSION_PHASE1[b])
                  ?.map((tab) => (
                    <a
                      key={tab}
                      onClick={() => setCurrentCohort(tab)}
                      className={classNames(
                        tab === currentCohort ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                        "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer",
                      )}>
                      {tab}
                    </a>
                  ))}
              </nav>
              {canUpdateMeetingPoint(user) ? (
                <>
                  {!editSession ? (
                    <button
                      className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setEditSession(true)}
                      disabled={isLoading}>
                      <Pencil stroke="#2563EB" className="w-[12px] h-[12px]" />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-gray-100 text-gray-700 bg-gray-100 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setEditSession(false)}
                        disabled={isLoading}>
                        Annuler
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onSubmitSession}
                        disabled={isLoading}>
                        <Pencil stroke="#2563EB" className="w-[12px] h-[12px] mr-[6px]" />
                        Enregistrer les changements
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
            <div className="flex px-8 w-full h-64">
              <div className="relative flex items-center justify-center w-1/3  border-r-[1px] border-gray-200 p-4">
                <Field label="ID" value={data.code} copy={true} />
                {canDeleteMeetingPointSession(user) ? (
                  <button
                    className="absolute bottom-5 right-5 flex gap-2 items-center cursor-pointer px-2 py-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() =>
                      setModalDelete({ isOpen: true, onDelete: onDeleteSession, title: "Supprimer la session", message: "Êtes-vous sûr de vouloir supprimer cette session ?" })
                    }
                    disabled={isLoading}>
                    <Trash className="text-red-400 h-4 w-4" />
                    <div className="text-xs font-medium leading-4 text-gray-800">Supprimer le séjour</div>
                  </button>
                ) : null}
              </div>
              <div className="flex flex-col items-center justify-center w-1/3  border-r-[1px] border-gray-200">
                <div
                  className="flex items-center h-1/2 justify-center text-sm font-medium leading-4 text-gray-900 border-b-[1px] border-gray-200 w-full hover:underline cursor-pointer"
                  onClick={() => history.push(`/ligne-de-bus/volontaires/point-de-rassemblement/${data._id.toString()}?cohort=${currentCohort}`)}>
                  Voir les volontaires ({nbYoung.find((n) => n.cohort === currentCohort)?.count || 0})
                </div>
                <div
                  className="flex items-center h-1/2 justify-center text-sm font-medium leading-4 text-gray-900 border-b-[1px] border-gray-200 w-full hover:underline cursor-pointer"
                  onClick={() => history.push(`/ligne-de-bus?cohort=${currentCohort}&CODE_PDR=%5B"${data.code}"%5D`)}>
                  Liste des lignes de transports ({lines.find((l) => l.cohort === currentCohort)?.count || 0})
                </div>
              </div>
              <div className="flex items-center justify-center w-1/3 p-4">
                <Field
                  label="Complément d’adresse"
                  onChange={(e) => changeComplement(e.target.value)}
                  value={data.complementAddress.find((c) => c.cohort === currentCohort)?.complement}
                  readOnly={!editSession}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <ModalCreation
        isOpen={modalCreation.isOpen}
        onCancel={async (cohort) => {
          setModalCreation({ isOpen: false });
          await getPDR();
          setCurrentCohort(cohort);
        }}
        defaultPDR={data}
        editable={false}
      />
      <ModalConfirmDelete
        isOpen={modalDelete.isOpen}
        title={modalDelete.title}
        message={modalDelete.message}
        onCancel={() => setModalDelete({ isOpen: false })}
        onDelete={() => {
          setModalDelete({ isOpen: false });
          modalDelete.onDelete();
        }}
      />
    </>
  );
}
