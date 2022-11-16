import React from "react";
import validator from "validator";
import "dayjs/locale/fr";
import { Spinner } from "reactstrap";

import { translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { capture } from "../../sentry";
import { useHistory } from "react-router-dom";

import { translateGrade, YOUNG_SITUATIONS, GRADES, inscriptionModificationOpenForYoungs, sessions2023 } from "snu-lib";
import { youngEmployedSituationOptions, youngSchooledSituationOptions } from "../phase0/commons";
//Identite
import Field from "./components/Field";
import { CniField } from "../phase0/components/CniField";
import SchoolEditor from "../phase0/components/SchoolEditor";
import VerifyAddress from "../phase0/components/VerifyAddress";
import FieldSituationsParticulieres from "../phase0/components/FieldSituationsParticulieres";

export default function Create() {
  const history = useHistory();
  const [selectedRepresentant, setSelectedRepresentant] = React.useState(1);
  const [uploadError, setUploadError] = React.useState("");
  const [youngId, setYoungId] = React.useState(null);
  const [onWaitingList, setOnWaitingList] = React.useState(false);
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
    zip: "",
    city: "",
    region: "",
    department: "",
    address: "",
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
    parent1Status: "",
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

  const validate = () => {
    const errors = {};
    const errorEmpty = "Ne peut être vide";
    const errorEmail = "Adresse email invalide";
    const required = [
      "latestCNIFileExpirationDate",
      "firstName",
      "lastName",
      "birthCityZip",
      "birthdateAt",
      "birthCity",
      "gender",
      "birthCountry",
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
      if (!values[key] || validator.isEmpty(values[key], { ignore_whitespace: true }) || values[key] === null) {
        errors[key] = errorEmpty;
      }
    }

    // check email volontaire
    if (!validator.isEmail(values.email)) {
      errors.email = errorEmail;
    }
    // check birtDate
    const selectedSession = sessions2023.find((session) => session.name === values.cohort);
    if (values?.birthdateAt && !(selectedSession.eligibility.bornBefore > new Date(values.birthdateAt) && selectedSession.eligibility.bornAfter < new Date(values.birthdateAt))) {
      errors.birthdateAt = "Sont éligibles les volontaires âgés de 15 à 17 ans au moment du SNU.";
    }
    if (!validator.isEmail(values.parent1Email)) {
      errors.parent1Email = errorEmail;
    }
    //check parent2 if exist
    const parent2FirstNameEmpty = validator.isEmpty(values.parent2FirstName);
    const parent2LastNameEmpty = validator.isEmpty(values.parent2LastName);
    // if 1 of 3 is not empty --> ask for the 3
    if (values.parent2Email !== "" || !parent2FirstNameEmpty || !parent2LastNameEmpty) {
      if (!validator.isEmail(values.parent2Email)) {
        setSelectedRepresentant(2);
        errors.parent2Email = errorEmail;
      }
      if (parent2FirstNameEmpty) {
        errors.parent2FirstName = errorEmpty;
      }
      if (parent2LastNameEmpty) {
        errors.parent2LastName = errorEmpty;
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
    if (values.filesToUpload.length === 0) {
      toastr.error("Vous devez ajouter un papier d'identité");
    }
    if (validator.isEmpty(values.latestCNIFileCategory)) {
      toastr.error("Vous devez spécifier une catégorie pour le document d'identité");
    }
    if (Object.keys(errors).length > 0) {
      toastr.error("Le formulaire n'est pas complet");
    }
    return errors;
  };

  const uploadFiles = async (id, filesToUpload, latestCNIFileCategory, latestCNIFileExpirationDate, onWaitingList) => {
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
    if (onWaitingList) {
      toastr.success("Volontaire créé et ajouté à la liste d'attente !");
    } else {
      toastr.success("Volontaire créé !");
    }
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
      const { ok, code, young, onWaitingList } = await api.post("/young/invite", values);
      if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
      const res = await uploadFiles(young._id, values.filesToUpload, values.latestCNIFileCategory, values.latestCNIFileExpirationDate, onWaitingList);
      setYoungId(young._id);
      setOnWaitingList(onWaitingList);
      if (res === "err") return toastr.error("Une erreur s'est produite avec le téléversement de vos fichiers");
    } catch (e) {
      setLoading(false);
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant la création du volontaire :", translate(e.code));
    }
  };

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
              <Representant parent="1" errors={errors} handleChange={handleChange} setFieldValue={setFieldValue} />
            ) : (
              <Representant parent="2" values={values} errors={errors} handleChange={handleChange} setFieldValue={setFieldValue} />
            )}
          </div>
        </div>
      </div>

      <div className="relative bg-white shadow rounded mb-4 pt-4">
        <div className="ml-8 mb-6 text-lg font-normal">Choisissez un séjour pour le volontaire</div>
        <div className="flex justify-start flex-row flex-wrap px-4">
          {sessions2023.map((session) => {
            if (session.dateStart.getTime() > new Date().getTime() && session.name) {
              return (
                <div
                  key={session.name}
                  onClick={() => setFieldValue("cohort", session.name)}
                  className="cursor-pointer flex flex-row justify-start items-center w-60 h-14 border border-[#3B82F6] rounded-md m-3">
                  <input className="rounded-full mx-3" type="checkbox" id="checkboxCohort" name="cohort" checked={session.name === values.cohort} onChange={null} />
                  <div>{session.name}</div>
                </div>
              );
            }
            return <div key={session.name}></div>;
          })}
        </div>
      </div>

      <div className="flex items-center w-100 justify-center">
        {uploadError === "" ? (
          <div onClick={handleSubmit} className="cursor-pointer w-80 bg-[#2563EB] text-white py-2 px-4 text-center rounded-md self-center">
            {!loading ? "Créer l'inscription" : <Spinner size="sm" style={{ borderWidth: "0.1em", color: "white" }} />}
          </div>
        ) : (
          <div className="flex flex-column">
            <div>{uploadError}</div>
            <div
              onClick={() => uploadFiles(youngId, values.filesToUpload, values.latestCNIFileCategory, values.latestCNIFileExpirationDate, onWaitingList)}
              className="cursor-pointer w-80 bg-[#2563EB] text-white py-2 px-4 text-center rounded-md self-center">
              {!loading ? "Réessayer de téleverser les fichiers" : <Spinner size="sm" style={{ borderWidth: "0.1em", color: "white" }} />}
            </div>
          </div>
        )}
      </div>
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
    setFieldValue("schooled", youngSchooledSituationOptions.includes(value) ? "true" : "false");
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
  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setFieldValue("addressVerified", "true");
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
        handleChange={handleChange}
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

      <div className="font-medium text-xs mt-8 text-[#242526] leading-snug mb-2">Adresse</div>
      <Field name="address" label="Adresse" errors={errors} value={values.address} transformer={translate} className="mb-4" handleChange={handleChange} />
      <div className="mb-4 flex items-start justify-between">
        <Field name="zip" label="Code postal" errors={errors} value={values.zip} transformer={translate} className="mr-2 flex-[1_1_50%]" handleChange={handleChange} />
        <Field name="city" label="Ville" errors={errors} value={values.city} transformer={translate} className="flex-[1_1_50%]" handleChange={handleChange} />
      </div>
      <VerifyAddress
        address={values.address}
        zip={values.zip}
        city={values.city}
        onSuccess={onVerifyAddress(true)}
        onFail={onVerifyAddress()}
        verifyButtonText="Vérifier l'adresse"
        verifyText="Pour vérifier l'adresse vous devez remplir les champs adresse de résidence, code postal et ville."
        isVerified={values.addressVerified}
        buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
      />
      <div className="flex items-start justify-between mt-4">
        <Field
          name="department"
          label="Département"
          errors={errors}
          readyOnly={true}
          value={values.department}
          transformer={translate}
          className="mr-2 flex-[1_1_50%]"
          handleChange={handleChange}
        />
        <Field name="region" label="Région" errors={errors} readyOnly={true} value={values.region} transformer={translate} className="flex-[1_1_50%]" handleChange={handleChange} />
      </div>
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
      <div className="mt-8">
        <CniField
          name="cniFile"
          label="Pièce d'identité"
          young={values}
          mode="edition"
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
        handleChange={handleChange}
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
                className="p-2 py text-center leading-5  border cursor-pointer border-[#D1D5DB] text-white bg-[#3B82F6] rounded-3xl">
                Non validée
              </a>
            )}
          </div>
        )}
    </>
  );
}
