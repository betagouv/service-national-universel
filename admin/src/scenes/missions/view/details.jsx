import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import ReactSelect from "react-select";
import AsyncSelect from "react-select/async";
import CreatableSelect from "react-select/creatable";
import { useSelector } from "react-redux";
import validator from "validator";

import { useAddress, MISSION_STATUS } from "snu-lib";
import { AddressForm } from "@snu/ds/common";
import { useDebounce } from "@uidotdev/usehooks";
import InfoMessage from "../../dashboardV2/components/ui/InfoMessage";

import { translate, ROLES, MISSION_DOMAINS, PERIOD, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL, SENDINBLUE_TEMPLATES, ENABLE_PM } from "@/utils";
import MissionView from "./wrapper";
import Pencil from "../../../assets/icons/Pencil";
import Field from "@/components/ui/forms/Field";
import VerifyAddress from "../../phase0/components/VerifyAddress";
import Toggle from "../../../components/Toggle";

import ModalConfirm from "../../../components/modals/ModalConfirm";

import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { adminURL } from "../../../config";
import ExternalLink from "../../../assets/icons/ExternalLink";
import ViewStructureLink from "../../../components/buttons/ViewStructureLink";
import { isPossiblePhoneNumber } from "libphonenumber-js";

export default function DetailsView({ mission, setMission, getMission }) {
  const [values, setValues] = useState(mission);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [referents, setReferents] = useState([]);
  const [creationTutor, setCreationTutor] = useState(false);
  const { user } = useSelector((state) => state.Auth);
  const [structure, setStructure] = useState(null);

  const [editingBottom, setEdittingBottom] = useState(false);
  const [loadingBottom, setLoadingBottom] = useState(false);
  const [errorsBottom, setErrorsBottom] = useState({});

  const [newTutor, setNewTutor] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  const [modalConfirmation, setModalConfirmation] = useState(false);
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, 300);
  const { results } = useAddress({ query: debouncedQuery, options: { limit: 10 }, enabled: debouncedQuery.length > 2 });

  const thresholdPendingReached = mission.pendingApplications > 0 && mission.pendingApplications >= mission.placesLeft * 5;
  const valuesToCheck =
    mission?.isJvaMission === "true"
      ? ["name", "structureName", "description", "actions", "format"]
      : ["name", "structureName", "mainDomain", "address", "zip", "city", "description", "actions", "format", "tutorId"];
  const valuesToUpdate = [
    ...valuesToCheck,
    "structureId",
    "addressVerified",
    "duration",
    "contraintes",
    "domains",
    "hebergement",
    "hebergementPayant",
    "tutor",
    "visibility",
    "region",
    "department",
    "location",
    "isMilitaryPreparation",
  ];

  const history = useHistory();

  const referentSelectRef = useRef();

  async function initContext({ structureId }) {
    if (!structureId) return history.push("/mission");

    //init structure
    const { ok, data, code } = await api.get(`/structure/${structureId}`);
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération de la structure", translate(code));
    setValues({ ...values, structureName: data.name, structureId: data._id.toString() });
    setStructure(data);

    const { responses } = await api.post("/elasticsearch/referent/structure/" + structureId);
    if (responses?.length) {
      const responseReferents = responses[0].hits.hits.map((hit) => ({ label: hit._source.firstName + " " + hit._source.lastName, value: hit._id, tutor: hit._source }));
      if (!responseReferents.find((ref) => ref.value === values.tutorId)) {
        if (referentSelectRef.current?.select?.select) referentSelectRef.current.select.select.setValue("");
        setValues({ ...values, tutorId: "" });
      }
      setReferents(responseReferents);
    }
  }

  useEffect(() => {
    initContext({ structureId: values.structureId });
  }, [values.structureId]);

  const fetchStructures = async (inputValue) => {
    const { responses } = await api.post("/elasticsearch/structure/search", { filters: { searchbar: [inputValue] } });
    return responses[0].hits.hits.map((hit) => {
      return { value: hit._source, _id: hit._id, label: hit._source.name, structure: hit._source };
    });
  };

  const onSubmitForm = async () => {
    // Réinitialiser les états de chargement et d'erreur
    setLoading(true);
    setLoadingBottom(true);
    const error = {};
    const errorBottom = {};

    setLoading(true);
    const baseError = "Ce champ est obligatoire";
    valuesToCheck.map((val) => {
      if (!values[val]) error[val] = baseError;
    });
    if (mission?.isJvaMission === "false" && !values.addressVerified) error.addressVerified = "L'adresse doit être vérifiée";
    //check duration only if specified
    if (values.duration && isNaN(values.duration)) error.duration = "Le format est incorrect";
    if (!error.tutorId && !referents.find((ref) => ref.value === values.tutorId)) error.tutorId = "Erreur";

    setErrors(error);
    if (Object.keys(error).length > 0) {
      toastr.error("Oups, le formulaire est incomplet");
      return setLoading(false);
    }

    setLoadingBottom(true);
    if (values.startAt < new Date() && ![ROLES.ADMIN].includes(user.role)) error.startAt = "La date est incorrect";
    if (values.startAt > values.endAt) error.endAt = "La date de fin est incorrect";
    if (values.placesTotal === "" || isNaN(values.placesTotal) || values.placesTotal < 0) error.placesTotal = "Le nombre de places est incorrect";
    if (values.placesTotal < mission.placesTotal && mission.placesLeft - (mission.placesTotal - values.placesTotal) < 0)
      error.placesTotal = "Il y a plus de candidatures que de places";

    setErrorsBottom(error);
    if (Object.keys(error).length > 0) {
      toastr.error("Oups, le formulaire est incomplet");
      return setLoadingBottom(false);
    }

    // Fusionner les objets d'erreur
    const combinedError = { ...error, ...errorBottom };

    // Si des erreurs sont trouvées, afficher un message d'erreur
    if (Object.keys(combinedError).length > 0) {
      toastr.error("Oups, le formulaire est incomplet");
      setLoading(false);
      setLoadingBottom(false);
      return;
    }

    // Déterminer si le statut de la mission doit être modifié
    const shouldChangeStatus = (values.description !== mission.description || values.actions !== mission.actions) && mission.status !== "WAITING_VALIDATION";

    // Si nécessaire, ouvrir la modale de confirmation
    if (shouldChangeStatus) {
      return setModalConfirmation(true);
    }

    // Mettre à jour la mission avec tous les champs nécessaires
    await updateMission([...valuesToUpdate, "startAt", "endAt", "placesTotal", "frequence", "period", "subPeriod"]);
  };

  useEffect(() => {
    if (values.period.length === 0 || (values.period.length === 1 && values.period[0] === "WHENEVER")) {
      setValues({ ...values, subPeriod: [] });
    }
  }, [values.period]);

  const updateMission = async (valuesToUpdate) => {
    try {
      // build object from array of keys
      const valuesToSend = valuesToUpdate.reduce((o, key) => ({ ...o, [key]: values[key] }), {});
      if (valuesToSend.addressVerified) valuesToSend.addressVerified = valuesToSend.addressVerified.toString();
      if (structure.isMilitaryPreparation !== "true") valuesToSend.isMilitaryPreparation = "false";
      const { ok, code, data: missionReturned } = await api.put(`/mission/${values._id}`, valuesToSend);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'enregistrement de la mission", translate(code));
        setLoadingBottom(false);
        return setLoading(false);
      }
      toastr.success("Mission enregistrée");
      setLoading(false);
      setLoadingBottom(false);
      setEdittingBottom(false);
      setEditing(false);
      setValues(missionReturned);
      setMission(missionReturned);
    } catch (e) {
      setLoading(false);
      setLoadingBottom(false);
      return toastr.error("Oups, une erreur est survenue lors de l'enregistrement de la mission");
    }
  };

  const mainDomainsOption = Object.keys(MISSION_DOMAINS).map((d) => {
    return { value: d, label: translate(d) };
  });

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setValues({
      ...values,
      addressVerified: true,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      address: isConfirmed ? suggestion.address : values.address,
      zip: isConfirmed ? suggestion.zip : values.zip,
      city: isConfirmed ? suggestion.city : values.city,
    });
  };

  const formatOptions = [
    { value: "CONTINUOUS", label: translate("CONTINUOUS") },
    { value: "DISCONTINUOUS", label: translate("DISCONTINUOUS") },
  ];
  const sendInvitation = async () => {
    try {
      let error = {};
      if (!newTutor.firstName) error.firstName = "Ce champ est obligatoire";
      if (!newTutor.lastName) error.lastName = "Ce champ est obligatoire";
      if (!validator.isEmail(newTutor.email)) error.email = "L'email est incorrect";
      if (!newTutor.phone) error.phone = "Ce champ est obligatoire";
      if (!isPossiblePhoneNumber(newTutor.phone, "FR")) error.phone = "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX";
      setErrors(error);
      if (Object.keys(error).length > 0) return setLoading(false);

      newTutor.structureId = values.structureId;
      newTutor.structureName = values.structureName;
      if (structure?.isNetwork === "true") {
        newTutor.role = ROLES.SUPERVISOR;
      } else {
        newTutor.role = ROLES.RESPONSIBLE;
      }
      const { ok, code } = await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`, newTutor);
      if (!ok) toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(code));
      setNewTutor({ firstName: "", lastName: "", email: "", phone: "" });
      setCreationTutor(false);
      initContext({ structureId: values.structureId });
      return toastr.success("Invitation envoyée");
    } catch (e) {
      if (e.code === "USER_ALREADY_REGISTERED")
        return toastr.error("Cette adresse email est déjà utilisée.", `${newTutor.email} a déjà un compte sur cette plateforme.`, { timeOut: 10000 });
      toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(e));
    }
  };

  if (!mission || !structure) return null;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <ModalConfirm
        isOpen={modalConfirmation}
        title={"Modification de statut"}
        message={"Êtes-vous sûr(e) de vouloir continuer ? Certaines modifications entraîneront une modification du statut de la mission : En attente de validation."}
        onCancel={() => {
          setModalConfirmation(false);
          setLoading(false);
        }}
        onConfirm={() => {
          setModalConfirmation(false);
          updateMission(valuesToUpdate);
        }}
      />
      <MissionView mission={mission} getMission={getMission} tab="details">
        {editing && mission?.isJvaMission === "true" ? (
          <div className="mb-2.5 rounded-lg bg-violet-100 p-4 text-center text-base text-indigo-800">
            Les informations grisées sont à modifier par le responsable de la structure depuis son espace{" "}
            <a target="_blank" rel="noreferrer" href="https://www.jeveuxaider.gouv.fr/">
              jeveuxaider.gouv.fr
            </a>
          </div>
        ) : null}
        {mission.status === MISSION_STATUS.WAITING_VALIDATION ? (
          <InfoMessage message="La mission est en attente de validation. Son contenu va être vérifié par un référent SNU du département dans lequel se déroulera la mission dans les jours à venir." />
        ) : null}
        {mission.status === MISSION_STATUS.DRAFT ? (
          <InfoMessage message='Si la mission reste au statut brouillon celle-ci ne sera pas étudiée et par conséquent le volontaire ne pourra pas y candidater. Pensez à modifier son statut en la passant "En attente de validation". (bouton en haut à droite de votre écran)' />
        ) : null}
        <div className="mb-8 rounded-xl bg-white pt-2 mt-8">
          <div className="flex flex-col rounded-xl bg-white px-8 pb-12">
            <div className="my-4 flex items-center justify-between">
              <div className="flex w-full flex-1 flex-row items-center justify-start gap-4">
                <div className="text-lg font-medium text-gray-900">Informations générales</div>
                {mission.status === "VALIDATED" && (
                  <div className="flex flex-row items-center justify-center gap-2">
                    <Toggle
                      id="visibility"
                      name="visibility"
                      disabled={!editing}
                      value={!thresholdPendingReached && values.visibility === "VISIBLE"}
                      onChange={(e) => {
                        setValues({ ...values, visibility: e ? "VISIBLE" : "HIDDEN" });
                      }}
                    />
                    <div>
                      <span>
                        La mission est <strong>{!thresholdPendingReached && values.visibility === "VISIBLE" ? "ouverte" : "fermée"}</strong> aux candidatures
                      </span>
                      {thresholdPendingReached && (
                        <span>
                          <strong>&nbsp; &#183;</strong> Vous avez atteint le seuil des&nbsp;
                          <span className="cursor-pointer text-blue-600 underline" onClick={() => history.push(`/mission/${mission._id}/youngs`)}>
                            candidatures à traiter
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {mission.status !== MISSION_STATUS.ARCHIVED && (
                <>
                  {!editing ? (
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setEditing(true)}
                      disabled={loading}>
                      <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs font-medium leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          setEditing(false);
                          setValues({ ...mission });
                          setErrors({});
                          setErrorsBottom({});
                        }}
                        disabled={loading}>
                        Annuler
                      </button>
                      <button
                        className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={onSubmitForm}
                        disabled={loading}>
                        <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                        Enregistrer les changements
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-14">
              <div className="flex min-w-[350px] flex-1 flex-col gap-4">
                <div>
                  <div className="mb-2 text-xs font-medium">
                    Donnez un nom à votre mission. Privilégiez une phrase précisant l&apos;action du volontaire. Ex : « Je fais les courses de produits pour mes voisins les plus
                    fragiles »
                  </div>
                  <Field name="name" error={errors?.name} readOnly={!editing} onChange={(name) => setValues({ ...values, name })} label="Nom de la mission" value={values.name} />
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-xs font-medium">Structure rattachée</div>
                  <AsyncSelect
                    label="Structure"
                    value={{ label: values.structureName }}
                    loadOptions={fetchStructures}
                    isDisabled={!editing}
                    noOptionsMessage={() => "Aucune structure ne correspond à cette recherche"}
                    styles={{
                      dropdownIndicator: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
                      placeholder: (styles) => ({ ...styles, color: "black" }),
                      control: (styles, { isDisabled }) => ({ ...styles, borderColor: "#D1D5DB", backgroundColor: isDisabled ? "white" : "white" }),
                      singleValue: (styles) => ({ ...styles, color: "black" }),
                      multiValueRemove: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
                      indicatorsContainer: (provided, { isDisabled }) => ({ ...provided, display: isDisabled ? "none" : "flex" }),
                    }}
                    defaultOptions
                    onChange={(e) => {
                      setValues({ ...values, structureName: e.label, structureId: e._id });
                    }}
                    placeholder="Rechercher une structure"
                    error={errors.structureName}
                  />
                  {values.structureName && <ViewStructureLink structureId={values.structureId} />}
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-xs font-medium">Domaine d&apos;action principal</div>
                  <CustomSelect
                    readOnly={!editing}
                    isJvaMission={mission?.isJvaMission === "true"}
                    noOptionsMessage={"Aucun domaine ne correspond à cette recherche"}
                    options={mainDomainsOption}
                    placeholder={"Sélectionnez un domaine principal"}
                    onChange={(e) => {
                      setValues({ ...values, mainDomain: e.value, domains: values.domains.filter((d) => d !== e.value) });
                    }}
                    value={values.mainDomain}
                  />
                  <div className="my-2 flex flex-row text-xs font-medium">
                    <div>Domaine(s) d&apos;action secondaire(s)</div>
                    <div className="text-gray-400">&nbsp;(facultatif)</div>
                  </div>
                  <CustomSelect
                    readOnly={!editing}
                    isMulti
                    options={mainDomainsOption.filter((d) => d.value !== values.mainDomain)}
                    noOptionsMessage={"Aucun domaine ne correspond à cette recherche"}
                    placeholder={"Sélectionnez un ou plusieurs domaines"}
                    onChange={(e) => {
                      setValues({ ...values, domains: e });
                    }}
                    value={[...values.domains]}
                  />
                </div>
                <div>
                  <div className="mt-8 mb-4 text-lg font-medium text-gray-900">Lieu où se déroule la mission</div>
                  <div className="mb-2 text-xs font-medium">Adresse</div>
                  <AddressForm
                    readOnly={!editing}
                    data={{ address: values.address, zip: values.zip, city: values.city }}
                    updateData={(address) => setValues({ ...values, ...address, addressVerified: false })}
                    query={query}
                    setQuery={setQuery}
                    options={results}
                  />
                  {editing && (!mission?.isJvaMission || mission?.isJvaMission === "false") && !values.addressVerified && (
                    <div className="flex flex-col gap-2 ">
                      <VerifyAddress
                        address={values.address}
                        zip={values.zip}
                        city={values.city}
                        onSuccess={onVerifyAddress(true)}
                        onFail={onVerifyAddress()}
                        isVerified={values.addressVerified === true}
                        buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
                        verifyText="Pour vérifier  l'adresse vous devez remplir les champs adresse, code postal et ville."
                      />
                      {errors?.addressVerified && <div className="text-[#EF4444]">{errors.addressVerified}</div>}
                    </div>
                  )}
                </div>
                <div>
                  <div className="mt-8 mb-4 text-lg font-medium text-gray-900">Tuteur de la mission</div>
                  <div className="mb-2 text-xs font-medium">
                    Sélectionner le tuteur qui va s&apos;occuper de la mission. Vous pouvez également ajouter un nouveau tuteur à votre équipe.
                  </div>
                  {!editing ? (
                    <a target="_blank" rel="noreferrer" href={`${adminURL}/user/${referents?.find((ref) => ref.value === values.tutorId)?.value}`}>
                      <div className="flex w-full cursor-pointer flex-row items-center gap-2 rounded border-[1px] border-[#D1D5DB] p-2">
                        <div className="ml-1">{referents?.find((ref) => ref.value === values.tutorId)?.label}</div>
                        <ExternalLink />
                      </div>
                    </a>
                  ) : (
                    <CreatableSelect
                      isDisabled={!editing || mission?.isJvaMission === "true"}
                      options={referents}
                      ref={referentSelectRef}
                      error={errors.tutorId}
                      styles={{
                        dropdownIndicator: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
                        placeholder: (styles) => ({ ...styles, color: errors.tutorId ? "red" : "black" }),
                        control: (styles) => ({ ...styles, borderColor: "#D1D5DB", backgroundColor: editing && mission?.isJvaMission === "true" ? "#E5E7EB" : "white" }),
                        singleValue: (styles) => ({ ...styles, color: "black" }),
                        multiValueRemove: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
                        indicatorsContainer: (provided, { isDisabled }) => ({ ...provided, display: isDisabled ? "none" : "flex" }),
                      }}
                      noOptionsMessage={"Aucun tuteur ne correspond à cette recherche"}
                      placeholder={"Sélectionnez un tuteur"}
                      onChange={(e) => {
                        setValues({ ...values, tutorName: e.label, tutorId: e.value, tutor: e.tutor });
                      }}
                      formatCreateLabel={() => {
                        return (
                          <div className="flex flex-col items-center gap-2" onClick={() => setCreationTutor(true)}>
                            <div className="text-sm">Le tuteur recherché n&apos;est pas dans la liste ?</div>
                            <div className="text- font-medium text-blue-600">Ajouter un nouveau tuteur</div>
                          </div>
                        );
                      }}
                      isValidNewOption={() => true}
                      value={referents?.find((ref) => ref.value === values.tutorId) || ""}
                    />
                  )}

                  {editing && creationTutor && (
                    <div>
                      <div className="mt-8 mb-4 text-lg font-medium text-gray-900">Créer un tuteur</div>
                      <div className="mb-2 text-xs font-medium">Identité et contact</div>
                      <div className="mb-4 flex flex-row justify-between gap-3">
                        <Field
                          readOnly={!editing}
                          label="Nom"
                          className="w-[50%]"
                          name="lastName"
                          onChange={(lastName) => setNewTutor({ ...newTutor, lastName })}
                          value={newTutor.lastName}
                          error={errors?.lastName}
                        />
                        <Field
                          readOnly={!editing}
                          label="Prénom"
                          name="firstName"
                          className="w-[50%]"
                          onChange={(firstName) => setNewTutor({ ...newTutor, firstName })}
                          value={newTutor.firstName}
                          error={errors?.firstName}
                        />
                      </div>
                      <Field
                        readOnly={!editing}
                        label="Email"
                        name="email"
                        onChange={(email) => setNewTutor({ ...newTutor, email })}
                        value={newTutor.email}
                        error={errors?.email}
                      />
                      <Field
                        readOnly={!editing}
                        label="Téléphone"
                        name="phone"
                        className="my-4"
                        onChange={(phone) => setNewTutor({ ...newTutor, phone })}
                        value={newTutor.phone}
                        error={errors?.phone}
                      />
                      <div className="flex w-full justify-end">
                        <div className="inline-block cursor-pointer rounded bg-blue-600 py-2.5 px-4 text-sm font-medium text-white" onClick={sendInvitation}>
                          Envoyer l&apos;invitation
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden items-center justify-center xl:flex">
                <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
              </div>
              <div className="flex min-w-[350px] flex-1 flex-col gap-4">
                <div>
                  <div className="mb-2 text-xs font-medium">Type de mission</div>
                  <CustomSelect
                    errors={errors}
                    readOnly={!editing}
                    options={formatOptions}
                    placeholder={"Mission regroupée sur des journées"}
                    onChange={(e) => setValues({ ...values, format: e.value })}
                    value={values.format}
                  />
                </div>
                <div>
                  <div className="mt-2 flex flex-row text-xs font-medium">
                    <div>Durée de la mission</div>
                    <div className="text-gray-400">&nbsp;(facultatif)</div>
                  </div>
                  <div className="mb-2 text-xs font-medium">Saisissez un nombre d&apos;heures prévisionnelles pour la réalisation de la mission</div>
                  <Field
                    error={errors?.duration}
                    readOnly={!editing}
                    name="duration"
                    onChange={(duration) => setValues({ ...values, duration })}
                    label="Heure(s)"
                    value={translate(values.duration)}
                  />
                </div>
                <div>
                  <div className="my-2 flex flex-row text-xs font-medium">
                    <div>
                      Objectifs de la mission -
                      <span className="text-gray-400">
                        &nbsp;En cas de modification de ce champ après validation de votre mission, cette dernière repassera en attente de validation et devra être de nouveau
                        étudiée par votre référent départemental.
                      </span>
                    </div>
                  </div>
                  <Field
                    error={errors?.description}
                    readOnly={!editing}
                    name="description"
                    type="textarea"
                    row={4}
                    onChange={(description) => setValues({ ...values, description })}
                    label="Décrivez votre mission"
                    value={translate(values.description)}
                  />
                </div>
                <div>
                  <div className="my-2 flex flex-row text-xs font-medium">
                    <div>
                      Actions concrètes confiées au(x) volontaire(s) -
                      <span className="text-gray-400">
                        &nbsp;En cas de modification de ce champ après validation de votre mission, cette dernière repassera en attente de validation et devra être de nouveau
                        étudiée par votre référent départemental.
                      </span>
                    </div>
                  </div>
                  <Field
                    error={errors?.actions}
                    readOnly={!editing}
                    type="textarea"
                    name="actions"
                    row={4}
                    onChange={(actions) => setValues({ ...values, actions })}
                    label="Listez les actions confiées au(x) volontaires"
                    value={translate(values.actions)}
                  />
                </div>
                <div>
                  <div className="my-2 flex flex-col text-xs font-medium">
                    <div>
                      Contraintes spécifiques pour cette mission
                      <span className="text-gray-400">&nbsp;(facultatif).&nbsp;</span>
                    </div>
                    <div>(conditions physiques, période de formation, mission en soirée...)</div>
                  </div>
                  <Field
                    readOnly={!editing}
                    type="textarea"
                    row={4}
                    onChange={(contraintes) => setValues({ ...values, contraintes })}
                    label="Précisez les informations complémentaires à préciser au volontaire."
                    value={translate(values.contraintes)}
                  />
                </div>
                {ENABLE_PM && structure.isMilitaryPreparation === "true" ? (
                  <div className="flex flex-row items-center justify-between">
                    <div className="font-medium text-gray-800">Préparation Militaire : {values?.isMilitaryPreparation === "true" ? "oui" : "non"}</div>
                    <Toggle
                      id="hebergement"
                      name="hebergement"
                      disabled={!editing}
                      value={values?.isMilitaryPreparation === "true"}
                      onChange={(e) => {
                        setValues({ ...values, isMilitaryPreparation: e.toString() });
                      }}
                    />
                  </div>
                ) : null}
                <div>
                  <div className="mt-8 mb-4 text-lg font-medium text-gray-900">Hébergement</div>
                  <div className="flex flex-row items-center justify-between">
                    <div className="font-medium text-gray-800">Hébergement proposé : {values?.hebergement === "true" ? "oui" : "non"}</div>
                    <Toggle
                      id="hebergement"
                      name="hebergement"
                      disabled={!editing}
                      value={values?.hebergement === "true"}
                      onChange={(e) => {
                        setValues({ ...values, hebergement: e.toString() });
                      }}
                    />
                  </div>
                  {values?.hebergement === "true" && (
                    <div className="mt-4 flex flex-row gap-8">
                      <div
                        onClick={() => editing && setValues({ ...values, hebergementPayant: "false" })}
                        className={`flex flex-row items-center justify-center gap-2 ${editing && "cursor-pointer"}`}>
                        <CheckBox value={values?.hebergementPayant === "false"} />
                        <div className="font-medium text-gray-700">Hébergement gratuit</div>
                      </div>
                      <div
                        onClick={() => editing && setValues({ ...values, hebergementPayant: "true" })}
                        className={`flex flex-row items-center justify-center gap-2 ${editing && "cursor-pointer"}`}>
                        <CheckBox value={values.hebergementPayant === "true"} />
                        <div className="font-medium text-gray-700">Hébergement payant</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-8 rounded-xl bg-white pt-2">
          <div className="flex flex-col rounded-xl bg-white px-8 pb-12">
            <div className="my-4 flex items-center justify-between">
              <div className="text-lg font-medium text-gray-900">
                <div>Dates et places disponibles</div>
              </div>
              {mission.status !== MISSION_STATUS.ARCHIVED && (
                <>
                  {!editing ? (
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setEditing(true)}
                      disabled={loading}>
                      <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs font-medium leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          setEditing(false);
                          setValues({ ...mission });
                          setErrors({});
                          setErrorsBottom({});
                        }}
                        disabled={loading}>
                        Annuler
                      </button>
                      <button
                        className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={onSubmitForm}
                        disabled={loading}>
                        <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                        Enregistrer les changements
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-12">
              <div className="flex min-w-[350px] flex-1 flex-col gap-4">
                <div>
                  <div className="mb-2 text-xs font-medium">Dates de la mission</div>
                  <div className="my-2 flex flex-row justify-between gap-3">
                    <Field
                      name="startAt"
                      readOnly={!editing}
                      label="Date de début"
                      type="date"
                      className="w-[50%]"
                      onChange={(startAt) => setValues({ ...values, startAt })}
                      value={values.startAt}
                      error={errors?.startAt}
                    />
                    <Field
                      readOnly={!editing}
                      bgColor={mission?.isJvaMission === "true" && "bg-gray-200"}
                      label="Date de fin"
                      name="endAt"
                      className="w-[50%]"
                      type="date"
                      onChange={(endAt) => setValues({ ...values, endAt })}
                      value={values.endAt}
                      error={errors?.endAt}
                    />
                  </div>
                  <div className="my-2 flex flex-col text-xs font-medium">
                    <div>
                      Fréquence estimée de la mission
                      <span className="text-gray-400">&nbsp;(facultatif)&nbsp;</span>
                      (tous les mardis soirs, le samedi, tous les mercredis après-midi pendant un trimestre...)
                    </div>
                  </div>
                  <Field
                    error={errorsBottom?.frequence}
                    readOnly={!editing}
                    bgColor={mission?.isJvaMission === "true" && "bg-gray-200"}
                    name="frequence"
                    type="textarea"
                    row={4}
                    onChange={(frequence) => setValues({ ...values, frequence })}
                    label="Fréquence estimée de la mission"
                    value={values.frequence}
                  />
                </div>
              </div>
              <div className="hidden items-center justify-center xl:flex">
                <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
              </div>
              <div className="flex min-w-[350px] flex-1 flex-col gap-4">
                <div>
                  <div className="my-2 flex flex-row text-xs font-medium">
                    <div>Période de réalisation de la mission</div>
                    <div className="text-gray-400">&nbsp;(facultatif)</div>
                  </div>
                  {/* Script pour passage d'array periode en single value */}
                  <CustomSelect
                    readOnly={!editing}
                    isMulti
                    options={Object.values(PERIOD).map((el) => ({ value: el, label: translate(el) }))}
                    placeholder={"Sélectionnez une ou plusieurs périodes"}
                    onChange={(e) => setValues({ ...values, period: e })}
                    value={values.period}
                  />
                  {(editing || values.subPeriod.length > 0) && values.period.length !== 0 && values.period !== "" && values.period !== "WHENEVER" && (
                    <div className="mt-4">
                      <CustomSelect
                        readOnly={!editing}
                        isMulti
                        options={(() => {
                          const valuesToCheck = values.period;
                          let options = [];
                          if (valuesToCheck?.indexOf(PERIOD.DURING_HOLIDAYS) !== -1) options.push(...Object.keys(MISSION_PERIOD_DURING_HOLIDAYS));
                          if (valuesToCheck?.indexOf(PERIOD.DURING_SCHOOL) !== -1) options.push(...Object.keys(MISSION_PERIOD_DURING_SCHOOL));
                          return options.map((el) => ({ value: el, label: translate(el) }));
                        })()}
                        placeholder={"Sélectionnez une ou plusieurs périodes"}
                        onChange={(e) => setValues({ ...values, subPeriod: e })}
                        value={values.subPeriod}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <div className="my-2 flex flex-col text-xs font-medium">
                    Nombre de volontaire(s) recherché(s). Précisez ce nombre en fonction de vos contraintes logistiques et votre capacité à accompagner les volontaires.
                  </div>
                  <Field
                    name="placesTotal"
                    error={errorsBottom?.placesTotal}
                    readOnly={!editing}
                    isJvaMission={mission?.isJvaMission === "true"}
                    onChange={(placesTotal) => setValues({ ...values, placesTotal })}
                    value={values.placesTotal}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MissionView>
    </div>
  );
}

const CustomSelect = ({ ref = null, onChange, readOnly, options, value, isMulti = false, placeholder, noOptionsMessage = "Aucune option", error, isJvaMission = false }) => {
  return (
    <ReactSelect
      isDisabled={readOnly || isJvaMission}
      ref={ref}
      noOptionsMessage={() => noOptionsMessage}
      styles={{
        dropdownIndicator: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
        placeholder: (styles) => ({ ...styles, color: error ? "red" : "black" }),
        control: (styles) => ({ ...styles, borderColor: "#D1D5DB", backgroundColor: !readOnly && isJvaMission ? "#E5E7EB" : "white" }),
        singleValue: (styles) => ({ ...styles, color: "black" }),
        multiValueRemove: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
        indicatorsContainer: (provided, { isDisabled }) => ({ ...provided, display: isDisabled ? "none" : "flex" }),
      }}
      options={options}
      placeholder={placeholder}
      onChange={(val) => (isMulti ? onChange(val.map((c) => c.value)) : onChange(val))}
      value={isMulti ? options.filter((c) => value.includes(c.value)) : options.find((c) => c.value === value)}
      isMulti={isMulti}
    />
  );
};

const CheckBox = ({ value }) => {
  return (
    <>
      {value ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="16" height="16" rx="8" fill="#2563EB" />
          <circle cx="8" cy="8" r="3" fill="white" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="15" height="15" rx="7.5" fill="white" />
          <rect x="0.5" y="0.5" width="15" height="15" rx="7.5" stroke="#D1D5DB" />
        </svg>
      )}
    </>
  );
};
