import { React, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import ReactSelect from "react-select";
import AsyncSelect from "react-select/async";
import CreatableSelect from "react-select/creatable";
import validator from "validator";

import Field from "@/components/ui/forms/Field";
import Toggle from "@/components/Toggle";
import { MISSION_DOMAINS, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL, PERIOD, ROLES, SENDINBLUE_TEMPLATES, translate } from "snu-lib";
import { ENABLE_PM } from "@/utils";
import VerifyAddress from "../phase0/components/VerifyAddress";

import Breadcrumbs from "@/components/Breadcrumbs";
import ModalConfirm from "@/components/modals/ModalConfirm";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import { BiLoaderAlt } from "react-icons/bi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import ViewStructureLink from "../../components/buttons/ViewStructureLink";
import api from "../../services/api";
import plausibleEvent from "@/services/plausible";

export default function Create(props) {
  const structureIdFromParams = props?.match?.params?.id;
  const urlParams = new URLSearchParams(window.location.search);
  const duplicate = urlParams.get("duplicate");
  const [values, setValues] = useState({
    structureId: structureIdFromParams,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [referents, setReferents] = useState([]);
  const [creationTutor, setCreationTutor] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const { user } = useSelector((state) => state.Auth);
  const [modalConfirmation, setModalConfirmation] = useState(false);
  const [structure, setStructure] = useState(null);

  const [newTutor, setNewTutor] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  const valuesToCheck = ["name", "structureName", "mainDomain", "address", "zip", "city", "description", "actions", "format", "tutorId", "startAt", "endAt"];
  const mainDomainsOption = Object.keys(MISSION_DOMAINS).map((d) => {
    return { value: d, label: translate(d) };
  });

  const history = useHistory();

  const referentSelectRef = useRef();

  async function initContext() {
    if (!values.structureId) return history.push("/mission");

    //init structure
    const { ok, data, code } = await api.get(`/structure/${values.structureId}`);
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération de la structure", translate(code));
    setValues({ ...values, structureName: data.name, structureId: data._id.toString(), isMilitaryPreparation: data.isMilitaryPreparation ? "true" : "false" });
    setStructure(data);

    //init list tutor
    const { responses } = await api.post("/elasticsearch/referent/structure/" + values.structureId);
    if (responses?.length) {
      const responseReferents = responses[0].hits.hits.map((hit) => ({ label: hit._source.firstName + " " + hit._source.lastName, value: hit._id, tutor: hit._source }));
      setReferents(responseReferents);
    }
  }

  const fetchMission = async () => {
    try {
      const { ok, data } = await api.get(`/mission/${duplicate}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération de la mission");
      delete data._id;
      delete data.createdAt;
      delete data.updatedAt;
      delete data.placesLeft;
      delete data.startAt;
      delete data.endAt;
      delete data.status;
      delete data.pendingApplications;
      delete data.isJvaMission;
      setValues(data);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue lors de la récupération de la mission");
    }
  };

  useEffect(() => {
    initContext();
    if (duplicate && structureIdFromParams === values.structureId) fetchMission();
  }, [values.structureId]);

  const fetchStructures = async (inputValue) => {
    const { responses } = await api.post("/elasticsearch/structure/search", { filters: { searchbar: [inputValue] } });
    return responses[0].hits.hits.map((hit) => {
      return { value: hit._source, _id: hit._id, label: hit._source.name, structure: hit._source };
    });
  };

  const onSubmit = () => {
    setLoading(true);
    const error = {};
    const baseError = "Ce champ est obligatoire";
    valuesToCheck.map((val) => {
      if (!values[val]) error[val] = baseError;
    });
    if (!values.addressVerified) error.addressVerified = "L'adresse doit être vérifiée";
    //check duration only if specified
    if (values.duration && isNaN(values.duration)) error.duration = "Le format est incorrect";
    if (!error.tutorId && !referents.find((ref) => ref.value === values.tutorId)) error.tutorId = "Erreur";
    if (values.startAt && values.startAt < new Date() && ![ROLES.ADMIN].includes(user.role)) error.startAt = "La date est incorrecte";
    if (values.startAt > values.endAt) error.endAt = "La date de fin est incorrecte";
    if ((values.startAt && values.endAt && values.placesTotal === "") || isNaN(values.placesTotal) || values.placesTotal < 0)
      error.placesTotal = "Le nombre de places est incorrect";
    setErrors(error);

    if (Object.keys(error).length > 0) {
      if (values.name && values.tutorId && values.structureId && values.addressVerified) setModalConfirmation(true);
      return setLoading(false);
    }
    createMission();
  };

  const createMission = async () => {
    try {
      // build object from array of keys
      values.addressVerified = values?.addressVerified?.toString();
      values.placesLeft = values.placesTotal;
      if (structure.isMilitaryPreparation !== "true") values.isMilitaryPreparation = "false";
      if (Object.keys(errors).length > 0) values.status = "DRAFT";
      else values.status = "WAITING_VALIDATION";
      const { ok, code, data } = await api.post(`/mission`, values);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'enregistrement de la mission", translate(code));
        return setLoading(false);
      }
      plausibleEvent(`Admin/${duplicate ? "Dupliquer" : "Créer"} une mission`);
      toastr.success("Mission enregistrée");
      return history.push(`/mission/${data._id}`);
    } catch (e) {
      setLoading(false);
      return toastr.error("Oups, une erreur est survenue lors de l'enregistrement de la mission");
    }
  };

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
      if (selectedStructure?.isNetwork === "true") {
        newTutor.role = ROLES.SUPERVISOR;
      } else {
        newTutor.role = ROLES.RESPONSIBLE;
      }
      const { ok, code } = await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`, newTutor);
      if (!ok) toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(code));
      setNewTutor({ firstName: "", lastName: "", email: "", phone: "" });
      setCreationTutor(false);
      initContext();
      return toastr.success("Invitation envoyée");
    } catch (e) {
      if (e.code === "USER_ALREADY_REGISTERED")
        return toastr.error("Cette adresse email est déjà utilisée.", `${newTutor.email} a déjà un compte sur cette plateforme.`, { timeOut: 10000 });
      toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(e));
    }
  };

  if (!structure) return null;

  return (
    <>
      <Breadcrumbs items={[{ label: "Missions", to: "/mission" }, { label: "Créer une mission" }]} />
      <div className="flex w-full flex-col px-8 pb-8 pt-2">
        <ModalConfirm
          isOpen={modalConfirmation}
          title={"Êtes-vous sûr(e) de vouloir continuer ?"}
          message={"Certaines informations obligatoires n'ont pas été renseignées. Votre mission sera enregistrée en brouillon."}
          onCancel={() => {
            setModalConfirmation(false);
            setLoading(false);
          }}
          onConfirm={() => {
            setModalConfirmation(false);
            createMission();
          }}
        />
        <div className="flex justify-between items-center gap-2">
          <div className="text-2xl font-bold">Création d’une mission</div>
          <div className="flex  items-center gap-2">
            <button
              className={`h-[38px] w-[150px] flex items-center justify-center gap-2 !rounded-lg bg-white px-3 py-2 text-gray-700 drop-shadow-sm  border-[1px] border-gray-200 text-sm`}
              onClick={() => {
                history.push("/mission");
              }}>
              Annuler
            </button>
            <button
              className={`h-[38px] w-[300px] flex items-center justify-center gap-2 !rounded-lg bg-blue-600 px-3 py-2 text-white drop-shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-blue-600 text-sm`}
              disabled={loading}
              onClick={onSubmit}>
              {loading && <BiLoaderAlt className="h-4 w-4 animate-spin" />}
              Enregistrer et créer cette mission
            </button>
          </div>
        </div>
        <div className="mb-8 rounded-xl bg-white pt-2 mt-8">
          <div className="flex flex-col rounded-xl bg-white px-8 pb-12">
            <div className="my-4 flex items-center justify-between">
              <div className="flex w-full flex-1 flex-row items-center justify-start gap-4">
                <div className="text-lg font-medium text-gray-900">Informations générales</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-14">
              <div className="flex min-w-[350px] flex-1 flex-col gap-4">
                <div>
                  <div className="mb-2 text-xs font-medium">
                    Donnez un nom à votre mission. Privilégiez une phrase précisant l&apos;action du volontaire. Ex : « Je fais les courses de produits pour mes voisins les plus
                    fragiles »
                  </div>
                  <Field name="name" error={errors?.name} onChange={(name) => setValues({ ...values, name })} label="Nom de la mission" value={values.name} />
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-xs font-medium">Structure rattachée</div>
                  <AsyncSelect
                    label="Structure"
                    value={values?.structureName ? { label: values?.structureName } : null}
                    loadOptions={fetchStructures}
                    noOptionsMessage={() => "Aucune structure ne correspond à cette recherche"}
                    styles={{
                      dropdownIndicator: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
                      placeholder: (styles) => ({ ...styles, color: errors.structureName ? "red" : "black" }),
                      control: (styles, { isDisabled }) => ({ ...styles, borderColor: "#D1D5DB", backgroundColor: isDisabled ? "white" : "white" }),
                      singleValue: (styles) => ({ ...styles, color: "black" }),
                      multiValueRemove: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
                      indicatorsContainer: (provided, { isDisabled }) => ({ ...provided, display: isDisabled ? "none" : "flex" }),
                    }}
                    defaultOptions
                    onChange={(e) => {
                      setValues({ ...values, structureName: e.label, structureId: e._id });
                      setSelectedStructure(e.structure);
                    }}
                    placeholder="Rechercher une structure"
                  />
                  {values.structureName && <ViewStructureLink structureId={values.structureId} />}
                </div>
                <div className="mt-4">
                  <div className="mb-2 text-xs font-medium">Domaine d&apos;action principal</div>
                  <CustomSelect
                    noOptionsMessage={"Aucun domaine ne correspond à cette recherche"}
                    options={mainDomainsOption}
                    error={errors?.mainDomain}
                    placeholder={"Sélectionnez un domaine principal"}
                    onChange={(e) => {
                      setValues({ ...values, mainDomain: e.value, domains: values?.domains?.filter((d) => d !== e.value) });
                    }}
                    value={values?.mainDomain}
                  />
                  <div className="my-2 flex flex-row text-xs font-medium">
                    <div>Domaine(s) d&apos;action secondaire(s)</div>
                    <div className="text-gray-400">&nbsp;(facultatif)</div>
                  </div>
                  <CustomSelect
                    isMulti
                    options={mainDomainsOption.filter((d) => d.value !== values.mainDomain)}
                    noOptionsMessage={"Aucun domaine ne correspond à cette recherche"}
                    placeholder={"Sélectionnez un ou plusieurs domaines"}
                    onChange={(e) => {
                      setValues({ ...values, domains: e });
                    }}
                    value={values?.domains?.length ? [...values.domains] : []}
                  />
                </div>
                <div>
                  <div className="mt-8 mb-4 text-lg font-medium text-gray-900">Lieu où se déroule la mission</div>
                  <div className="mb-2 text-xs font-medium">Adresse</div>
                  <Field
                    label="Adresse"
                    name="address"
                    onChange={(address) => {
                      setValues({ ...values, address, addressVerified: false });
                    }}
                    value={values.address}
                    error={errors?.address}
                  />
                  <div className="my-4 flex flex-row justify-between gap-3">
                    <Field
                      label="Code postal"
                      className="w-[50%]"
                      name="zip"
                      onChange={(zip) => setValues({ ...values, zip, addressVerified: false })}
                      value={values.zip}
                      error={errors?.zip}
                    />
                    <Field
                      label="Ville"
                      name="city"
                      className="w-[50%]"
                      onChange={(city) => setValues({ ...values, city, addressVerified: false })}
                      value={values.city}
                      error={errors?.city}
                    />
                  </div>
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
                </div>
                <div>
                  <div className="mt-8 mb-4 text-lg font-medium text-gray-900">Tuteur de la mission</div>
                  <div className="mb-2 text-xs font-medium">
                    Sélectionner le tuteur qui va s&apos;occuper de la mission. Vous pouvez également ajouter un nouveau tuteur à votre équipe.
                  </div>
                  <CreatableSelect
                    options={referents}
                    ref={referentSelectRef}
                    error={errors.tutorId}
                    styles={{
                      dropdownIndicator: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
                      placeholder: (styles) => ({ ...styles, color: errors.tutorId ? "red" : "black" }),
                      control: (styles) => ({ ...styles, borderColor: "#D1D5DB", backgroundColor: "white" }),
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
                  {creationTutor && (
                    <div>
                      <div className="mt-8 mb-4 text-lg font-medium text-gray-900">Créer un tuteur</div>
                      <div className="mb-2 text-xs font-medium">Identité et contact</div>
                      <div className="mb-4 flex flex-row justify-between gap-3">
                        <Field
                          label="Nom"
                          className="w-[50%]"
                          name="lastName"
                          onChange={(lastName) => setNewTutor({ ...newTutor, lastName })}
                          value={newTutor.lastName}
                          error={errors?.lastName}
                        />
                        <Field
                          label="Prénom"
                          name="firstName"
                          className="w-[50%]"
                          onChange={(firstName) => setNewTutor({ ...newTutor, firstName })}
                          value={newTutor.firstName}
                          error={errors?.firstName}
                        />
                      </div>
                      <Field label="Email" name="email" onChange={(email) => setNewTutor({ ...newTutor, email })} value={newTutor.email} error={errors?.email} />
                      <Field
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
                    error={errors?.format}
                    options={formatOptions}
                    placeholder={"Sélectionnez un type de mission"}
                    onChange={(e) => setValues({ ...values, format: e.value })}
                    value={values?.format}
                  />
                </div>
                <div>
                  <div className="mt-2 flex flex-row text-xs font-medium">
                    <div>Durée de la mission</div>
                    <div className="text-gray-400">&nbsp;(facultatif)</div>
                  </div>
                  <div className="mb-2 text-xs font-medium">Saisissez un nombre d&apos;heures prévisionnelles pour la réalisation de la mission</div>
                  <Field error={errors?.duration} name="duration" onChange={(duration) => setValues({ ...values, duration })} label="Heure(s)" value={translate(values.duration)} />
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
                    type="textarea"
                    row={4}
                    onChange={(contraintes) => setValues({ ...values, contraintes })}
                    label="Précisez les informations complémentaires à préciser au volontaire."
                    value={translate(values.contraintes)}
                  />
                </div>
                <div>
                  {ENABLE_PM && structure.isMilitaryPreparation === "true" ? (
                    <div className="flex flex-row items-center justify-between">
                      <div className="font-medium text-gray-800">Préparation Militaire : {values?.isMilitaryPreparation === "true" ? "oui" : "non"}</div>
                      <Toggle
                        id="hebergement"
                        name="hebergement"
                        value={values?.isMilitaryPreparation === "true"}
                        onChange={(e) => {
                          setValues({ ...values, isMilitaryPreparation: e.toString() });
                        }}
                      />
                    </div>
                  ) : null}
                  <div className="mt-8 mb-4 text-lg font-medium text-gray-900">Hébergement</div>
                  <div className="flex flex-row items-center justify-between">
                    <div className="font-medium text-gray-800">Hébergement proposé : {values?.hebergement === "true" ? "oui" : "non"}</div>
                    <Toggle
                      id="hebergement"
                      name="hebergement"
                      value={values?.hebergement === "true"}
                      onChange={(e) => {
                        setValues({ ...values, hebergement: e.toString() });
                      }}
                    />
                  </div>
                  {values?.hebergement === "true" && (
                    <div className="mt-4 flex flex-row gap-8">
                      <div onClick={() => setValues({ ...values, hebergementPayant: "false" })} className={`flex flex-row items-center justify-center gap-2 cursor-pointer}`}>
                        <CheckBox value={values?.hebergementPayant === "false"} />
                        <div className="font-medium text-gray-700">Hébergement gratuit</div>
                      </div>
                      <div onClick={() => setValues({ ...values, hebergementPayant: "true" })} className={`flex flex-row items-center justify-center gap-2  cursor-pointer`}>
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
            </div>
            <div className="flex flex-wrap gap-12">
              <div className="flex min-w-[350px] flex-1 flex-col gap-4">
                <div>
                  <div className="mb-2 text-xs font-medium">Dates de la mission</div>
                  <div className="my-2 flex flex-row justify-between gap-3">
                    <Field
                      name="startAt"
                      label="Date de début"
                      type="date"
                      className="w-[50%]"
                      onChange={(startAt) => setValues({ ...values, startAt })}
                      value={values.startAt}
                      error={errors?.startAt}
                    />
                    <Field
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
                    error={errors?.frequence}
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
                    isMulti
                    options={Object.values(PERIOD).map((el) => ({ value: el, label: translate(el) }))}
                    placeholder={"Sélectionnez une ou plusieurs périodes"}
                    onChange={(e) => {
                      if (e.length === 0 || (e.length === 1 && e[0] === "WHENEVER")) {
                        setValues({ ...values, period: e, subPeriod: [] });
                      } else {
                        setValues({ ...values, period: e });
                      }
                    }}
                    value={values.period}
                  />
                  <div className="mt-4">
                    <CustomSelect
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
                </div>
                <div>
                  <div className="my-2 flex flex-col text-xs font-medium">
                    Nombre de volontaire(s) recherché(s). Précisez ce nombre en fonction de vos contraintes logistiques et votre capacité à accompagner les volontaires.
                  </div>
                  <Field name="placesTotal" error={errors?.placesTotal} onChange={(placesTotal) => setValues({ ...values, placesTotal })} value={values.placesTotal} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center gap-2">
          <button
            className={`h-[38px] w-[150px] flex items-center justify-center gap-2 !rounded-lg bg-white px-3 py-2 text-gray-700 drop-shadow-sm  border-[1px] border-gray-200 text-sm`}
            onClick={() => {
              history.push("/mission");
            }}>
            Annuler
          </button>
          <button
            className={`h-[38px] w-[300px] flex items-center justify-center gap-2 !rounded-lg bg-blue-600 px-3 py-2 text-white drop-shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-blue-600 text-sm`}
            disabled={loading}
            onClick={onSubmit}>
            {loading && <BiLoaderAlt className="h-4 w-4 animate-spin" />}
            Enregistrer et créer cette mission
          </button>
        </div>
      </div>
    </>
  );
}

const CustomSelect = ({ ref = null, onChange, options, value, isMulti = false, placeholder, noOptionsMessage = "Aucune option", error }) => {
  return (
    <ReactSelect
      ref={ref}
      noOptionsMessage={() => noOptionsMessage}
      styles={{
        dropdownIndicator: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
        placeholder: (styles) => ({ ...styles, color: error ? "red" : "black" }),
        control: (styles) => ({ ...styles, borderColor: "#D1D5DB", backgroundColor: "white" }),
        singleValue: (styles) => ({ ...styles, color: "black" }),
        multiValueRemove: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
        indicatorsContainer: (provided, { isDisabled }) => ({ ...provided, display: isDisabled ? "none" : "flex" }),
      }}
      options={options}
      placeholder={placeholder}
      onChange={(val) => (isMulti ? onChange(val.map((c) => c.value)) : onChange(val))}
      value={isMulti ? options.filter((c) => value?.includes(c.value)) : options.find((c) => c.value === value)}
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
