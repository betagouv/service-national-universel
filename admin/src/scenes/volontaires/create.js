import React from "react";
import validator from "validator";
import "dayjs/locale/fr";
import { Spinner } from "reactstrap";

import { translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { capture } from "../../sentry";
import { useHistory } from "react-router-dom";

import { translateGrade, YOUNG_SITUATIONS, GRADES, inscriptionModificationOpenForYoungs, sessions2023, getAge, COHESION_STAY_LIMIT_DATE, getDepartmentByZip } from "snu-lib";
import { youngEmployedSituationOptions, youngSchooledSituationOptions } from "../phase0/commons";
import dayjs from "dayjs";
import MiniSwitch from "../phase0/components/MiniSwitch";
import RadioButton from "../phase0/components/RadioButton";

//Identite
import Field from "./components/Field";
import { CniField } from "../phase0/components/CniField";
import SchoolEditor from "../phase0/components/SchoolEditor";
import VerifyAddress from "../phase0/components/VerifyAddress";
import FieldSituationsParticulieres from "../phase0/components/FieldSituationsParticulieres";
import Check from "../../assets/icons/Check";

export default function Create() {
  const history = useHistory();
  const [selectedRepresentant, setSelectedRepresentant] = React.useState(1);
  const [uploadError, setUploadError] = React.useState("");
  const [youngId, setYoungId] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const [errors, setErrors] = React.useState({});
  const getFirstCohortAvailable = () => {
    for (const session of sessions2023) {
      if (session.dateStart.getTime() > new Date().getTime() && inscriptionModificationOpenForYoungs(session.name)) {
        return session.name;
      }
    }
  };
  const [values, setValues] = React.useState({
    status: "VALIDATED",
    firstName: "",
    lastName: "",
    birthdateAt: null,
    birthCityZip: "",
    birthCity: "",
    gender: "",
    grade: "",
    birthCountry: "",
    filesToUpload: [],
    latestCNIFileExpirationDate: "",
    latestCNIFileCategory: "",
    email: "",
    expirationDate: null,
    phone: "",
    cohort: getFirstCohortAvailable(),
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
    parent1LastName: "",
    parent1Email: "",
    parent1Phone: "",
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
    parent2OwnAddress: "false",
    parent2Address: "",
    parent2Zip: "",
    parent2City: "",
    parent2Country: "",
  });
  const [cohorts, setCohorts] = React.useState([]);
  const [egibilityError, setEgibilityError] = React.useState("");

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

    if (values.birthdateAt === null) {
      errors.birthdateAt = errorEmpty;
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
    // check birtDate
    const selectedSession = sessions2023.find((session) => session.name === values.cohort);
    if (values?.birthdateAt && !(selectedSession.eligibility.bornBefore > new Date(values.birthdateAt) && selectedSession.eligibility.bornAfter < new Date(values.birthdateAt))) {
      errors.birthdateAt = "Sont éligibles les volontaires âgés de 15 à 17 ans au moment du SNU.";
    }
    // Check parent 1
    if (!validator.isEmail(values.parent1Email)) {
      errors.parent1Email = errorEmail;
    }
    if (!validator.isEmail(values.parent1Phone)) {
      errors.parent1Phone = errorPhone;
    }
    //check parent2 if exist
    const parent2FirstNameEmpty = validator.isEmpty(values.parent2FirstName);
    const parent2LastNameEmpty = validator.isEmpty(values.parent2LastName);
    const parent2StatusEmpty = validator.isEmpty(values.parent2Status);
    const parent2Phone = validator.isEmpty(values.parent2Phone);
    // if 1 of 3 is not empty --> ask for the 3
    if (values.parent2Email !== "" || !parent2FirstNameEmpty || !parent2LastNameEmpty || !parent2StatusEmpty || !parent2Phone) {
      if (!validator.isEmail(values.parent2Email)) {
        setSelectedRepresentant(2);
        errors.parent2Email = errorEmail;
      }
      if (!validator.isMobilePhone(values.parent2Phone)) {
        errors.parent2Phone = errorPhone;
      }
      if (parent2FirstNameEmpty) {
        errors.parent2FirstName = errorEmpty;
      }
      if (parent2LastNameEmpty) {
        errors.parent2LastName = errorEmpty;
      }
      if (parent2StatusEmpty) {
        errors.parent2Status = errorEmpty;
      }
    } else {
      setSelectedRepresentant(1);
    }

    if (values.country === "FRANCE") {
      if (values.schoolCity === "") {
        errors.schoolCity = errorEmpty;
      }
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
      toastr.error("Vous devez ajouter un papier d'identité");
    }
    if (validator.isEmpty(values.latestCNIFileCategory)) {
      errors.latestCNIFileCategory = errorEmpty;
      toastr.error("Vous devez spécifier une catégorie pour le document d'identité");
    }
    if (Object.keys(errors).length > 0) {
      toastr.error("Le formulaire n'est pas complet");
    }
    return errors;
  };

  const uploadFiles = async (id, filesToUpload, latestCNIFileCategory, latestCNIFileExpirationDate) => {
    setLoading(true);
    const res = await api.uploadFile(`/young/${id}/documents/cniFiles`, Array.from(filesToUpload), {}, latestCNIFileCategory, latestCNIFileExpirationDate);
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
    return history.push("/inscription");
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
    try {
      setLoading(true);
      values.addressVerified = values.addressVerified.toString();
      // necessaire ?
      delete values.certifyData;
      const { ok, code, young } = await api.post("/young/invite", values);
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
    if (values.department !== "" && values.birthdateAt !== null && values.situation !== "" && (values.schoolDepartment !== "" || getDepartmentByZip(values.zip))) {
      (async () => {
        try {
          const res = await api.post("/cohort-session/eligibility/2023", {
            department: values?.schoolDepartment || getDepartmentByZip(values?.zip) || null,
            birthDate: values.birthdateAt,
            schoolLevel: values.grade,
            frenchNationality: "true",
          });
          if (res.data.msg) return setEgibilityError(res.data.msg);
          const sessionsFiltered = res.data.filter((e) => e.goalReached === false);
          if (sessionsFiltered.length === 0) {
            setEgibilityError("Il n'y a malheureusement plus de place dans votre département.");
          } else {
            setEgibilityError("");
          }
          setCohorts(sessionsFiltered);
          setFieldValue("cohort", sessionsFiltered[0].name);
        } catch (e) {
          capture(e);
          setCohorts([]);
        }
        setLoading(false);
      })();
    }
  }, [values.birthdateAt, values.department, values.situation, values.grade, values.schoolDepartment]);

  return (
    <div className="py-4 px-8">
      <div className="relative bg-white shadow rounded mb-4 pt-4">
        <div className="text-2xl font-bold flex items-center justify-center">Créer une inscription manuellement</div>
        <div className="border-b mb-5 mt-6 mx-9" />
        <div className="ml-8 mb-6 text-lg font-normal">Informations générales</div>
        <div className={"flex pb-14"}>
          <div className="flex-[1_0_50%] pr-14 pl-8">
            <Identite values={values} handleChange={handleChange} errors={errors} setFieldValue={setFieldValue} />
          </div>
          <div className="my-16 bg-[#E5E7EB] flex-[0_0_1px]" />
          <div className="flex-[1_0_50%] pl-14 pr-8">
            <Coordonnees values={values} handleChange={handleChange} errors={errors} setFieldValue={setFieldValue} />
          </div>
        </div>
      </div>
      <div className="relative bg-white shadow rounded mb-4 pt-4">
        <div className="ml-8 mb-6 text-lg font-normal">Détails</div>
        <div className={"flex pb-14"}>
          <div className="flex-[1_0_50%] pl-8 pr-14">
            <Situation values={values} handleChange={handleChange} required={{ situation: true }} errors={errors} setFieldValue={setFieldValue} />
          </div>
          <div className="my-16 bg-[#E5E7EB] flex-[0_0_1px]" />
          <div className="flex-[1_0_50%] pl-14 pr-8">
            <div className="ml-5 mb-4 flex items-start justify-start">
              <div onClick={() => setSelectedRepresentant(1)} className={`cursor-pointer pb-4 ${selectedRepresentant === 1 && "border-b-4 text-[#3B82F6]"} border-[#3B82F6] mr-9`}>
                Représentant légal 1
              </div>
              <div onClick={() => setSelectedRepresentant(2)} className={`cursor-pointer pb-4 ${selectedRepresentant === 2 && "border-b-4 text-[#3B82F6]"} border-[#3B82F6] mr-9`}>
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
        <div className="relative bg-white shadow rounded mb-4 pt-4">
          <div className="ml-8 mb-6 text-lg font-normal">Choisissez un séjour pour le volontaire</div>
          {egibilityError !== "" && <div className="ml-8 pb-4">{egibilityError}</div>}
          <div className="flex justify-start flex-row flex-wrap px-4">
            {egibilityError === "" &&
              cohorts.map((session) => {
                if (new Date(session.dateStart).getTime() > new Date().getTime() && session.name) {
                  return (
                    <div
                      key={session.name}
                      onClick={() => setFieldValue("cohort", session.name)}
                      className="cursor-pointer flex flex-row justify-start items-center w-60 h-14 border border-[#3B82F6] rounded-md m-3">
                      <input
                        className="rounded-full mx-3"
                        type="checkbox"
                        id="checkboxCohort"
                        name="cohort"
                        checked={session.name === values.cohort}
                        onChange={() => setFieldValue("cohort", session.name)}
                      />
                      <div>{session.name}</div>
                    </div>
                  );
                }
                return <div key={session.name}></div>;
              })}
          </div>
        </div>
      )}

      {values.firstName !== "" &&
        values.lastName !== "" &&
        values.parent1FirstName !== "" &&
        values.parent1LastName !== "" &&
        values.parent1Email !== "" &&
        values.parent1Status !== "" &&
        values.birthdateAt !== null &&
        cohorts.length > 0 &&
        egibilityError === "" && (
          <div className="relative bg-white shadow rounded mb-4 pt-4">
            <div className="ml-8 mb-6 text-lg font-normal">Consentements</div>
            <div className={"flex pb-14 px-8"}>
              <SectionConsentements young={values} setFieldValue={setFieldValue} errors={errors} />
            </div>
          </div>
        )}
      {egibilityError === "" && (
        <div className="flex items-center w-100 justify-center">
          {uploadError === "" ? (
            <div onClick={handleSubmit} className="cursor-pointer w-80 bg-[#2563EB] text-white py-2 px-4 text-center rounded-md self-center">
              {!loading ? "Créer l'inscription" : <Spinner size="sm" style={{ borderWidth: "0.1em", color: "white" }} />}
            </div>
          ) : (
            <div className="flex flex-column">
              <div>{uploadError}</div>
              <div
                onClick={() => uploadFiles(youngId, values.filesToUpload, values.latestCNIFileCategory, values.latestCNIFileExpirationDate)}
                className="cursor-pointer w-80 bg-[#2563EB] text-white py-2 px-4 text-center rounded-md self-center">
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
      <Field
        name={parent === "1" ? "parent1Phone" : "parent2Phone"}
        label="Téléphone"
        errors={errors}
        value={parent === "1" ? values.parent1Phone : values.parent2Phone}
        transformer={translate}
        className="mb-4"
        handleChange={handleChange}
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
          <div className="font-medium text-xs text-[#242526] leading-snug mb-2">Adresse</div>
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
    const isSchooled = youngSchooledSituationOptions.includes(value);
    if (!isSchooled) setFieldValue("grade", "");
    setFieldValue("schooled", isSchooled ? "true" : "false");
    setFieldValue("situation", value);
  };
  const situationOptions = Object.keys(YOUNG_SITUATIONS).map((s) => ({ value: s, label: translate(s) }));
  const gradeOptions = Object.keys(GRADES)
    .filter((g) => g !== GRADES.NOT_SCOLARISE)
    .map((g) => ({ value: g, label: translateGrade(g) }));
  const onParticuliereChange = (key, value) => {
    setFieldValue(key, value);
  };
  return (
    <>
      <div className="font-medium text-xs text-[#242526] leading-snug mb-2">Situation</div>
      <Field
        name="situation"
        label="Statut"
        type="select"
        errors={errors}
        value={values.situation}
        transformer={translate}
        className="flex-[1_1_50%]"
        options={situationOptions}
        handleChange={onChangeSituation}
      />
      {values.situation !== "" && values.schooled === "true" && (
        <div className="mt-4">
          <SchoolEditor showBackgroundColor={false} young={values} onChange={onChange} />
          <Field
            name="grade"
            label="Classe"
            type="select"
            errors={errors}
            value={values.grade}
            transformer={translate}
            className="flex-[1_1_50%]"
            options={gradeOptions}
            handleChange={setFieldValue}
          />
        </div>
      )}
      <div className="mt-8">
        <div className="font-medium text-xs mt-8 text-[#242526] leading-snug mb-2">Situations particulières</div>
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
    if (e) setFieldValue("country", "FRANCE");
  };
  return (
    <>
      <div className="font-medium text-xs text-[#242526] leading-snug mb-2">Date et lieu de naissance</div>
      <Field
        name="birthdateAt"
        label="Date de naissance"
        type="date"
        errors={errors}
        value={values.birthdateAt}
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
      <div className="flex justify-between items-center mt-8 mb-2">
        <div className="font-medium text-xs text-[#242526] leading-snug">Adresse</div>
        <div className="inline-flex">
          <div
            className={`border-[#3B82F6] border-[1px] rounded-[100px_0_0_100px] text-[14px] px-[10px] py-[3px] ${
              liveInFrance ? "bg-[#3B82F6] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#3B82F6] cursor-pointer"
            }`}
            onClick={() => handleCountryChange(true)}>
            en France
          </div>
          <div
            className={`border-[#3B82F6] border-[1px] rounded-[0_100px_100px_0] text-[14px] px-[10px] py-[3px] ml-[-1px] ${
              !liveInFrance ? "bg-[#3B82F6] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#3B82F6] cursor-pointer"
            }`}
            onClick={() => handleCountryChange(false)}>
            à l&apos;étranger
          </div>
        </div>
      </div>
      <Field name="address" label="Adresse" errors={errors} value={values.address} transformer={translate} className="mb-4" handleChange={handleAdressChange} />
      {!liveInFrance && (
        <Field name="foreignCountry" label="Pays" errors={errors} value={values.foreignCountry} transformer={translate} className="mb-4" handleChange={handleAdressChange} />
      )}
      <div className="mb-4 flex items-start justify-between">
        <Field name="zip" label="Code postal" errors={errors} value={values.zip} transformer={translate} className="mr-2 flex-[1_1_50%]" handleChange={handleAdressChange} />
        <Field name="city" label="Ville" errors={errors} value={values.city} transformer={translate} className="flex-[1_1_50%]" handleChange={handleAdressChange} />
      </div>
      {liveInFrance && (
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
      )}
    </>
  );
}

function Identite({ values, handleChange, errors, setFieldValue }) {
  const genderOptions = [
    { value: "male", label: "Homme" },
    { value: "female", label: "Femme" },
  ];
  const handleChangeBool = (e, value) => {
    e.target.value = value;
    handleChange(e);
  };
  const handleCniChange = (young) => {
    setFieldValue("filesToUpload", young.filesToUpload);
    setFieldValue("latestCNIFileExpirationDate", young.latestCNIFileExpirationDate);
    setFieldValue("latestCNIFileCategory", young.latestCNIFileCategory);
  };
  return (
    <>
      <div className="font-medium text-xs text-[#242526] leading-snug mb-2">Identité et contact</div>
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
      <Field name="phone" label="Téléphone" errors={errors} value={values.phone} transformer={translate} handleChange={handleChange} />
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
      {values.latestCNIFileExpirationDate !== null &&
        new Date(values.latestCNIFileExpirationDate).getTime() < sessions2023.find((session) => session.name === values.cohort).dateStart.getTime() && (
          <div className="mt-4 w-100 flex flew-row justify-between items-center">
            <div>Attestation sur l&apos;honneur</div>
            {values.parentStatementOfHonorInvalidId === "true" ? (
              <a
                onClick={(e) => handleChangeBool(e, "false")}
                name="parentStatementOfHonorInvalidId"
                className="p-2 py text-center leading-5 border cursor-pointer border-[#D1D5DB] text-white bg-[#3B82F6] rounded-3xl">
                Validée
              </a>
            ) : (
              <a
                onClick={(e) => handleChangeBool(e, "true")}
                name="parentStatementOfHonorInvalidId"
                className="p-2 py text-center leading-5  border cursor-pointer border-[#D1D5DB] text-whit rounded-3xl">
                Non validée
              </a>
            )}
          </div>
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
      setYoungAge(getAge(young.birthdateAt));
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
        <div className="text-[16px] leading-[24px] font-bold text-[#242526]">
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
      <div className="w-[1px] my-[73px] bg-[#E5E7EB] flex-[0_0_1px]" />
      <div className="flex-[1_0_50%] pl-[56px] pb-[32px]">
        <div className="text-[16px] leading-[24px] font-bold text-[#242526] flex items-center justify-between mb-[16px]">
          <div className="grow">
            {PARENT_STATUS_NAME[young.parent1Status]}{" "}
            <span className="font-normal text-[#6B7280]">
              {young.parent1FirstName} {young.parent1LastName}
            </span>
          </div>
          <div className="text-[13px] whitespace-nowrap text-[#1F2937] font-normal">{dayjs(young.parent1ValidationDate).locale("fr").format("DD/MM/YYYY HH:mm")}</div>
        </div>
        <div className="flex flex-column">
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
        <div className="text-[#161616] text-[14px] leading-[20px] my-[16px]">
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
        <div className="mt-[16px] flex itemx-center justify-between">
          <div className="grow text-[#374151] text-[14px] leading-[20px]">
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
          <div className="mt-[16px] flex itemx-center justify-between">
            <div className="grow text-[#374151] text-[14px] leading-[20px]">
              <div className="font-bold">Consentement à la participation</div>
              <div>Accord : {translate(young.parent1AllowSNU)}</div>
            </div>
            <div className="cursor-pointer" onClick={() => handleParent1Change("allowGeneral")}>
              <MiniSwitch value={parent1Consentement.allowGeneral} />
            </div>
          </div>
        )}
        {young.parent2Status && (
          <div className="mt-[24px] border-t-[#E5E7EB] border-t-[1px] pt-[24px]">
            <div className="text-[16px] leading-[24px] font-bold text-[#242526] flex items-center justify-between mb-[16px]">
              <div className="grow">
                {PARENT_STATUS_NAME[young.parent2Status]}{" "}
                <span className="font-normal text-[#6B7280]">
                  {young.parent2FirstName} {young.parent2LastName}
                </span>
              </div>
              <div className="text-[13px] whitespace-nowrap text-[#1F2937] font-normal">{dayjs(young.parent2ValidationDate).locale("fr").format("DD/MM/YYYY HH:mm")}</div>
            </div>
            <div className="mt-[16px] flex items-center justify-between">
              <div className="grow text-[#374151] text-[14px] leading-[20px]">
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
    <div onClick={onClick} className="cursor-pointer flex items-center mt-[16px]">
      <div
        className={`flex-[0_0_14px]  mr-[24px] bg-[#E5E5E5] rounded-[4px] flex items-center justify-center text-[#666666] w-[14px] h-[14px] ${
          errors[name] && !value ? "border-2 border-red-500" : ""
        } `}>
        {value && <Check className="w-[11px] h-[8px]" />}
      </div>
      <div className="grow text-[#3A3A3A] text-[14px] leading-[19px]">{children}</div>
    </div>
  );
}
