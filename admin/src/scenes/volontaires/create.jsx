import React, { useEffect, useState } from "react";
import validator from "validator";
import "dayjs/locale/fr";

import { translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { capture } from "../../sentry";
import { useHistory } from "react-router-dom";

import { translateGrade, GRADES, getAge, COHESION_STAY_LIMIT_DATE, ES_NO_LIMIT, YOUNG_STATUS } from "snu-lib";
import { youngSchooledSituationOptions, youngActiveSituationOptions, youngEmployedSituationOptions } from "../phase0/commons";
import dayjs from "dayjs";
import MiniSwitch from "../phase0/components/MiniSwitch";
import RadioButton from "../phase0/components/RadioButton";
import { Spinner } from "reactstrap";

//Identite
import Field from "./components/Field";
import { CniField } from "../phase0/components/CniField";
import SchoolEditor from "../phase0/components/SchoolEditor";
import VerifyAddress from "../phase0/components/VerifyAddress";
import FieldSituationsParticulieres from "../phase0/components/FieldSituationsParticulieres";
import Check from "../../assets/icons/Check";
import PhoneField from "../phase0/components/PhoneField";
import { isPhoneNumberWellFormated, PHONE_ZONES } from "snu-lib/phone-number";
import ConfirmationModal from "../../components/ui/modals/ConfirmationModal";

export default function Create() {
  const history = useHistory();
  const [selectedRepresentant, setSelectedRepresentant] = useState(1);
  const [uploadError, setUploadError] = useState("");
  const [youngId, setYoungId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cohorts, setCohorts] = useState([]);
  const [egibilityError, setEgibilityError] = useState("");
  const [isComplememtaryListModalOpen, setComplememtaryListModalOpen] = useState(false);

  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    birthdateAt: null,
    temporaryDate: null,
    birthCityZip: "",
    birthCity: "",
    gender: "",
    grade: "",
    birthCountry: "",
    filesToUpload: [],
    latestCNIFileExpirationDate: new Date(),
    latestCNIFileCategory: "",
    email: "",
    expirationDate: null,
    phone: "",
    phoneZone: "FRANCE",
    cohort: "",
    parentStatementOfHonorInvalidId: "false",
    addressVerified: false,
    country: "FRANCE",
    zip: "",
    city: "",
    department: "",
    region: "",
    address: "",
    foreignCountry: "",
    foreignZip: "",
    foreignCity: "",
    foreignAddress: "",
    situation: "",
    schoolId: "",
    schoolName: "",
    schoolType: "",
    schoolAddress: "",
    schoolZip: "",
    schoolDepartment: "",
    schoolRegion: "",
    schoolCity: "",
    schoolCountry: "FRANCE",
    schooled: "true",
    employed: "false",
    specificAmenagment: "false",
    specificAmenagmentType: "",
    specificSituations: "",
    reducedMobilityAccess: "false",
    handicapInSameDepartment: "false",
    ppsBeneficiary: "false",
    paiBeneficiary: "false",
    allergies: "false",
    consentment: "false",
    certifyData: "false",
    parentAllowSNU: "",
    parent1Status: "",
    rulesParent1: "false",
    parent1AllowImageRights: "false",
    parent1AllowSNU: "true",
    parent1FirstName: "",
    hostLastName: "",
    hostFirstName: "",
    hostRelationship: "",
    parent1LastName: "",
    parent1Email: "",
    parent1Phone: "",
    parent1PhoneZone: "FRANCE",
    parent1OwnAddress: "false",
    parent1Address: "",
    parent1Zip: "",
    parent1City: "",
    parent1Country: "",
    parent2Status: "",
    parent2AllowImageRights: "false",
    parent2FirstName: "",
    parent2LastName: "",
    parent2Email: "",
    parent2Phone: "",
    parent2PhoneZone: "FRANCE",
    parent2OwnAddress: "false",
    parent2Address: "",
    parent2Zip: "",
    parent2City: "",
    parent2Country: "",
  });

  const cohort = cohorts.find(({ name }) => name === values?.cohort);

  const validate = () => {
    const errors = {};
    const errorEmpty = "Ne peut être vide";
    const errorEmail = "Adresse email invalide";
    const errorPhone = "Numéro de téléphone invalide";
    const required = [
      "firstName",
      "lastName",
      "birthCityZip",
      "birthCity",
      "gender",
      "birthCountry",
      "department",
      "region",
      "phone",
      "cohort",
      "parentStatementOfHonorInvalidId",
      "parent1Status",
      "parent1LastName",
      "parent1FirstName",
      "situation",
      "address",
      "city",
      "zip",
    ];
    for (const key of required) {
      if (values[key] === null || !values[key] || validator.isEmpty(values[key], { ignore_whitespace: true })) {
        errors[key] = errorEmpty;
      }
    }

    if (values.temporaryDate === null) {
      errors.temporaryDate = errorEmpty;
    }
    if (values.latestCNIFileExpirationDate === "" || values.latestCNIFileExpirationDate === null) {
      errors.latestCNIFileExpirationDate = errorEmpty;
    }
    // check email volontaire
    if (!validator.isEmail(values.email)) {
      errors.email = errorEmail;
    }
    if (!validator.isMobilePhone(values.phone)) {
      errors.phone = errorPhone;
    }
    if (!values.phone || !isPhoneNumberWellFormated(values.phone, values.phoneZone || "AUTRE")) {
      errors.phone = PHONE_ZONES[values.phoneZone || "AUTRE"].errorMessage;
    }
    // Check parent 1
    if (!validator.isEmail(values.parent1Email)) {
      errors.parent1Email = errorEmail;
    }

    if (!values.parent1Phone || !isPhoneNumberWellFormated(values.parent1Phone, values.parent1PhoneZone || "AUTRE")) {
      errors.parent1Phone = PHONE_ZONES[values.parent1PhoneZone || "AUTRE"].errorMessage;
    }
    //check parent2 if exist
    const parent2FirstNameEmpty = validator.isEmpty(values.parent2FirstName);
    const parent2LastNameEmpty = validator.isEmpty(values.parent2LastName);
    const parent2StatusEmpty = validator.isEmpty(values.parent2Status);
    const parent2Phone = validator.isEmpty(values.parent2Phone);
    // if 1 of 3 is not empty --> ask for the 3
    if (values.parent2Email !== "" || !parent2FirstNameEmpty || !parent2LastNameEmpty || !parent2StatusEmpty || !parent2Phone) {
      let foundError = false;
      if (!validator.isEmail(values.parent2Email)) {
        errors.parent2Email = errorEmail;
        foundError = true;
      }
      if (!values.parent2Phone || !isPhoneNumberWellFormated(values.parent2Phone, values.parent2PhoneZone || "AUTRE")) {
        errors.parent2Phone = PHONE_ZONES[values.parent1PhoneZone || "AUTRE"].errorMessage;
        foundError = true;
      }
      if (parent2FirstNameEmpty) {
        errors.parent2FirstName = errorEmpty;
        foundError = true;
      }
      if (parent2LastNameEmpty) {
        errors.parent2LastName = errorEmpty;
        foundError = true;
      }
      if (parent2StatusEmpty) {
        errors.parent2Status = errorEmpty;
        foundError = true;
      }
      if (foundError) {
        setSelectedRepresentant(2);
      } else {
        setSelectedRepresentant(1);
      }
    } else {
      setSelectedRepresentant(1);
    }
    if (values.specificAmenagment === "true" && values.specificAmenagmentType === "") {
      errors.specificAmenagmentType = errorEmpty;
    }
    // permet de vérifier si l'adresse a été entièrement remplie mais pas vérifiée
    if (!(errors.address || errors.city || errors.zip)) {
      if (values.department === "" || values.region === "") {
        toastr.error("Vous devez vérifier l'adresse");
      }
    }
    if (values.parent1OwnAddress === "true") {
      const requiredParentAdress = ["parent1Address", "parent1Zip", "parent1City", "parent1Country"];
      for (const key of requiredParentAdress) {
        if (!values[key] || validator.isEmpty(values[key], { ignore_whitespace: true }) || values[key] === null) {
          errors[key] = errorEmpty;
        }
      }
    }
    //Check foreignCountry / host
    if (values.country !== "FRANCE") {
      const foreignRequired = ["foreignAddress", "foreignCountry", "foreignCity", "foreignZip", "hostFirstName", "hostLastName", "hostRelationship"];
      for (const key of foreignRequired) {
        if (values[key] === null || !values[key] || validator.isEmpty(values[key], { ignore_whitespace: true })) {
          errors[key] = errorEmpty;
        }
      }
    }

    //
    if (values.schooled === "true") {
      if (values.schoolCountry === "FRANCE") {
        if (validator.isEmpty(values.schoolCity) || validator.isEmpty(values.schoolName) || validator.isEmpty(values.grade)) {
          errors.schooled = "missing";
          toastr.error("Des informations sont manquantes au niveau de l'établissement");
        }
      } else {
        if (validator.isEmpty(values.schoolCountry) || validator.isEmpty(values.schoolName) || validator.isEmpty(values.grade)) {
          errors.schooled = "missing";
          toastr.error("Des informations sont manquantes au niveau de l'établissement");
        }
      }
    }
    // consentement check
    if (values.parent1AllowSNU === "false") {
      errors.parent1AllowSNU = errorEmpty;
    }
    if (values.acceptCGU === "false") {
      errors.acceptCGU = errorEmpty;
    }
    if (values.consentment === "false") {
      errors.consentment = errorEmpty;
    }
    if (values.certifyData === "false") {
      errors.certifyData = errorEmpty;
    }
    if (values.parentAllowSNU === "false" || values.parentAllowSNU === "") {
      errors.parentAllowSNU = errorEmpty;
    }
    if (values.rulesParent1 === "false") {
      errors.rulesParent1 = errorEmpty;
    }

    if (values.filesToUpload.length === 0) {
      errors.filesToUpload = errorEmpty;
      toastr.error("Vous devez ajouter une pièce d'identité");
    }
    if (validator.isEmpty(values.latestCNIFileCategory)) {
      errors.latestCNIFileCategory = errorEmpty;
      toastr.error("Vous devez spécifier une catégorie pour le document d'identité");
    }
    if (Object.keys(errors).length > 0) {
      console.log(errors);
      toastr.error("Le formulaire n'est pas complet");
    }
    return errors;
  };

  const uploadFiles = async (id, filesToUpload, latestCNIFileCategory, latestCNIFileExpirationDate) => {
    setLoading(true);
    const res = await api.uploadFiles(`/young/${id}/documents/cniFiles`, Array.from(filesToUpload), {}, latestCNIFileCategory, latestCNIFileExpirationDate);
    if (res.code === "FILE_CORRUPTED") {
      setUploadError(
        "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
      );
      setLoading(false);
      return "err";
    }
    if (!res.ok) {
      capture(res.code);
      setLoading(false);
      setUploadError("Une erreur s'est produite lors du téléversement de votre fichier.");
      return "err";
    }
    setLoading(false);
    toastr.success("Volontaire créé !");
    return history.push(`/volontaire/${id}`);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const setFieldValue = (key, value) => {
    setValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  const handleSubmit = async () => {
    const receivedErrors = validate();
    setErrors(receivedErrors);
    if (Object.keys(receivedErrors).length !== 0) return;
    const res = await api.get(`/inscription-goal/${cohort?.name}/department/${values.department}`);
    if (!res.ok) throw new Error(res);
    const fillingRate = res.data;
    if (fillingRate >= 1.05) {
      setComplememtaryListModalOpen(true);
    } else {
      sendData();
    }
  };

  const sendData = async (status = YOUNG_STATUS.WAITING_VALIDATION) => {
    try {
      setLoading(true);
      values.addressVerified = values.addressVerified.toString();
      // necessaire ?
      delete values.certifyData;
      const { ok, code, young } = await api.post("/young/invite", { ...values, status });
      if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
      const res = await uploadFiles(young._id, values.filesToUpload, values.latestCNIFileCategory, values.latestCNIFileExpirationDate);
      setYoungId(young._id);
      if (res === "err") return toastr.error("Une erreur s'est produite avec le téléversement de vos fichiers");
    } catch (e) {
      setLoading(false);
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant la création du volontaire :", translate(e.code));
    }
  };

  React.useEffect(() => {
    if (!values.temporaryDate) return;
    setFieldValue("birthdateAt", dayjs(values.temporaryDate).locale("fr").format("YYYY-MM-DD"));
  }, [values.temporaryDate]);

  React.useEffect(() => {
    if ((values.grade !== "" || values.schooled === "false") && (values.department !== "" || values.schoolDepartment !== "") && values.birthdateAt !== null) {
      (async () => {
        try {
          let body = {};
          if (values.schooled === "true") {
            body = {
              schoolDepartment: values.schoolDepartment,
              department: values.department,
              schoolRegion: values.schoolRegion,
              birthdateAt: values.birthdateAt,
              grade: values.grade,
              zip: values.zip,
            };
          } else {
            body = {
              grade: values.grade,
              birthdateAt: values.birthdateAt,
              zip: values.zip,
            };
          }
          const res = await api.post("/cohort-session/eligibility/2023", body);
          if (res.data.msg) return setEgibilityError(res.data.msg);
          if (res.data.length === 0) {
            setEgibilityError("Il n'y a malheureusement plus de place dans votre département.");
          } else {
            setEgibilityError("");
          }
          setCohorts(res.data);
        } catch (e) {
          capture(e);

          setCohorts([]);
        }
        setLoading(false);
      })();
    } else {
      setEgibilityError("");
      setCohorts([]);
    }
  }, [values.schoolDepartment, values.department, values.schoolRegion, values.region, values.grade, values.birthdateAt]);

  return (
    <div className="py-4 px-8">
      <ConfirmationModal
        isOpen={isComplememtaryListModalOpen}
        title={
          <span>
            L&apos;objectif d&apos;inscription de votre département a été atteint à 105%. Le dossier d&apos;inscription de {values.firstName} {values.lastName} va être{" "}
            <strong className="text-bold">validé sur liste complémentaire</strong>.
          </span>
        }
        message="Souhaitez-vous confirmer l'action ?"
        onClose={() => {
          setComplememtaryListModalOpen(false);
        }}
        onConfirm={() => sendData(YOUNG_STATUS.WAITING_LIST)}
      />
      <div className="relative mb-4 rounded bg-white pt-4 shadow">
        <div className="flex items-center justify-center text-2xl font-bold">Créer une inscription manuellement</div>
        <div className="mx-9 mb-5 mt-6 border-b" />
        <div className="ml-8 mb-6 text-lg font-normal">Informations générales</div>
        <div className={"flex pb-14"}>
          <div className="flex-[1_0_50%] pr-14 pl-8">
            <Identite values={values} handleChange={handleChange} errors={errors} setFieldValue={setFieldValue} cohort={cohort} />
          </div>
          <div className="my-16 flex-[0_0_1px] bg-[#E5E7EB]" />
          <div className="flex-[1_0_50%] pl-14 pr-8">
            <Coordonnees values={values} handleChange={handleChange} errors={errors} setFieldValue={setFieldValue} />
          </div>
        </div>
      </div>
      <div className="relative mb-4 rounded bg-white pt-4 shadow">
        <div className="ml-8 mb-6 text-lg font-normal">Détails</div>
        <div className={"flex pb-14"}>
          <div className="flex-[1_0_50%] pl-8 pr-14">
            <Situation values={values} handleChange={handleChange} required={{ situation: true }} errors={errors} setFieldValue={setFieldValue} />
          </div>
          <div className="my-16 flex-[0_0_1px] bg-[#E5E7EB]" />
          <div className="flex-[1_0_50%] pl-14 pr-8">
            <div className="ml-5 mb-4 flex items-start justify-start">
              <div onClick={() => setSelectedRepresentant(1)} className={`cursor-pointer pb-4 ${selectedRepresentant === 1 && "border-b-4 text-[#3B82F6]"} mr-9 border-[#3B82F6]`}>
                Représentant légal 1
              </div>
              <div onClick={() => setSelectedRepresentant(2)} className={`cursor-pointer pb-4 ${selectedRepresentant === 2 && "border-b-4 text-[#3B82F6]"} mr-9 border-[#3B82F6]`}>
                Représentant légal 2
              </div>
            </div>
            {selectedRepresentant === 1 ? (
              <Representant parent="1" values={values} errors={errors} handleChange={handleChange} setFieldValue={setFieldValue} />
            ) : (
              <Representant parent="2" values={values} errors={errors} handleChange={handleChange} setFieldValue={setFieldValue} />
            )}
          </div>
        </div>
      </div>

      {(cohorts.length > 0 || egibilityError !== "") && (
        <div className="relative mb-4 rounded bg-white pt-4 shadow">
          <div className="ml-8 text-lg font-normal">Choisissez un séjour pour le volontaire</div>
          {egibilityError !== "" && <div className="ml-8 pb-4">{egibilityError}</div>}
          <div className="flex flex-row flex-wrap justify-start px-3">
            {egibilityError === "" &&
              cohorts.map((session) => (
                <div
                  key={session.name}
                  onClick={() => setFieldValue("cohort", session.name)}
                  className="m-3 flex h-14 w-60 cursor-pointer flex-row items-center justify-start rounded-md border border-[#3B82F6]">
                  <input
                    className="mx-3 rounded-full"
                    type="radio"
                    id="checkboxCohort"
                    name="cohort"
                    checked={session.name === values.cohort}
                    onChange={() => setFieldValue("cohort", session.name)}
                  />
                  <div>{session.name}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {values.firstName !== "" &&
        values.lastName !== "" &&
        values.parent1FirstName !== "" &&
        values.parent1LastName !== "" &&
        values.parent1Email !== "" &&
        values.parent1Status !== "" &&
        values.temporaryDate !== null &&
        cohorts.length > 0 &&
        egibilityError === "" && (
          <div className="relative mb-4 rounded bg-white pt-4 shadow">
            <div className="ml-8 mb-6 text-lg font-normal">Consentements</div>
            <div className={"flex px-8 pb-14"}>
              <SectionConsentements young={values} setFieldValue={setFieldValue} errors={errors} />
            </div>
          </div>
        )}
      {egibilityError === "" && (
        <div className="w-100 flex items-center justify-center">
          {uploadError === "" ? (
            <div onClick={handleSubmit} className="w-80 cursor-pointer self-center rounded-md bg-[#2563EB] py-2 px-4 text-center text-white">
              {!loading ? "Créer l'inscription" : <Spinner size="sm" style={{ borderWidth: "0.1em", color: "white" }} />}
            </div>
          ) : (
            <div className="flex-column flex">
              <div>{uploadError}</div>
              <div
                onClick={() => uploadFiles(youngId, values.filesToUpload, values.latestCNIFileCategory, values.latestCNIFileExpirationDate)}
                className="w-80 cursor-pointer self-center rounded-md bg-[#2563EB] py-2 px-4 text-center text-white">
                {!loading ? "Réessayer de téleverser les fichiers" : <Spinner size="sm" style={{ borderWidth: "0.1em", color: "white" }} />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function Representant({ values, handleChange, errors, setFieldValue, parent }) {
  const handlePhoneChange = (name) => (value) => {
    handleChange({
      target: {
        name,
        value,
      },
    });
  };

  return (
    <>
      <Field
        name={parent === "1" ? "parent1Status" : "parent2Status"}
        label="Statut"
        errors={errors}
        type="select"
        value={parent === "1" ? values.parent1Status : values.parent2Status}
        options={[
          { value: "mother", label: "Mère" },
          { value: "father", label: "Père" },
          { value: "representant", label: "Représentant légal" },
        ]}
        transformer={translate}
        className="mb-4"
        handleChange={setFieldValue}
      />
      <div className="mb-4 flex items-start justify-between">
        <Field
          name={parent === "1" ? "parent1LastName" : "parent2LastName"}
          label="Nom"
          errors={errors}
          value={parent === "1" ? values.parent1LastName : values.parent2LastName}
          transformer={translate}
          className="mr-2 flex-[1_1_50%]"
          handleChange={handleChange}
        />
        <Field
          name={parent === "1" ? "parent1FirstName" : "parent2FirstName"}
          label="Prénom"
          errors={errors}
          value={parent === "1" ? values.parent1FirstName : values.parent2FirstName}
          transformer={translate}
          className="flex-[1_1_50%]"
          handleChange={handleChange}
        />
      </div>
      <Field
        name={parent === "1" ? "parent1Email" : "parent2Email"}
        label="Email"
        errors={errors}
        value={parent === "1" ? values.parent1Email : values.parent2Email}
        transformer={translate}
        className="mb-4"
        handleChange={handleChange}
      />
      <PhoneField
        name={`parent${parent}Phone`}
        mode="edition"
        error={errors[`parent${parent}Phone`]}
        value={values[`parent${parent}Phone`]}
        placeholder={PHONE_ZONES[values[`parent${parent}PhoneZone`]]?.example}
        zoneValue={values[`parent${parent}PhoneZone`]}
        onChange={handlePhoneChange(`parent${parent}Phone`)}
        onChangeZone={handlePhoneChange(`parent${parent}PhoneZone`)}
      />
      <Field
        name={parent === "1" ? "parent1OwnAddress" : "parent2OwnAddress"}
        label="Adresse différente de celle du volontaire"
        errors={errors}
        type="select"
        value={parent === "1" ? values.parent1OwnAddress : values.parent2OwnAddress}
        options={[
          { value: "true", label: "Oui" },
          { value: "false", label: "Non" },
        ]}
        transformer={translate}
        className="mb-4"
        handleChange={setFieldValue}
      />
      {(parent === "1" ? values.parent1OwnAddress : values.parent2OwnAddress) === "true" && (
        <>
          <div className="mb-2 text-xs font-medium leading-snug text-[#242526]">Adresse</div>
          <Field
            name={parent === "1" ? "parent1Address" : "parent2Address"}
            label="Adresse"
            errors={errors}
            value={parent === "1" ? values.parent1Address : values.parent2Address}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <div className="my-4 flex items-start justify-between">
            <Field
              name={parent === "1" ? "parent1Zip" : "parent2Zip"}
              label="Code postal"
              errors={errors}
              value={parent === "1" ? values.parent1Zip : values.parent2Zip}
              transformer={translate}
              className="mr-2 flex-[1_1_50%]"
              handleChange={handleChange}
            />
            <Field
              name={parent === "1" ? "parent1City" : "parent2City"}
              label="Ville"
              errors={errors}
              value={parent === "1" ? values.parent1City : values.parent2City}
              transformer={translate}
              className="flex-[1_1_50%]"
              handleChange={handleChange}
            />
          </div>
          <Field
            name={parent === "1" ? "parent1Country" : "parent2Country"}
            label="Pays"
            errors={errors}
            value={parent === "1" ? values.parent1Country : values.parent2Country}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
        </>
      )}
    </>
  );
}

function Situation({ values, handleChange, errors, setFieldValue }) {
  const onChange = (e) => {
    for (const key in e) {
      if (e[key] !== values[key]) {
        setFieldValue(key, e[key]);
      }
    }
  };
  const onChangeSituation = (key, value) => {
    setFieldValue("employed", youngEmployedSituationOptions.includes(value) ? "true" : "false");
    setFieldValue("situation", value);
  };

  const onChangeGrade = (key, value) => {
    const isSchooled = value !== "NOT_SCOLARISE";
    setFieldValue("schooled", isSchooled ? "true" : "false");
    setFieldValue("grade", value);
    setFieldValue("situation", "");
    onChange({
      schoolId: "",
      schoolName: "",
      schoolType: "",
      schoolAddress: "",
      schoolZip: "",
      schoolDepartment: "",
      schoolRegion: "",
      schoolCity: "",
      schoolCountry: "FRANCE",
    });
  };

  const gradeOptions = Object.keys(GRADES).map((g) => ({ value: g, label: translateGrade(g) }));
  const onParticuliereChange = (key, value) => {
    setFieldValue(key, value);
  };

  return (
    <>
      <div className="mb-2 text-xs font-medium leading-snug text-[#242526]">Situation</div>

      <Field
        name="grade"
        label="Classe"
        type="select"
        errors={errors}
        value={values.grade}
        transformer={translate}
        className="flex-[1_1_50%]"
        options={gradeOptions}
        handleChange={onChangeGrade}
      />
      {values.schooled !== "" && (
        <Field
          name="situation"
          label="Statut"
          type="select"
          errors={errors}
          value={values.situation}
          transformer={translate}
          className="mt-4 flex-[1_1_50%]"
          options={values.schooled === "true" ? youngSchooledSituationOptions : youngActiveSituationOptions}
          handleChange={onChangeSituation}
        />
      )}

      {values.situation !== "" && values.schooled === "true" && (
        <div className="mt-4">
          <SchoolEditor showBackgroundColor={false} young={values} onChange={onChange} />
        </div>
      )}
      <div className="mt-8">
        <div className="mt-8 mb-2 text-xs font-medium leading-snug text-[#242526]">Situations particulières</div>
        <FieldSituationsParticulieres name="specificSituations" young={values} mode={"edition"} onChange={onParticuliereChange} />
        {values.specificAmenagment === "true" && (
          <Field
            name="specificAmenagmentType"
            label="Nature de l'aménagement spécifique"
            errors={errors}
            value={values.specificAmenagmentType}
            mode="edition"
            handleChange={handleChange}
          />
        )}
      </div>
    </>
  );
}
function Coordonnees({ values, handleChange, setFieldValue, errors }) {
  const [liveInFrance, setLiveInFrance] = React.useState(true);

  React.useEffect(() => {
    loadCountries();
  }, []);

  const hostRelationshipOptions = [
    { label: "Parent", value: "Parent" },
    { label: "Frère/Soeur", value: "Frere/Soeur" },
    { label: "Grand-parent", value: "Grand-parent" },
    { label: "Oncle/Tante", value: "Oncle/Tante" },
    { label: "Ami de la famille", value: "Ami de la famille" },
    { label: "Autre", value: "Autre" },
  ];
  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setFieldValue("addressVerified", isConfirmed);
    for (const key in suggestion) {
      if (suggestion[key] !== values[key]) {
        if (key === "address" || key === "zip" || key === "city") {
          if (isConfirmed) {
            setFieldValue(key, suggestion[key]);
          }
        } else {
          setFieldValue(key, suggestion[key]);
        }
      }
    }
  };
  const handleAdressChange = (e) => {
    setFieldValue("addressVerified", false);
    handleChange(e);
  };
  const handleCountryChange = (e) => {
    setLiveInFrance(e);
    if (e) {
      setFieldValue("country", "FRANCE");
    } else {
      setFieldValue("country", "");
    }
  };
  const [countries, setCountries] = React.useState([]);
  async function loadCountries() {
    const { responses } = await api.post("/elasticsearch/schoolramses/public/search?aggsByCountries=true");
    if (responses && responses.length > 0) {
      setCountries(
        responses[0].aggregations.countries.buckets
          .filter((e) => e.key !== "FRANCE")
          .map((e) => e.key)
          .sort(),
      );
    }
  }
  return (
    <>
      <div className="mb-2 text-xs font-medium leading-snug text-[#242526]">Date et lieu de naissance</div>
      <Field
        name="temporaryDate"
        label="Date de naissance"
        type="date"
        errors={errors}
        value={values.temporaryDate}
        transformer={translate}
        className="mb-4"
        setFielValue={setFieldValue}
      />
      <div className="mb-4 flex items-start justify-between">
        <Field
          name="birthCity"
          label="Ville de naissance"
          errors={errors}
          value={values.birthCity}
          transformer={translate}
          className="mr-2 flex-[1_1_50%]"
          handleChange={handleChange}
        />
        <Field
          name="birthCityZip"
          label="Code postal de naissance"
          errors={errors}
          value={values.birthCityZip}
          transformer={translate}
          className="flex-[1_1_50%]"
          handleChange={handleChange}
        />
      </div>
      <Field
        name="birthCountry"
        label="Pays de naissance"
        errors={errors}
        value={values.birthCountry}
        transformer={translate}
        className="flex-[1_1_50%]"
        handleChange={handleChange}
      />
      <div className="mt-8 mb-2 flex items-center justify-between">
        <div className="text-xs font-medium leading-snug text-[#242526]">Adresse</div>
        <div className="inline-flex">
          <div
            className={`rounded-[100px_0_0_100px] border-[1px] border-[#3B82F6] px-[10px] py-[3px] text-[14px] ${
              liveInFrance ? "bg-[#3B82F6] text-[#FFFFFF]" : "cursor-pointer bg-[#FFFFFF] text-[#3B82F6]"
            }`}
            onClick={() => handleCountryChange(true)}>
            en France
          </div>
          <div
            className={`ml-[-1px] rounded-[0_100px_100px_0] border-[1px] border-[#3B82F6] px-[10px] py-[3px] text-[14px] ${
              !liveInFrance ? "bg-[#3B82F6] text-[#FFFFFF]" : "cursor-pointer bg-[#FFFFFF] text-[#3B82F6]"
            }`}
            onClick={() => handleCountryChange(false)}>
            à l&apos;étranger
          </div>
        </div>
      </div>
      <Field
        name={liveInFrance ? "address" : "foreignAddress"}
        label="Adresse"
        errors={errors}
        value={liveInFrance ? values.address : values.foreignAddress}
        transformer={translate}
        className="mb-4"
        handleChange={handleAdressChange}
      />
      {!liveInFrance && (
        <Field
          name="foreignCountry"
          type="select"
          options={countries ? countries.map((c) => ({ value: c, label: c })) : []}
          label="Pays"
          errors={errors}
          filterOnType
          value={values.foreignCountry}
          transformer={translate}
          className="mb-4"
          handleChange={setFieldValue}
        />
      )}
      <div className="mb-4 flex items-start justify-between">
        <Field
          name={liveInFrance ? "zip" : "foreignZip"}
          label="Code postal"
          errors={errors}
          value={liveInFrance ? values.zip : values.foreignZip}
          transformer={translate}
          className="mr-2 flex-[1_1_50%]"
          handleChange={handleAdressChange}
        />
        <Field
          name={liveInFrance ? "city" : "foreignCity"}
          label="Ville"
          errors={errors}
          value={liveInFrance ? values.city : values.foreignCity}
          transformer={translate}
          className="flex-[1_1_50%]"
          handleChange={handleAdressChange}
        />
      </div>
      {liveInFrance ? (
        <VerifyAddress
          address={values.address}
          zip={values.zip}
          city={values.city}
          onSuccess={onVerifyAddress(true)}
          onFail={onVerifyAddress()}
          fromInscription
          verifyButtonText="Vérifier l'adresse"
          verifyText="Pour vérifier l'adresse vous devez remplir les champs adresse de résidence, code postal et ville."
          isVerified={values.addressVerified}
          buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
        />
      ) : (
        <>
          <h2 className="text-[16px] font-bold">Mon hébergeur</h2>
          <div className="my-3 flex">
            <div className="flex w-[40px] min-w-[40px] items-center justify-center bg-[#0063CB]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.5 0.499512H2.5C1.39543 0.499512 0.5 1.39494 0.5 2.49951V17.4995C0.5 18.6041 1.39543 19.4995 2.5 19.4995H17.5C18.6046 19.4995 19.5 18.6041 19.5 17.4995V2.49951C19.5 1.39494 18.6046 0.499512 17.5 0.499512ZM11 4.99951H9V6.99951H11V4.99951ZM11 8.99951H9V14.9995H11V8.99951Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="border-2 border-[#0063CB] p-3 text-justify  text-[#3A3A3A] shadow-sm">
              Proche chez qui vous séjournerez le temps de la réalisation de votre SNU (lieu de départ/retour pour le séjour et de réalisation de la MIG).
            </div>
          </div>
          <p className="text-justify text-[14px] leading-tight text-[#666666]">
            À noter : l’hébergement chez un proche en France ainsi que le transport entre votre lieu de résidence et celui de votre hébergeur sont à votre charge.
          </p>
          <div className="my-4 flex items-start justify-between">
            <Field className="mr-2 flex-[1_1_50%]" name="hostFirstName" value={values.hostFirstName} label="Prénom de l’hébergeur" handleChange={handleChange} errors={errors} />
            <Field className="flex-[1_1_50%]" name="hostLastName" value={values.hostLastName} label="Nom de l’hébergeur" handleChange={handleChange} errors={errors} />
          </div>
          <Field
            options={hostRelationshipOptions}
            name="hostRelationship"
            value={values.hostRelationship}
            type="select"
            label="Précisez votre lien avec l’hébergeur"
            className="mb-4"
            handleChange={setFieldValue}
            errors={errors}
          />
          <Field value={values.address} name="address" label="Son adresse" handleChange={handleAdressChange} errors={errors} />
          <div className="my-4 flex items-start justify-between">
            <Field name="zip" label="Code postal" errors={errors} value={values.zip} transformer={translate} className="mr-2 flex-[1_1_50%]" handleChange={handleAdressChange} />
            <Field name="city" label="Ville" errors={errors} value={values.city} transformer={translate} className="flex-[1_1_50%]" handleChange={handleAdressChange} />
          </div>
          <VerifyAddress
            address={values.address}
            zip={values.zip}
            city={values.city}
            onSuccess={onVerifyAddress(true)}
            onFail={onVerifyAddress()}
            fromInscription
            verifyButtonText="Vérifier l'adresse"
            verifyText="Pour vérifier l'adresse vous devez remplir les champs adresse de résidence, code postal et ville."
            isVerified={values.addressVerified}
            buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
          />
        </>
      )}
    </>
  );
}

function Identite({ values, handleChange, errors, setFieldValue, cohort }) {
  const genderOptions = [
    { value: "male", label: "Homme" },
    { value: "female", label: "Femme" },
  ];
  const handleChangeBool = (e, value) => {
    e.target.value = value;
    handleChange(e);
  };
  const handleCniChange = (young) => {
    setFieldValue("latestCNIFileExpirationDate", young.latestCNIFileExpirationDate);
    setFieldValue("filesToUpload", young.filesToUpload);
    setFieldValue("latestCNIFileCategory", young.latestCNIFileCategory);
  };

  const handlePhoneChange = (name) => (value) => {
    handleChange({
      target: {
        name,
        value,
      },
    });
  };

  return (
    <>
      <div className="mb-2 text-xs font-medium leading-snug text-[#242526]">Identité et contact</div>
      <div className="mb-4 flex items-start justify-between">
        <Field name="lastName" label="Nom" errors={errors} value={values.lastName} transformer={translate} className="mr-2 flex-[1_1_50%]" handleChange={handleChange} />
        <Field name="firstName" label="Prénom" errors={errors} value={values.firstName} transformer={translate} className="flex-[1_1_50%]" handleChange={handleChange} />
      </div>
      <Field
        name="gender"
        label="Sexe"
        errors={errors}
        value={values.gender}
        className="mb-4"
        type="select"
        options={genderOptions}
        transformer={translate}
        handleChange={setFieldValue}
      />
      <Field name="email" label="Email" errors={errors} value={values.email} className="mb-4" transformer={translate} handleChange={handleChange} />
      <PhoneField
        name="phone"
        mode="edition"
        error={errors.phone}
        value={values.phone}
        placeholder={PHONE_ZONES[values.phoneZone]?.example}
        zoneValue={values.phoneZone}
        onChange={handlePhoneChange("phone")}
        onChangeZone={handlePhoneChange("phoneZone")}
      />
      <div className="mt-8 ">
        <CniField
          name="cniFile"
          label="Pièce d'identité"
          young={values}
          mode="edition"
          className={(errors.filesToUpload || errors.latestCNIFileCategory) && "border-[1px] border-red-500"}
          blockUpload={true}
          onStartRequest={null}
          currentRequest={null}
          correctionRequest={false}
          onCorrectionRequestChange={null}
          onInscriptionChange={(young) => handleCniChange(young)}
        />
      </div>
      {values.filesToUpload.length > 0 && (
        <>
          <Field
            name="latestCNIFileExpirationDate"
            label="Date d'expiration de la pièce d'identité"
            type="date"
            errors={errors}
            value={values.latestCNIFileExpirationDate}
            transformer={translate}
            className="mb-4"
            setFielValue={setFieldValue}
          />
          {values.latestCNIFileExpirationDate !== null && cohort?.dateStart && new Date(values.latestCNIFileExpirationDate).getTime() < new Date(cohort?.dateStart).getTime() && (
            <div className="w-100 flew-row mt-4 flex items-center justify-between">
              <div>Attestation sur l&apos;honneur</div>
              {values.parentStatementOfHonorInvalidId === "true" ? (
                <a
                  onClick={(e) => handleChangeBool(e, "false")}
                  name="parentStatementOfHonorInvalidId"
                  className="py cursor-pointer rounded-3xl border border-[#D1D5DB] bg-[#3B82F6] p-2 text-center leading-5 text-white">
                  Validée
                </a>
              ) : (
                <a
                  onClick={(e) => handleChangeBool(e, "true")}
                  name="parentStatementOfHonorInvalidId"
                  className="py text-whit cursor-pointer rounded-3xl  border border-[#D1D5DB] p-2 text-center leading-5">
                  Non validée
                </a>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
const PARENT_STATUS_NAME = {
  father: "Le père",
  mother: "La mère",
  representant: "Le représentant légal",
};
function SectionConsentements({ young, setFieldValue, errors }) {
  const [youngAge, setYoungAge] = React.useState("?");
  const [volontaireConsentement, setVolontaireConsentement] = React.useState({
    acceptCGU1: false,
    acceptCGU2: false,
    consentment1: false,
    consentment2: false,
    inscriptionDoneDate: false,
  });
  const [parent1Consentement, setParent1Consentement] = React.useState({
    allow1: false,
    allow2: false,
    allow3: false,
    allow4: false,
    allowGeneral: false,
  });

  React.useEffect(() => {
    if (young) {
      setYoungAge(getAge(young.temporaryDate));
    } else {
      setYoungAge("?");
    }
  }, [young]);

  React.useEffect(() => {
    if (volontaireConsentement.acceptCGU1 && volontaireConsentement.acceptCGU2) {
      setFieldValue("acceptCGU", "true");
    } else {
      setFieldValue("acceptCGU", "false");
    }
    if (volontaireConsentement.consentment1 && volontaireConsentement.consentment2) {
      setFieldValue("consentment", "true");
    } else {
      setFieldValue("consentment", "false");
    }
  }, [volontaireConsentement]);

  React.useEffect(() => {
    if (youngAge !== "?" && youngAge < 15) {
      if (parent1Consentement.allow1 && parent1Consentement.allow2 && parent1Consentement.allow3 && parent1Consentement.allow4 && parent1Consentement.allowGeneral) {
        setFieldValue("parent1AllowSNU", "true");
      } else {
        setFieldValue("parent1AllowSNU", "false");
      }
    } else {
      if (parent1Consentement.allow1 && parent1Consentement.allow3 && parent1Consentement.allow4 && parent1Consentement.allowGeneral) {
        setFieldValue("parent1AllowSNU", "true");
      } else {
        setFieldValue("parent1AllowSNU", "false");
      }
    }
  }, [parent1Consentement]);

  const authorizationOptions = [
    { value: "true", label: "Autorise" },
    { value: "false", label: "N'autorise pas" },
  ];

  const handleVolontaireChange = (name, value) => {
    setVolontaireConsentement((prevState) => {
      return {
        ...prevState,
        [name]: value ? value : !prevState[name],
      };
    });
  };

  const handleParent1Change = (name) => {
    setParent1Consentement((prevState) => {
      return {
        ...prevState,
        [name]: !prevState[name],
      };
    });
  };

  const handleConsentementChange = (name) => {
    if (young[name] === "true") {
      setFieldValue(name, "false");
    } else {
      setFieldValue(name, "true");
    }
  };

  return (
    <div className="flex">
      <div className="flex-[1_0_50%] pr-[56px]">
        <div className="text-[16px] font-bold leading-[24px] text-[#242526]">
          Le volontaire{" "}
          <span className="font-normal text-[#6B7280]">
            {young.firstName} {young.lastName}
          </span>
        </div>
        <div>
          <CheckRead name="acceptCGU" onClick={() => handleVolontaireChange("acceptCGU1")} errors={errors} value={volontaireConsentement.acceptCGU1}>
            A lu et accepté les Conditions Générales d&apos;Utilisation (CGU) de la plateforme du Service National Universel.
          </CheckRead>
          <CheckRead name="acceptCGU" onClick={() => handleVolontaireChange("acceptCGU2")} errors={errors} value={volontaireConsentement.acceptCGU2}>
            A pris connaissance des modalités de traitement de mes données personnelles.
          </CheckRead>
          <CheckRead name="consentment" onClick={() => handleVolontaireChange("consentment1")} errors={errors} value={volontaireConsentement.consentment1}>
            Est volontaire pour effectuer la session 2023 du Service National Universel qui comprend la participation au séjour de cohésion{" "}
            <b>{COHESION_STAY_LIMIT_DATE[young.cohort]}</b> puis la réalisation d&apos;une mission d&apos;intérêt général.
          </CheckRead>
          <CheckRead name="consentment" onClick={() => handleVolontaireChange("consentment2")} errors={errors} value={volontaireConsentement.consentment2}>
            S&apos;engage à respecter le règlement intérieur du SNU, en vue de ma participation au séjour de cohésion.
          </CheckRead>
          <CheckRead name="certifyData" onClick={() => handleConsentementChange("certifyData")} errors={errors} value={young.certifyData === "true"}>
            Certifie l&apos;exactitude des renseignements fournis
          </CheckRead>
        </div>
      </div>
      <div className="my-[73px] w-[1px] flex-[0_0_1px] bg-[#E5E7EB]" />
      <div className="flex-[1_0_50%] pl-[56px] pb-[32px]">
        <div className="mb-[16px] flex items-center justify-between text-[16px] font-bold leading-[24px] text-[#242526]">
          <div className="grow">
            {PARENT_STATUS_NAME[young.parent1Status]}{" "}
            <span className="font-normal text-[#6B7280]">
              {young.parent1FirstName} {young.parent1LastName}
            </span>
          </div>
          <div className="whitespace-nowrap text-[13px] font-normal text-[#1F2937]">{dayjs(young.parent1ValidationDate).locale("fr").format("DD/MM/YYYY HH:mm")}</div>
        </div>
        <div className="flex-column flex">
          <RadioButton value={young.parentAllowSNU} options={authorizationOptions} onChange={() => handleConsentementChange("parentAllowSNU")} />
          {errors.parentAllowSNU && (
            <div className="text-red-500">
              Le répresentant doit autoriser{" "}
              <b>
                {young.firstName} {young.lastName}
              </b>{" "}
              à participer
            </div>
          )}
        </div>
        <div className="my-[16px] text-[14px] leading-[20px] text-[#161616]">
          <b>
            {young.firstName} {young.lastName}
          </b>{" "}
          à participer à la session <b>{COHESION_STAY_LIMIT_DATE[young.cohort]}</b> du Service National Universel qui comprend la participation à un séjour de cohésion et la
          réalisation d&apos;une mission d&apos;intérêt général.
        </div>
        <div>
          <CheckRead name="parent1AllowSNU" onClick={() => handleParent1Change("allow1")} errors={errors} value={parent1Consentement.allow1}>
            Confirme être titulaire de l&apos;autorité parentale/ représentant(e) légal(e) de{" "}
            <b>
              {young.firstName} {young.lastName}
            </b>
          </CheckRead>
          {youngAge < 15 && (
            <CheckRead name="parent1AllowSNU" onClick={() => handleParent1Change("allow2")} errors={errors} value={parent1Consentement.allow2}>
              Accepte la collecte et le traitement des données personnelles de{" "}
              <b>
                {young.firstName} {young.lastName}
              </b>
            </CheckRead>
          )}
          <CheckRead name="parent1AllowSNU" onClick={() => handleParent1Change("allow3")} errors={errors} value={parent1Consentement.allow3}>
            S&apos;engage à remettre sous pli confidentiel la fiche sanitaire ainsi que les documents médicaux et justificatifs nécessaires avant son départ en séjour de cohésion.
          </CheckRead>
          <CheckRead name="parent1AllowSNU" onClick={() => handleParent1Change("allow4")} errors={errors} value={parent1Consentement.allow4}>
            S&apos;engage à ce que{" "}
            <b>
              {young.firstName} {young.lastName}
            </b>{" "}
            soit à jour de ses vaccinations obligatoires, c&apos;est-à-dire anti-diphtérie, tétanos et poliomyélite (DTP), et pour les volontaires résidents de Guyane, la fièvre
            jaune.
          </CheckRead>
          <CheckRead name="rulesParent1" onClick={() => handleConsentementChange("rulesParent1")} errors={errors} value={young.rulesParent1 === "true"}>
            Reconnait avoir pris connaissance du Règlement Intérieur du SNU.
          </CheckRead>
        </div>
        <div className="itemx-center mt-[16px] flex justify-between">
          <div className="grow text-[14px] leading-[20px] text-[#374151]">
            <div className="font-bold">Droit à l&apos;image</div>
            <div>Accord : {translate(young.parent1AllowImageRights)}</div>
          </div>
          {(young.parent1AllowImageRights === "true" || young.parent1AllowImageRights === "false") && (
            <div className="cursor-pointer" onClick={() => handleConsentementChange("parent1AllowImageRights")}>
              <MiniSwitch value={young.parent1AllowImageRights === "true"} />
            </div>
          )}
        </div>
        {(young.parent1AllowSNU === "true" || young.parent1AllowSNU === "false") && (
          <div className="itemx-center mt-[16px] flex justify-between">
            <div className="grow text-[14px] leading-[20px] text-[#374151]">
              <div className="font-bold">Consentement à la participation</div>
              <div>Accord : {translate(young.parent1AllowSNU)}</div>
            </div>
            <div className="cursor-pointer" onClick={() => handleParent1Change("allowGeneral")}>
              <MiniSwitch value={parent1Consentement.allowGeneral} />
            </div>
          </div>
        )}
        {young.parent2Status && (
          <div className="mt-[24px] border-t-[1px] border-t-[#E5E7EB] pt-[24px]">
            <div className="mb-[16px] flex items-center justify-between text-[16px] font-bold leading-[24px] text-[#242526]">
              <div className="grow">
                {PARENT_STATUS_NAME[young.parent2Status]}{" "}
                <span className="font-normal text-[#6B7280]">
                  {young.parent2FirstName} {young.parent2LastName}
                </span>
              </div>
              <div className="whitespace-nowrap text-[13px] font-normal text-[#1F2937]">{dayjs(young.parent2ValidationDate).locale("fr").format("DD/MM/YYYY HH:mm")}</div>
            </div>
            <div className="mt-[16px] flex items-center justify-between">
              <div className="grow text-[14px] leading-[20px] text-[#374151]">
                <div className="font-bold">Droit à l&apos;image</div>
                <div>Accord : {translate(young.parent2AllowImageRights)}</div>
              </div>
              {(young.parent2AllowImageRights === "true" || young.parent2AllowImageRights === "false") && (
                <div className="cursor-pointer" onClick={() => handleConsentementChange("parent2AllowImageRights")}>
                  <MiniSwitch value={young.parent2AllowImageRights === "true"} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckRead({ name, errors, value, children, onClick }) {
  return (
    <div onClick={onClick} className="mt-[16px] flex cursor-pointer items-center">
      <div
        className={`mr-[24px]  flex h-[14px] w-[14px] flex-[0_0_14px] items-center justify-center rounded-[4px] bg-[#E5E5E5] text-[#666666] ${
          errors[name] && !value ? "border-2 border-red-500" : ""
        } `}>
        {value && <Check className="h-[8px] w-[11px]" />}
      </div>
      <div className="grow text-[14px] leading-[19px] text-[#3A3A3A]">{children}</div>
    </div>
  );
}
