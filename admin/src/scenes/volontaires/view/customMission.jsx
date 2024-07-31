import React, { useEffect, useRef, useState } from "react";
import ReactLoading from "react-loading";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import ReactSelect from "react-select";
import AsyncSelect from "react-select/async";
import CreatableSelect from "react-select/creatable";
import { translateApplication, canApplyToPhase2 } from "snu-lib";
import validator from "validator";
import Toggle from "../../../components/Toggle";
import ViewStructureLink from "../../../components/buttons/ViewStructureLink";
import { adminURL } from "../../../config";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { MISSION_DOMAINS, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL, PERIOD, ROLES, SENDINBLUE_TEMPLATES, translate } from "snu-lib";
import { ENABLE_PM } from "../../../utils";
import Field from "@/components/ui/forms/Field";
import VerifyAddress from "../../phase0/components/VerifyAddress";
import YoungHeader from "../../phase0/components/YoungHeader";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import { useSelector } from "react-redux";

export default function CustomMission({ young, onChange }) {
  const cohortList = useSelector((state) => state.Cohorts);
  const history = useHistory();
  const [values, setValues] = useState({
    status: "VALIDATED",
    structureLegalStatus: "PUBLIC",
    structureId: "",
    structureName: "",
    tutorId: "",
    tutorName: "",
    mainDomain: "",
    domains: [],
    format: "",
    duration: "",
    description: "",
    actions: "",
    contraintes: "",
    startAt: "",
    endAt: "",
    frequence: "",
    subPeriod: [],
    period: [],
    placesTotal: "1",
    applicationStatus: "",
    isMilitaryPreparation: "false",
  });

  const [newTutor, setNewTutor] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [creationTutor, setCreationTutor] = useState(false);
  const [referents, setReferents] = useState([]);
  const [errors, setErrors] = useState({});
  const referentSelectRef = useRef();

  const [loading, setLoading] = useState(false);

  const cohort = cohortList.find((c) => c.name === young.cohort);

  async function initReferents() {
    const { data } = await api.post("/elasticsearch/referent/export", { filters: { structureId: [values.structureId] } });
    if (data?.length) {
      const responseReferents = data.map((hit) => ({ label: hit.firstName + " " + hit.lastName, value: hit._id, tutor: hit }));
      if (!responseReferents.find((ref) => ref.value === values.tutorId)) {
        if (referentSelectRef.current?.select?.select) referentSelectRef.current.select.select.setValue("");
        setValues({ ...values, tutorId: "", tutorName: "" });
      }
      setReferents(responseReferents);
    }
  }
  const mainDomainsOption = Object.keys(MISSION_DOMAINS).map((d) => {
    return { value: d, label: translate(d) };
  });
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
      const { ok, code, data } = await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`, newTutor);
      if (!ok) toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(code));
      setNewTutor({ firstName: "", lastName: "", email: "", phone: "" });
      setValues({ ...values, tutorId: data._id, label: data.firstName + " " + data.lastName });
      setReferents((referents) => [...referents, ...[{ value: data._id, label: data.firstName + " " + data.lastName, tutor: data }]]);
      setCreationTutor(false);
      return toastr.success("Invitation envoyée");
    } catch (e) {
      if (e.code === "USER_ALREADY_REGISTERED")
        return toastr.error("Cette adresse email est déjà utilisée.", `${newTutor.email} a déjà un compte sur cette plateforme.`, { timeOut: 10000 });
      toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(e));
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
  const onSubmit = async () => {
    try {
      setLoading(true);
      const error = {};

      if (!values.name) error.name = "Ce champ est obligatoire";
      if (!values.structureId) error.structureId = "Ce champ est obligatoire";
      if (!values.tutorId) error.tutorId = "Ce champ est obligatoire";
      if (!values.mainDomain) error.mainDomain = "Ce champ est obligatoire";
      if (!values.format) error.format = "Ce champ est obligatoire";
      if (!values.description) error.description = "Ce champ est obligatoire";
      if (!values.address) error.address = "Ce champ est obligatoire";
      if (!values.zip) error.zip = "Ce champ est obligatoire";
      if (!values.city) error.city = "Ce champ est obligatoire";
      if (!values.addressVerified) error.addressVerified = "Veuillez vérifier l'adresse";
      if (!values.startAt) error.startAt = "Ce champ est obligatoire";
      if (!values.endAt) error.endAt = "Ce champ est obligatoire";
      if (!values.actions) error.actions = "Ce champ est obligatoire";
      if (!values.applicationStatus) error.applicationStatus = "Ce champ est obligatoire";

      if (values.duration !== "" && isNaN(values.duration)) error.duration = "Ce champ doit être un nombre";

      if (!values.placesTotal) error.placesTotal = "Ce champ est obligatoire";
      if (isNaN(values.placesTotal)) error.placesTotal = "Ce champ doit être un nombre";

      if (creationTutor) {
        setValues({ ...values, tutorId: "", tutorName: "" });
        referentSelectRef.current.select.select.setValue("");
      }

      setErrors(error);
      if (Object.keys(error).length > 0) {
        toastr.error("Oups, le formulaire est incomplet");
        return setLoading(false);
      }

      plausibleEvent("Volontaires/profil/phase2 CTA - Créer mission personnalisée");

      values.addressVerified = values.addressVerified.toString();
      const responseMission = await api.post("/mission", values);
      if (!responseMission.ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", translate(responseMission.code));

      const application = await handleProposal(responseMission.data, values.applicationStatus);
      toastr.success("Mission enregistrée");
      history.push(`/volontaire/${young._id}/phase2/application/${application._id}/contrat`);
    } catch (e) {
      setLoading(false);
      console.log(e);
      toastr.error("Oups, une erreur est survenue lors de la création de la mission", translate(e));
    }
  };

  const handleProposal = async (mission, status) => {
    const application = {
      status,
      youngId: young._id,
      youngFirstName: young.firstName,
      youngLastName: young.lastName,
      youngEmail: young.email,
      youngBirthdateAt: young.birthdateAt,
      youngCity: young.city,
      youngDepartment: young.department,
      youngCohort: young.cohort,
      missionId: mission._id,
      missionName: mission.name,
      missionDepartment: mission.department,
      missionRegion: mission.region,
      missionDuration: mission.duration,
      structureId: mission.structureId,
      tutorId: mission.tutorId,
      tutorName: mission.tutorName,
    };
    const { ok, code, data } = await api.post(`/application`, application);
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de la candidature", code);
    toastr.success("Candidature ajoutée !", code);
    return data;
  };
  useEffect(() => {
    if (values.structureId) {
      initReferents();
    }
  }, [values.structureId]);
  useEffect(() => {
    if (values.period.length === 0 || (values.period.length === 1 && values.period[0] === "WHENEVER")) {
      setValues({ ...values, subPeriod: [] });
    }
  }, [values.period]);
  useEffect(() => {
    if (creationTutor) {
      setValues({ ...values, tutorId: "", tutorName: "" });
      if (referentSelectRef.current?.select?.select) referentSelectRef.current.select.select.setValue("");
    }
  }, [creationTutor]);

  if (!canApplyToPhase2(young, cohort))
    return (
      <>
        {" "}
        <YoungHeader young={young} tab="phase2" onChange={onChange} />
        <div className="mx-8 my-7 bg-white py-6 px-8">
          <div className="flex items-center">
            <div className="cursor-pointer rounded-full bg-gray-200 p-2 hover:scale-105" onClick={() => history.push(`/volontaire/${young._id}/phase2`)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.83333 13.3334L2.5 10.0001M2.5 10.0001L5.83333 6.66675M2.5 10.0001L17.5 10.0001"
                  stroke="#374151"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-1 justify-center text-3xl font-bold leading-8 tracking-tight">
              Créer une mission personnalisée à {young.firstName} {young.lastName}
            </div>
          </div>
          <div className="mt-8 text-center">Le jeune n&apos;est pas éligible à la phase 2</div>
        </div>
      </>
    );
  return (
    <>
      <YoungHeader young={young} tab="phase2" onChange={onChange} />
      <div className="mx-8 my-7 bg-white py-6 px-8">
        <div className="flex items-center">
          <div className="cursor-pointer rounded-full bg-gray-200 p-2 hover:scale-105" onClick={() => history.push(`/volontaire/${young._id}/phase2`)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5.83333 13.3334L2.5 10.0001M2.5 10.0001L5.83333 6.66675M2.5 10.0001L17.5 10.0001"
                stroke="#374151"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-1 justify-center text-3xl font-bold leading-8 tracking-tight">
            Créer une mission personnalisée à {young.firstName} {young.lastName}
          </div>
        </div>
        <div className="my-7 border-b-[1px] border-[#F3F4F6]" />
        <div className="mb-8 text-lg font-bold">Créer une mission personnalisée</div>

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1">
            <div className="mb-4 text-lg font-medium text-gray-900">Détails de la mission</div>
            <div>
              <div className="mb-2 text-xs font-medium">
                Donnez un nom à votre mission. Privilégiez une phrase précisant l&apos;action du volontaire. <br />
                Exemple : « Je fais les courses de produits pour mes voisins les plus fragiles »
              </div>
              <Field name="name" error={errors?.name} onChange={(name) => setValues({ ...values, name })} label="Nom de la mission" value={values.name} />
            </div>
            <div className="my-5">
              <div className="mb-2 text-xs font-medium">Structure rattachée</div>
              <AsyncSelect
                label="Structure"
                loadOptions={fetchStructures}
                styles={{
                  placeholder: (styles) => ({ ...styles, color: errors.structureId ? "red" : "#6B7280" }),
                }}
                noOptionsMessage={() => {
                  return (
                    <a className="flex cursor-pointer flex-col items-center gap-2 no-underline" href={`${adminURL}/structure/create`} target="_blank" rel="noreferrer">
                      <div className="text-sm text-gray-400">La structure recherchée n&apos;est pas dans la liste ?</div>
                      <div className="text- font-medium text-blue-600">Créer une nouvelle structure</div>
                    </a>
                  );
                }}
                defaultOptions
                onChange={(e) => {
                  setValues({ ...values, structureName: e.label, structureId: e._id, isMilitaryPreparation: "false" });
                  setSelectedStructure(e.structure);
                }}
                placeholder="Rechercher une structure"
              />
              {values.structureId && <ViewStructureLink structureId={values.structureId} className="mt-3" />}
            </div>
            <div className="my-5">
              <div className="mb-2 text-xs font-medium">Domaine d&apos;action principal</div>
              <CustomSelect
                noOptionsMessage={"Aucun domaine ne correspond à cette recherche"}
                options={mainDomainsOption}
                error={errors.mainDomain}
                placeholder={"Sélectionnez un domaine principal"}
                onChange={(e) => {
                  setValues({ ...values, mainDomain: e.value, domains: values.domains.filter((d) => d !== e.value) });
                }}
                value={values.mainDomain}
              />
              <div className="mb-2 mt-3 flex flex-row text-xs font-medium">
                <div>Domaine(s) d&apos;action secondaire(s)</div>
                <div className="text-gray-400">&nbsp;(facultatif)</div>
              </div>
              <CustomSelect
                isMulti
                error={errors.domains}
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
              <div className="mb-2 text-xs font-medium">Type de mission</div>
              <CustomSelect
                error={errors.format}
                options={[
                  { value: "CONTINUOUS", label: translate("CONTINUOUS") },
                  { value: "DISCONTINUOUS", label: translate("DISCONTINUOUS") },
                ]}
                placeholder={"Mission regroupée sur des journées"}
                onChange={(e) => setValues({ ...values, format: e.value })}
                value={values.format}
              />
            </div>
            <div>
              <div className="mt-3 flex flex-row text-xs font-medium">
                <div>Durée de la mission</div>
                <div className="text-gray-400">&nbsp;(facultatif)</div>
              </div>
              <div className="mb-2 text-xs font-medium">Saisissez un nombre d&apos;heures prévisionnelles pour la réalisation de la mission</div>
              <div className="w-1/2">
                <Field error={errors?.duration} name="duration" onChange={(duration) => setValues({ ...values, duration })} label="Heure(s)" value={translate(values.duration)} />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="mt-5">
                <div className="my-2 flex flex-row text-xs font-medium">Objectifs de la mission</div>
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
                <div className="my-2 flex flex-row text-xs font-medium">Actions concrètes confiées au(x) volontaire(s)</div>
                <Field
                  error={errors?.textarea}
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
            </div>
          </div>
          <div className="my-[56px] border-[1px] border-[#F3F4F6] lg:mx-[56px]" />
          <div className="flex-1">
            <div className="mb-4 text-lg font-medium text-gray-900">Dates et places disponibles</div>

            <div className="text-xs font-medium">Dates de la mission</div>
            <div className="my-2 mb-4 flex flex-row justify-between gap-3">
              <Field
                error={errors?.startAt}
                name="startAt"
                label="Date de début"
                type="date"
                className="w-[50%]"
                onChange={(startAt) => setValues({ ...values, startAt })}
                value={values.startAt}
              />
              <Field
                error={errors?.endAt}
                name="endAt"
                label="Date de fin"
                className="w-[50%]"
                type="date"
                onChange={(endAt) => setValues({ ...values, endAt })}
                value={values.endAt}
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
              name="frequence"
              type="textarea"
              row={4}
              onChange={(frequence) => setValues({ ...values, frequence })}
              label="Fréquence estimée de la mission"
              value={values.frequence}
              error={errors?.frequence}
            />
            <div className="mt-4">
              <div className="my-2 flex flex-row text-xs font-medium">
                <div>Période de réalisation de la mission</div>
                <div className="text-gray-400">&nbsp;(facultatif)</div>
              </div>
              <CustomSelect
                isMulti
                options={Object.values(PERIOD).map((el) => ({ value: el, label: translate(el) }))}
                placeholder={"Sélectionnez une ou plusieurs périodes"}
                onChange={(e) => setValues({ ...values, period: e })}
                value={values.period}
                error={errors.period}
              />
              {values.period.length > 0 && (
                <div className="mt-3">
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
                    error={errors.subPeriod}
                  />
                </div>
              )}
            </div>
            <div className="mt-4">
              <div className="my-2 flex flex-col text-xs font-medium">
                Nombre de volontaire(s) recherché(s). Précisez ce nombre en fonction de vos contraintes logistiques et votre capacité à accompagner les volontaires.
              </div>
              <div className="w-1/2">
                <Field name="placesTotal" error={errors?.placesTotal} onChange={(placesTotal) => setValues({ ...values, placesTotal })} value={values.placesTotal} />
              </div>
            </div>

            <div className="mb-4 mt-11 text-lg font-medium text-gray-900">Tuteur de la mission</div>

            <div className="mb-2 text-xs font-medium">
              Sélectionner le tuteur qui va s&apos;occuper de la mission.
              <br /> Vous pouvez également ajouter un nouveau tuteur à votre équipe.
            </div>
            <CreatableSelect
              options={referents}
              ref={referentSelectRef}
              error={errors.tutorId}
              placeholder={"Sélectionnez un tuteur"}
              onChange={(e) => {
                if (!e?.__isNew__ && e) {
                  setValues({ ...values, tutorName: e.label, tutorId: e.value });
                  setCreationTutor(false);
                }
              }}
              styles={{
                placeholder: (styles) => ({ ...styles, color: errors.tutorId ? "red" : "#6B7280" }),
              }}
              formatCreateLabel={() => {
                if (values.structureId === "") return <div>Vous devez d&apos;abord sélectionner une structure</div>;
                return (
                  <div
                    className="flex cursor-pointer flex-col items-center gap-2"
                    onClick={() => {
                      setCreationTutor(true);
                    }}>
                    <div className="text-sm">Le tuteur recherché n&apos;est pas dans la liste ?</div>
                    <div className="font-medium text-blue-600">Ajouter un nouveau tuteur</div>
                  </div>
                );
              }}
              isValidNewOption={() => true}
              value={referents?.find((ref) => ref.value === values.tutorId)}
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
                <Field error={errors?.email} label="Email" name="email" onChange={(email) => setNewTutor({ ...newTutor, email })} value={newTutor.email} />
                <Field label="Téléphone" name="phone" className="my-4" onChange={(phone) => setNewTutor({ ...newTutor, phone })} value={newTutor.phone} error={errors?.phone} />
                <div className="flex w-full justify-end">
                  <div className="inline-block cursor-pointer rounded bg-blue-600 py-2.5 px-4 text-sm font-medium text-white" onClick={sendInvitation}>
                    Envoyer l&apos;invitation
                  </div>
                </div>
              </div>
            )}
            <div className="mb-4 mt-11 text-lg font-medium text-gray-900">Statut de la candidature</div>
            <CustomSelect
              error={errors.applicationStatus}
              options={[
                { value: "DONE", label: translateApplication("DONE") },
                { value: "VALIDATED", label: translateApplication("VALIDATED") },
                { value: "IN_PROGRESS", label: translateApplication("IN_PROGRESS") },
              ]}
              placeholder={"Statut de la candidature"}
              onChange={(e) => setValues({ ...values, applicationStatus: e.value })}
              value={values.applicationStatus}
            />
            <div>
              <div className="mt-11 mb-4 text-lg font-medium text-gray-900">Lieu où se déroule la mission</div>
              <div className="mb-2 text-xs font-medium">Adresse</div>
              <Field
                label="Adresse"
                name="address"
                onChange={(address) => setValues({ ...values, address, addressVerified: false })}
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
              {!values.addressVerified && (
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
            {ENABLE_PM && selectedStructure && selectedStructure?.isMilitaryPreparation === "true" ? (
              <>
                <div className="mt-11 mb-4 text-lg font-medium text-gray-900">Prépartion Militaire</div>
                <div className="flex flex-row items-center justify-between">
                  <div className="font-medium text-gray-800">Prépartion Militaire : {values?.isMilitaryPreparation === "true" ? "oui" : "non"}</div>
                  <Toggle
                    id="isMilitaryPreparation"
                    name="isMilitaryPreparation"
                    value={values?.isMilitaryPreparation === "true"}
                    onChange={(e) => {
                      setValues({ ...values, isMilitaryPreparation: e.toString() });
                    }}
                  />
                </div>
              </>
            ) : null}
            <div>
              <div className="mt-11 mb-4 text-lg font-medium text-gray-900">Hébergement</div>
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
                  <div onClick={() => setValues({ ...values, hebergementPayant: "false" })} className={`flex cursor-pointer flex-row items-center justify-center gap-2`}>
                    <CheckBox value={values?.hebergementPayant === "false"} />
                    <div className="font-medium text-gray-700">Hébergement gratuit</div>
                  </div>
                  <div onClick={() => setValues({ ...values, hebergementPayant: "true" })} className={`flex cursor-pointer flex-row items-center justify-center gap-2`}>
                    <CheckBox value={values.hebergementPayant === "true"} />
                    <div className="font-medium text-gray-700">Hébergement payant</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-11 flex h-[40px] cursor-pointer items-center justify-center rounded bg-blue-600 text-center font-medium text-white" onClick={onSubmit}>
              {loading ? <ReactLoading type="spin" color="white" className="self-center" height={30} width={30} /> : "Enregistrer et rattacher la mission"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const fetchStructures = async (inputValue) => {
  const { responses } = await api.post("/elasticsearch/structure/search", { filters: { searchbar: [inputValue] }, size: 50 });
  return responses[0].hits.hits.map((hit) => {
    return { value: hit._source, _id: hit._id, label: hit._source.name, structure: hit._source };
  });
};
const CustomSelect = ({ ref = null, onChange, options, value, isMulti = false, placeholder, noOptionsMessage = "Aucune option", error }) => {
  return (
    <ReactSelect
      ref={ref}
      noOptionsMessage={() => noOptionsMessage}
      styles={{
        dropdownIndicator: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
        placeholder: (styles) => ({ ...styles, color: error ? "red" : "#6B7280" }),
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
