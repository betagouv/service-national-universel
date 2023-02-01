import React, { useEffect, useState, useRef } from "react";
import YoungHeader from "../../phase0/components/YoungHeader";
import { useHistory } from "react-router-dom";
import api from "../../../services/api";
import {
  ES_NO_LIMIT,
  MISSION_DOMAINS,
  translate,
  PERIOD,
  MISSION_PERIOD_DURING_HOLIDAYS,
  MISSION_PERIOD_DURING_SCHOOL,
  regexPhoneFrenchCountries,
  SENDINBLUE_TEMPLATES,
  ROLES,
} from "../../../utils";
import { adminURL } from "../../../config";
import Field from "../../missions/components/Field";
import AsyncSelect from "react-select/async";
import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";
import validator from "validator";
import VerifyAddress from "../../phase0/components/VerifyAddress";
import { toastr } from "react-redux-toastr";
import Toggle from "../../../components/Toggle";
import plausibleEvent from "../../../services/plausible";
import ReactLoading from "react-loading";

export default function CustomMission({ young, onChange }) {
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
  });
  const [newTutor, setNewTutor] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [creationTutor, setCreationTutor] = useState(false);
  const [referents, setReferents] = useState([]);
  const [errors, setErrors] = useState({});
  const referentSelectRef = useRef();

  const [loading, setLoading] = useState(false);

  async function initReferents() {
    const body = { query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": values.structureId } }] } }, size: ES_NO_LIMIT };
    const { responses } = await api.esQuery("referent", body);
    if (responses?.length) {
      const responseReferents = responses[0].hits.hits.map((hit) => ({ label: hit._source.firstName + " " + hit._source.lastName, value: hit._id, tutor: hit._source }));
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
      if (!validator.matches(newTutor.phone, regexPhoneFrenchCountries)) error.phone = "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX";
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
      initReferents();
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
    initReferents();
  }, [values.structureId]);
  useEffect(() => {
    if (values.period.length === 0 || (values.period.length === 1 && values.period[0] === "WHENEVER")) {
      setValues({ ...values, subPeriod: [] });
    }
  }, [values.period]);
  return (
    <>
      <YoungHeader young={young} tab="phase2" onChange={onChange} />
      <div className="mx-8 my-7 py-6 px-8 bg-white">
        <div className="flex items-center">
          <div className="rounded-full p-2 bg-gray-200 cursor-pointer hover:scale-105" onClick={() => history.push(`/volontaire/${young._id}/phase2`)}>
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
          <div className="flex flex-1 justify-center text-3xl leading-8 font-bold tracking-tight">
            Créer une mission personnalisée à {young.firstName} {young.lastName}
          </div>
        </div>
        <div className="border-b-[1px] border-[#F3F4F6] my-7" />
        <div className="font-bold text-lg mb-8">Créer une mission personnalisée</div>

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1">
            <div className="text-lg font-medium text-gray-900 mb-4">Détails de la mission</div>
            <div>
              <div className="text-xs font-medium mb-2">
                Donnez un nom à votre mission. Privilégiez une phrase précisant l&apos;action du volontaire. <br />
                Exemple : « Je fais les courses de produits pour mes voisins les plus fragiles »
              </div>
              <Field name="name" errors={errors} handleChange={(e) => setValues({ ...values, name: e.target.value })} label="Nom de la mission" value={values.name} />
            </div>
            <div className="my-5">
              <div className="text-xs font-medium mb-2">Structure rattachée</div>
              <AsyncSelect
                label="Structure"
                loadOptions={fetchStructures}
                styles={{
                  placeholder: (styles) => ({ ...styles, color: errors.structureId ? "red" : "#6B7280" }),
                }}
                noOptionsMessage={() => {
                  return (
                    <a className="flex items-center gap-2 flex-col cursor-pointer no-underline" href={`${adminURL}/structure/create`} target="_blank" rel="noreferrer">
                      <div className="text-sm text-gray-400">La structure recherchée n&apos;est pas dans la liste ?</div>
                      <div className="font-medium text-blue-600 text-">Créer une nouvelle structure</div>
                    </a>
                  );
                }}
                defaultOptions
                onChange={(e) => {
                  setValues({ ...values, structureName: e.label, structureId: e._id });
                  setSelectedStructure(e.structure);
                }}
                placeholder="Rechercher une structure"
              />
              {values.structureId && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`${adminURL}/structure/${values.structureId}/edit`}
                  className="inline-block w-full border-[1px] py-2 cursor-pointer text-blue-600 rounded border-blue-600 text-center mt-3">
                  Voir la structure
                </a>
              )}
            </div>
            <div className="my-5">
              <div className="text-xs font-medium mb-2">Domaine d&apos;action principal</div>
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
              <div className="flex flex-row text-xs font-medium mb-2 mt-3">
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
              <div className="text-xs font-medium mb-2">Type de mission</div>
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
              <div className="flex flex-row text-xs font-medium mt-3">
                <div>Durée de la mission</div>
                <div className="text-gray-400">&nbsp;(facultatif)</div>
              </div>
              <div className="text-xs font-medium mb-2">Saisissez un nombre d&apos;heures prévisionnelles pour la réalisation de la mission</div>
              <div className="w-1/2">
                <Field
                  errors={errors}
                  name="duration"
                  handleChange={(e) => setValues({ ...values, duration: e.target.value })}
                  label="Heure(s)"
                  value={translate(values.duration)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="mt-5">
                <div className="flex flex-row text-xs font-medium my-2">Objectifs de la mission</div>
                <Field
                  errors={errors}
                  name="description"
                  type="textarea"
                  row={4}
                  handleChange={(e) => setValues({ ...values, description: e.target.value })}
                  label="Décrivez votre mission"
                  value={translate(values.description)}
                />
              </div>
              <div>
                <div className="flex flex-row text-xs font-medium my-2">Actions concrètes confiées au(x) volontaire(s)</div>
                <Field
                  errors={errors}
                  type="textarea"
                  name="actions"
                  row={4}
                  handleChange={(e) => setValues({ ...values, actions: e.target.value })}
                  label="Listez les actions confiées au(x) volontaires"
                  value={translate(values.actions)}
                />
              </div>
              <div>
                <div className="flex flex-col text-xs font-medium my-2">
                  <div>
                    Contraintes spécifiques pour cette mission
                    <span className="text-gray-400">&nbsp;(facultatif).&nbsp;</span>
                  </div>
                  <div>(conditions physiques, période de formation, mission en soirée...)</div>
                </div>
                <Field
                  type="textarea"
                  row={4}
                  handleChange={(e) => setValues({ ...values, contraintes: e.target.value })}
                  label="Précisez les informations complémentaires à préciser au volontaire."
                  value={translate(values.contraintes)}
                />
              </div>
            </div>
          </div>
          <div className="border-[1px] border-[#F3F4F6] my-[56px] lg:mx-[56px]" />
          <div className="flex-1">
            <div className="text-lg font-medium text-gray-900 mb-4">Dates et places disponibles</div>

            <div className="text-xs font-medium">Dates de la mission</div>
            <div className="flex flex-row justify-between gap-3 my-2 mb-4">
              <Field
                errors={errors}
                name="startAt"
                label="Date de début"
                type="date"
                className="w-[50%]"
                handleChange={(e) => setValues({ ...values, startAt: e })}
                value={values.startAt}
                error={errors?.startAt}
              />
              <Field
                errors={errors}
                label="Date de fin"
                name="endAt"
                className="w-[50%]"
                type="date"
                handleChange={(e) => setValues({ ...values, endAt: e })}
                value={values.endAt}
                error={errors?.endAt}
              />
            </div>
            <div className="flex flex-col text-xs font-medium my-2">
              <div>
                Fréquence estimée de la mission
                <span className="text-gray-400">&nbsp;(facultatif)&nbsp;</span>
                (tous les mardis soirs, le samedi, tous les mercredis après-midi pendant un trimestre...)
              </div>
            </div>
            <Field
              errors={errors}
              name="frequence"
              type="textarea"
              row={4}
              handleChange={(e) => setValues({ ...values, frequence: e.target.value })}
              label="Fréquence estimée de la mission"
              value={values.frequence}
            />
            <div className="mt-4">
              <div className="flex flex-row text-xs font-medium my-2">
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
              <div className="flex flex-col text-xs font-medium my-2">
                Nombre de volontaire(s) recherché(s). Précisez ce nombre en fonction de vos contraintes logistiques et votre capacité à accompagner les volontaires.
              </div>
              <div className="w-1/2">
                <Field name="placesTotal" errors={errors} handleChange={(e) => setValues({ ...values, placesTotal: e.target.value })} value={values.placesTotal} />
              </div>
            </div>

            <div className="text-lg font-medium text-gray-900 mb-4 mt-11">Tuteur de la mission</div>

            <div className="text-xs font-medium mb-2">
              Sélectionner le tuteur qui va s&apos;occuper de la mission.
              <br /> Vous pouvez également ajouter un nouveau tuteur à votre équipe.
            </div>
            <CreatableSelect
              options={referents}
              ref={referentSelectRef}
              error={errors.tutorId}
              placeholder={"Sélectionnez un tuteur"}
              onChange={(e) => {
                setValues({ ...values, tutorName: e.label, tutorId: e.value });
              }}
              styles={{
                placeholder: (styles) => ({ ...styles, color: errors.tutorId ? "red" : "#6B7280" }),
              }}
              formatCreateLabel={() => {
                if (values.structureId === "") return <div>Vous devez d&apos;abord sélectionner une structure</div>;
                return (
                  <div
                    className="flex items-center gap-2 flex-col cursor-pointer"
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
                <div className="text-lg font-medium text-gray-900 mt-8 mb-4">Créer un tuteur</div>
                <div className="text-xs font-medium mb-2">Identité et contact</div>
                <div className="flex flex-row justify-between gap-3 mb-4">
                  <Field
                    errors={errors}
                    label="Nom"
                    className="w-[50%]"
                    name="lastName"
                    handleChange={(e) => setNewTutor({ ...newTutor, lastName: e.target.value })}
                    value={newTutor.lastName}
                    error={errors}
                  />
                  <Field
                    errors={errors}
                    label="Prénom"
                    name="firstName"
                    className="w-[50%]"
                    handleChange={(e) => setNewTutor({ ...newTutor, firstName: e.target.value })}
                    value={newTutor.firstName}
                    error={errors}
                  />
                </div>
                <Field errors={errors} label="Email" name="email" handleChange={(e) => setNewTutor({ ...newTutor, email: e.target.value })} value={newTutor.email} error={errors} />
                <Field
                  errors={errors}
                  label="Téléphone"
                  name="phone"
                  className="my-4"
                  handleChange={(e) => setNewTutor({ ...newTutor, phone: e.target.value })}
                  value={newTutor.phone}
                  error={errors}
                />
                <div className="flex w-full justify-end">
                  <div className="bg-blue-600 rounded text-sm py-2.5 px-4 text-white font-medium inline-block cursor-pointer" onClick={sendInvitation}>
                    Envoyer l&apos;invitation
                  </div>
                </div>
              </div>
            )}
            <div className="text-lg font-medium text-gray-900 mb-4 mt-11">Statut de la candidature</div>
            <CustomSelect
              error={errors.applicationStatus}
              options={[
                { value: "DONE", label: translate("DONE") },
                { value: "VALIDATED", label: translate("VALIDATED") },
                { value: "IN_PROGRESS", label: translate("IN_PROGRESS") },
              ]}
              placeholder={"Statut de la candidature"}
              onChange={(e) => setValues({ ...values, applicationStatus: e.value })}
              value={values.applicationStatus}
            />
            <div>
              <div className="text-lg font-medium text-gray-900 mt-11 mb-4">Lieu où se déroule la mission</div>
              <div className="text-xs font-medium mb-2">Adresse</div>
              <Field
                errors={errors}
                label="Adresse"
                name="address"
                handleChange={(e) => {
                  setValues({ ...values, address: e.target.value, addressVerified: false });
                }}
                value={values.address}
                error={errors?.address}
              />
              <div className="flex flex-row justify-between gap-3 my-4">
                <Field
                  errors={errors}
                  label="Code postal"
                  className="w-[50%]"
                  name="zip"
                  handleChange={(e) => setValues({ ...values, zip: e.target.value, addressVerified: false })}
                  value={values.zip}
                  error={errors?.zip}
                />
                <Field
                  errors={errors}
                  label="Ville"
                  name="city"
                  className="w-[50%]"
                  handleChange={(e) => setValues({ ...values, city: e.target.value, addressVerified: false })}
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
            <div>
              <div className="text-lg font-medium text-gray-900 mt-11 mb-4">Hébergement</div>
              <div className="flex flex-row justify-between items-center">
                <div className="text-gray-800 font-medium">Hébergement proposé : {values?.hebergement === "true" ? "oui" : "non"}</div>
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
                <div className="flex flex-row gap-8 mt-4">
                  <div onClick={() => setValues({ ...values, hebergementPayant: "false" })} className={`flex flex-row justify-center items-center gap-2 cursor-pointer`}>
                    <CheckBox value={values?.hebergementPayant === "false"} />
                    <div className="text-gray-700 font-medium">Hébergement gratuit</div>
                  </div>
                  <div onClick={() => setValues({ ...values, hebergementPayant: "true" })} className={`flex flex-row justify-center items-center gap-2 cursor-pointer`}>
                    <CheckBox value={values.hebergementPayant === "true"} />
                    <div className="text-gray-700 font-medium">Hébergement payant</div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-600 text-white font-medium text-center rounded mt-11 cursor-pointer flex justify-center items-center h-[40px]" onClick={onSubmit}>
              {loading ? <ReactLoading type="spin" color="white" className="self-center" height={30} width={30} /> : "Enregistrer et rattacher la mission"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const fetchStructures = async (inputValue) => {
  const body = {
    query: { bool: { must: [] } },
    size: 50,
    track_total_hits: true,
  };
  if (inputValue) {
    body.query.bool.must.push({
      bool: {
        should: [
          {
            multi_match: {
              query: inputValue,
              fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
              type: "cross_fields",
              operator: "and",
            },
          },
          {
            multi_match: {
              query: inputValue,
              fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
              type: "phrase",
              operator: "and",
            },
          },
          {
            multi_match: {
              query: inputValue,
              fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
              type: "phrase_prefix",
              operator: "and",
            },
          },
        ],
        minimum_should_match: "1",
      },
    });
  }
  const { responses } = await api.esQuery("structure", body);
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
