/* eslint-disable prettier/prettier */
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
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
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

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const validate = () => {
    const errors = {};
    const errorEmpty = "Ne peut être vide";
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
    if (!values.email) {
      errors.email = errorEmpty;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = "Adresse email invalide";
    }
    // check birtDate
    const selectedSession = sessions2023.find((session) => session.name === values.cohort);
    if (values?.birthdateAt && !(selectedSession.eligibility.bornBefore > new Date(values.birthdateAt) && selectedSession.eligibility.bornAfter < new Date(values.birthdateAt))) {
      errors.birthdateAt = "Sont éligibles les volontaires âgés de 15 à 17 ans au moment du SNU.";
    }
    //if (values.birthdateAt < session)
    if (!values.parent1Email) {
      // check email parent1
      errors.parent1Email = errorEmpty;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.parent1Email)) {
      errors.parent1Email = "Adresse email invalide";
    }
    //check email parent2 if exist
    if (values.parent2Email !== "") {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.parent2Email)) {
        setSelectedRepresentant(2);
        errors.parent2Email = "Adresse email invalide";
      } else {
        setSelectedRepresentant(1);
      }
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
    // il faut check le RP2 si rempli à moitié
    //
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
    <div className="py-[20px] px-[40px]">
      <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px] pt-[27px]">
        <div className="text-[25px] font-[700] flex items-center justify-center">Créer une inscription manuellement</div>
        <div className="border-b mx-[37px] mb-[24px] mt-[29px]" />
        <div className="ml-[32px] text-[18px] font-[500] mb-[24px]">Informations générales</div>
        <div className={"flex pb-[56px]"}>
          <div className="flex-[1_0_50%] pr-[56px] pl-[32px]">
            <Identite values={values} handleChange={handleChange} errors={errors} setFieldValue={setFieldValue} />
          </div>
          <div className="w-[1px] my-[73px] bg-[#E5E7EB] flex-[0_0_1px]" />
          <div className="flex-[1_0_50%] pl-[56px] pr-[32px]">
            <Coordonnees values={values} handleChange={handleChange} errors={errors} setFieldValue={setFieldValue} />
          </div>
        </div>
      </div>
      <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px] pt-[24px]">
        <div className="ml-[32px] text-[18px] font-[500] mb-[24px]">Détails</div>
        <div className={"flex pb-[56px]"}>
          <div className="flex-[1_0_50%] pr-[56px] pl-[32px]">
            <Situation values={values} handleChange={handleChange} required={{ situation: true }} errors={errors} setFieldValue={setFieldValue} />
          </div>
          <div className="w-[1px] my-[73px] bg-[#E5E7EB] flex-[0_0_1px]" />
          <div className="flex-[1_0_50%] pl-[56px] pr-[32px]">
            <div className="ml-[32px] mb-[24px] flex items-start justify-start">
              <div
                onClick={() => setSelectedRepresentant(1)}
                className={`cursor-pointer pb-[18px] ${selectedRepresentant === 1 && "border-b-4 text-[#3B82F6]"} border-[#3B82F6] mr-[36px]`}>
                Représentant légal 1
              </div>
              <div
                onClick={() => setSelectedRepresentant(2)}
                className={`cursor-pointer pb-[18px] ${selectedRepresentant === 2 && "border-b-4 text-[#3B82F6]"} border-[#3B82F6] mr-[36px]`}>
                Représentant légal 2
              </div>
            </div>
            {selectedRepresentant === 1 ? (
              <Representant1 values={values} errors={errors} handleChange={handleChange} />
            ) : (
              <Representant2 values={values} errors={errors} handleChange={handleChange} />
            )}
          </div>
        </div>
      </div>

      <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px] pt-[24px]">
        <div className="ml-[32px] text-[18px] font-[500]">Choisissez un séjour pour le volontaire</div>
        <div className="flex justify-start flex-row flex-wrap pl-[24px]">
          {sessions2023.map((session) => {
            if (session.dateStart.getTime() > new Date().getTime() && session.name) {
              return (
                <div
                  key={session.name}
                  onClick={() => setFieldValue("cohort", session.name)}
                  className="cursor-pointer flex flex-row justify-start items-center w-[237px] h-[54px] border border-[#3B82F6] rounded-[6px] m-[16px]">
                  <input className="rounded-full ml-[13px] mr-[11px]" type="checkbox" id="checkboxCohort" name="cohort" checked={session.name === values.cohort} onChange={null} />
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
          <div onClick={handleSubmit} className="cursor-pointer w-[365px] bg-[#2563EB] text-white py-[9px] px-[17px] text-center rounded-[6px] self-center">
            {!loading ? "Créer l'inscription" : <Spinner size="sm" style={{ borderWidth: "0.1em", color: "white" }} />}
          </div>
        ) : (
          <div className="flex flex-column">
            <div>{uploadError}</div>
            <div
              onClick={() => uploadFiles(youngId, values.filesToUpload, values.latestCNIFileCategory, values.latestCNIFileExpirationDate, onWaitingList)}
              className="cursor-pointer w-[365px] bg-[#2563EB] text-white py-[9px] px-[17px] text-center rounded-[6px] self-center">
              {!loading ? "Réessayer de téleverser les fichiers" : <Spinner size="sm" style={{ borderWidth: "0.1em", color: "white" }} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Representant2({ values, handleChange, errors }) {
  return (
    <>
      <Field
        name="parent2Status"
        label="Statut"
        errors={errors}
        type="select"
        value={values.parent2Status}
        options={[
          { value: "mother", label: "Mère" },
          { value: "father", label: "Père" },
          { value: "representant", label: "Représentant légal" },
        ]}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      <div className="mb-[16px] flex items-start justify-between">
        <Field
          name="parent2LastName"
          label="Nom"
          errors={errors}
          value={values.parent2LastName}
          transformer={translate}
          className="mr-[8px] flex-[1_1_50%]"
          handleChange={handleChange}
        />
        <Field
          name="parent2FirstName"
          label="Prénom"
          errors={errors}
          value={values.parent2FirstName}
          transformer={translate}
          className="flex-[1_1_50%]"
          handleChange={handleChange}
        />
      </div>
      <Field name="parent2Email" label="Email" errors={errors} value={values.parent2Email} transformer={translate} className="mb-[16px]" handleChange={handleChange} />
      <Field
        name="parent2OwnAddress"
        label="Adresse différente de celle du volontaire"
        errors={errors}
        type="select"
        value={values.parent2OwnAddress}
        options={[
          { value: "true", label: "Oui" },
          { value: "false", label: "Non" },
        ]}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      {values.parent2OwnAddress === "true" && (
        <>
          <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Adresse</div>
          <Field
            name="parent2Address"
            label="Adresse"
            errors={errors}
            value={values.parent2Address}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <div className="mb-[16px] flex items-start justify-between mt-[16px]">
            <Field
              name="parent2Zip"
              label="Code postal"
              errors={errors}
              value={values.parent2Zip}
              transformer={translate}
              className="mr-[8px] flex-[1_1_50%]"
              handleChange={handleChange}
            />
            <Field name="parent2City" label="Ville" errors={errors} value={values.parent2City} transformer={translate} className="flex-[1_1_50%]" handleChange={handleChange} />
          </div>
          <Field name="parent2Country" label="Pays" errors={errors} value={values.parent2Country} transformer={translate} className="flex-[1_1_50%]" handleChange={handleChange} />
        </>
      )}
    </>
  );
}

function Representant1({ values, handleChange, errors }) {
  return (
    <>
      <Field
        name="parent1Status"
        label="Statut"
        errors={errors}
        type="select"
        value={values.parent1Status}
        options={[
          { value: "mother", label: "Mère" },
          { value: "father", label: "Père" },
          { value: "representant", label: "Représentant légal" },
        ]}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      <div className="mb-[16px] flex items-start justify-between">
        <Field
          name="parent1LastName"
          label="Nom"
          errors={errors}
          value={values.parent1LastName}
          transformer={translate}
          className="mr-[8px] flex-[1_1_50%]"
          handleChange={handleChange}
        />
        <Field
          name="parent1FirstName"
          label="Prénom"
          errors={errors}
          value={values.parent1FirstName}
          transformer={translate}
          className="flex-[1_1_50%]"
          handleChange={handleChange}
        />
      </div>
      <Field name="parent1Email" label="Email" errors={errors} value={values.parent1Email} transformer={translate} className="mb-[16px]" handleChange={handleChange} />
      <Field
        name="parent1OwnAddress"
        label="Adresse différente de celle du volontaire"
        errors={errors}
        type="select"
        value={values.parent1OwnAddress}
        options={[
          { value: "true", label: "Oui" },
          { value: "false", label: "Non" },
        ]}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      {values.parent1OwnAddress === "true" && (
        <>
          <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Adresse</div>
          <Field
            name="parent1Address"
            label="Adresse"
            errors={errors}
            value={values.parent1Address}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <div className="mb-[16px] flex items-start justify-between mt-[16px]">
            <Field
              name="parent1Zip"
              label="Code postal"
              errors={errors}
              value={values.parent1Zip}
              transformer={translate}
              className="mr-[8px] flex-[1_1_50%]"
              handleChange={handleChange}
            />
            <Field name="parent1City" label="Ville" errors={errors} value={values.parent1City} transformer={translate} className="flex-[1_1_50%]" handleChange={handleChange} />
          </div>
          <Field name="parent1Country" label="Pays" errors={errors} value={values.parent1Country} transformer={translate} className="flex-[1_1_50%]" handleChange={handleChange} />
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
  const onChangeSituation = (e) => {
    setFieldValue("employed", youngEmployedSituationOptions.includes(e.target.value) ? "true" : "false");
    setFieldValue("schooled", youngSchooledSituationOptions.includes(e.target.value) ? "true" : "false");
    setFieldValue("situation", e.target.value);
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
      <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Situation</div>
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
      {values.schooled === "true" && (
        <div className="mt-[16px]">
          <SchoolEditor young={values} onChange={onChange} />
          <Field
            name="grade"
            label="Classe"
            type="select"
            errors={errors}
            value={values.grade}
            transformer={translate}
            className="flex-[1_1_50%]"
            options={gradeOptions}
            handleChange={handleChange}
          />
        </div>
      )}
      <div className="mt-[32px]">
        <div className="font-medium text-[12px] mt-[32px] text-[#242526] leading-snug mb-[8px]">Situations particulières</div>
        <FieldSituationsParticulieres name="specificSituations" young={values} mode={"edition"} onChange={onParticuliereChange} />
        {values.specificAmenagment === "true" && (
          <Field
            name="specificAmenagmentType"
            label="Nature de l'aménagement spécifique"
            errors={errors}
            value={values.specificAmenagmentType}
            mode="edition"
            onChange={handleChange}
            young={values}
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
      <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Date et lieu de naissance</div>
      <Field
        name="birthdateAt"
        label="Date de naissance"
        type="date"
        errors={errors}
        value={values.birthdateAt}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      <div className="mb-[16px] flex items-start justify-between">
        <Field
          name="birthCity"
          label="Ville de naissance"
          errors={errors}
          value={values.birthCity}
          transformer={translate}
          className="mr-[8px] flex-[1_1_50%]"
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

      <div className="font-medium text-[12px] mt-[32px] text-[#242526] leading-snug mb-[8px]">Adresse</div>
      <Field name="address" label="Adresse" errors={errors} value={values.address} transformer={translate} className="mb-[16px]" handleChange={handleChange} />
      <div className="mb-[16px] flex items-start justify-between">
        <Field name="zip" label="Code postal" errors={errors} value={values.zip} transformer={translate} className="mr-[8px] flex-[1_1_50%]" handleChange={handleChange} />
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
      <div className="flex items-start justify-between mt-[16px]">
        <Field
          name="department"
          label="Département"
          errors={errors}
          readyOnly={true}
          value={values.department}
          transformer={translate}
          className="mr-[8px] flex-[1_1_50%]"
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
      <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Identité et contact</div>
      <div className="mb-[16px] flex items-start justify-between">
        <Field name="lastName" label="Nom" errors={errors} value={values.lastName} transformer={translate} className="mr-[8px] flex-[1_1_50%]" handleChange={handleChange} />
        <Field name="firstName" label="Prénom" errors={errors} value={values.firstName} transformer={translate} className="flex-[1_1_50%]" handleChange={handleChange} />
      </div>
      <Field
        name="gender"
        label="Sexe"
        errors={errors}
        value={values.gender}
        className="mb-[16px]"
        type="select"
        options={genderOptions}
        transformer={translate}
        handleChange={handleChange}
      />
      <Field name="email" label="Email" errors={errors} value={values.email} className="mb-[16px]" transformer={translate} handleChange={handleChange} />
      <Field name="phone" label="Téléphone" errors={errors} value={values.phone} transformer={translate} handleChange={handleChange} />
      <div className="mt-[32px]">
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
        className="mb-[16px]"
        handleChange={handleChange}
      />
      {values.latestCNIFileExpirationDate !== null &&
        new Date(values.latestCNIFileExpirationDate).getTime() < sessions2023.find((session) => session.name === values.cohort).dateStart.getTime() && (
          <div className="mt-[16px] w-100 flex flew-row justify-between">
            <div>Attestation sur l&apos;honneur</div>
            {values.parentStatementOfHonorInvalidId === "true" ? (
              <a
                onClick={(e) => handleChangeBool(e, "false")}
                name="parentStatementOfHonorInvalidId"
                className="p-[10px] text-center leading-[22px] pt-[1px] pb-[1px] border-[0.5px] cursor-pointer border-[#D1D5DB] text-white bg-[#3B82F6] border rounded-[30px]">
                Validée
              </a>
            ) : (
              <a
                onClick={(e) => handleChangeBool(e, "true")}
                name="parentStatementOfHonorInvalidId"
                className="p-[10px] text-center leading-[22px] pt-[1px] pb-[1px] border-[0.5px] cursor-pointer border-[#D1D5DB] border rounded-[30px]">
                Non validée
              </a>
            )}
          </div>
        )}
    </>
  );
}
