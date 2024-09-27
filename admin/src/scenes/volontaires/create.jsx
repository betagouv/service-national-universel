import React, { useState } from "react";
import validator from "validator";

import { translate } from "@/utils";
import api from "@/services/api";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
import { useHistory, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";
import { HiInformationCircle } from "react-icons/hi";

import { translateGrade, GRADES, YOUNG_STATUS, getCohortPeriod, getCohortYear, isPhoneNumberWellFormated, PHONE_ZONES, YOUNG_SOURCE, getSchoolYear } from "snu-lib";
import { youngSchooledSituationOptions, youngActiveSituationOptions, youngEmployedSituationOptions } from "../phase0/commons";
import dayjs from "@/utils/dayjs.utils";
import MiniSwitch from "../phase0/components/MiniSwitch";
import RadioButton from "../phase0/components/RadioButton";
import { Spinner } from "reactstrap";

//Identite
import Field from "@/components/ui/forms/Field";
import SchoolEditor from "../phase0/components/SchoolEditor";
import VerifyAddress from "../phase0/components/VerifyAddress";
import FieldSituationsParticulieres from "../phase0/components/FieldSituationsParticulieres";
import Check from "@/assets/icons/Check";
import PhoneField from "../phase0/components/PhoneField";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";

export default function Create() {
  const history = useHistory();
  const location = useLocation();
  const [selectedRepresentant, setSelectedRepresentant] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cohorts, setCohorts] = useState([]);
  const [classe, setClasse] = useState([]);
  const [egibilityError, setEgibilityError] = useState("");
  const [isComplememtaryListModalOpen, setComplememtaryListModalOpen] = useState(false);
  const user = useSelector((state) => state.Auth.user);
  const classeId = new URLSearchParams(location.search).get("classeId");

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
    frenchNationality: "",
  });

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
      "parent1Status",
      "parent1LastName",
      "parent1FirstName",
      "situation",
      "address",
      "city",
      "zip",
      "frenchNationality",
      "grade",
    ];

    if (classeId) values.classeId = classeId;

    for (const key of required) {
      if (values[key] === null || !values[key] || validator.isEmpty(values[key], { ignore_whitespace: true })) {
        errors[key] = errorEmpty;
      }
    }

    if (values.temporaryDate === null) {
      errors.temporaryDate = errorEmpty;
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

    if (!classeId) {
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
    if (values.parentAllowSNU === "false" || values.parentAllowSNU === "") {
      errors.parentAllowSNU = errorEmpty;
    }
    if (values.rulesParent1 === "false") {
      errors.rulesParent1 = errorEmpty;
    }

    if (Object.keys(errors).length > 0) {
      console.log(errors);
      toastr.error("Le formulaire n'est pas complet");
    }
    return errors;
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
    if (classeId) {
      sendData();
    } else {
      const res = await api.get(`/inscription-goal/${values.cohort}/department/${values.department}`);
      if (!res.ok) throw new Error(res);
      const fillingRate = res.data;
      if (fillingRate >= 1) {
        setComplememtaryListModalOpen(true);
      } else {
        sendData();
      }
    }
  };

  const sendData = async (status = YOUNG_STATUS.WAITING_VALIDATION) => {
    try {
      setLoading(true);
      values.addressVerified = values.addressVerified.toString();
      // necessaire ?
      const { ok, code, young } = await api.post("/young/invite", { ...values, status });
      if (!ok) {
        toastr.error("Une erreur s'est produite :", translate(code));
      } else {
        toastr.success("Le volontaire a bien été créé");
        history.push(`/volontaire/${young._id}`);
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant la création du volontaire :", translate(e.code));
    }
  };

  const getClasseCohort = async (classeId) => {
    const { data, ok, code } = await api.get(`/cle/classe/${classeId}`);
    if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
    setClasse(data);
    setValues((prevValues) => ({ ...prevValues, cohort: data.cohort }));
  };

  React.useEffect(() => {
    //si CLE, le ref ne choisis pas la cohort du jeune, elle est lié a sa classe
    if (classeId) {
      getClasseCohort(classeId);
    }
  }, [classeId]);

  React.useEffect(() => {
    if (!values.temporaryDate) return;
    setFieldValue("birthdateAt", dayjs(values.temporaryDate).format("YYYY-MM-DD"));
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
          const res = await api.post(`/cohort-session/eligibility/2023`, body);
          if (res.data.msg) return setEgibilityError(res.data.msg);
          if (res.data.length === 0) {
            setEgibilityError("Il n'y a malheureusement plus de séjour disponible.");
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
            L&apos;objectif d&apos;inscription de votre département a été atteint à 100%. Le dossier d&apos;inscription de {values.firstName} {values.lastName} va être{" "}
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
            <Identite values={values} handleChange={handleChange} errors={errors} setFieldValue={setFieldValue} />
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
            <Situation
              values={values}
              handleChange={handleChange}
              required={{ situation: true }}
              errors={errors}
              setFieldValue={setFieldValue}
              classeId={classeId}
              classe={classe}
            />
          </div>
          <div className="my-16 flex-[0_0_1px] bg-[#E5E7EB]" />
          <div className="flex-[1_0_50%] pl-14 pr-8">
            <div className="ml-5 mb-4 flex items-start justify-start">
              <div onClick={() => setSelectedRepresentant(1)} className={`cursor-pointer pb-4 ${selectedRepresentant === 1 && "border-b-4 text-[#3B82F6]"} mr-9 border-[#3B82F6]`}>
                Représentant légal&nbsp;1
              </div>
              <div onClick={() => setSelectedRepresentant(2)} className={`cursor-pointer pb-4 ${selectedRepresentant === 2 && "border-b-4 text-[#3B82F6]"} mr-9 border-[#3B82F6]`}>
                Représentant légal&nbsp;2
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

      {!classeId && (cohorts.length > 0 || egibilityError !== "") && (
        <div className="relative mb-4 rounded bg-white pt-4 shadow">
          <div className="ml-8 text-lg font-normal">Choisissez un séjour pour le volontaire</div>
          {egibilityError !== "" && <div className="ml-8 pb-4">{egibilityError}</div>}
          <div className="flex flex-row flex-wrap justify-start px-3">
            {egibilityError === "" &&
              //filter all chort with CLE in the name regex
              cohorts
                .filter((session) => !session.name.match(/CLE/))
                .map((session) => (
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

      {values.cohort &&
        values.firstName !== "" &&
        values.lastName !== "" &&
        values.parent1FirstName !== "" &&
        values.parent1LastName !== "" &&
        values.parent1Email !== "" &&
        values.parent1Status !== "" &&
        values.temporaryDate !== null &&
        (cohorts.length > 0 || classeId) &&
        egibilityError === "" && (
          <div className="relative mb-4 rounded bg-white pt-4 shadow">
            <div className="ml-8 mb-6 text-lg font-normal">Consentements</div>
            <div className={"flex px-8 pb-14"}>
              <SectionConsentements young={values} setFieldValue={setFieldValue} errors={errors} cohort={values.cohort} />
            </div>
          </div>
        )}
      {egibilityError === "" && (
        <div className="w-100 flex items-center justify-center">
          <div onClick={handleSubmit} className="w-80 cursor-pointer self-center rounded-md bg-[#2563EB] py-2 px-4 text-center text-white">
            {!loading ? "Créer l'inscription" : <Spinner size="sm" style={{ borderWidth: "0.1em", color: "white" }} />}
          </div>
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
        error={parent === "1" ? errors?.parent1Status : errors?.parent2Status}
        type="select"
        value={parent === "1" ? values.parent1Status : values.parent2Status}
        options={[
          { value: "mother", label: "Mère" },
          { value: "father", label: "Père" },
          { value: "representant", label: "Représentant légal" },
        ]}
        transformer={translate}
        className="mb-4"
        onChange={(value, key) => setFieldValue(key, value)}
      />
      <div className="mb-4 flex items-start justify-between">
        <Field
          name={parent === "1" ? "parent1LastName" : "parent2LastName"}
          label="Nom"
          error={parent === "1" ? errors?.parent1LastName : errors?.parent2LastName}
          value={parent === "1" ? values.parent1LastName : values.parent2LastName}
          transformer={translate}
          className="mr-2 flex-[1_1_50%]"
          onChange={(value, name) => handleChange({ target: { name, value } })}
        />
        <Field
          name={parent === "1" ? "parent1FirstName" : "parent2FirstName"}
          label="Prénom"
          error={parent === "1" ? errors?.parent1FistName : errors?.parent2FistName}
          value={parent === "1" ? values.parent1FirstName : values.parent2FirstName}
          transformer={translate}
          className="flex-[1_1_50%]"
          onChange={(value, name) => handleChange({ target: { name, value } })}
        />
      </div>
      <Field
        name={parent === "1" ? "parent1Email" : "parent2Email"}
        label="Email"
        error={parent === "1" ? errors?.parent1Email : errors?.parent2Email}
        value={parent === "1" ? values.parent1Email : values.parent2Email}
        transformer={translate}
        className="mb-4"
        onChange={(value, name) => handleChange({ target: { name, value } })}
      />
      <PhoneField
        name={`parent${parent}Phone`}
        mode="edition"
        className="mb-4"
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
        error={parent === "1" ? errors?.parent1OwnAddress : errors?.parent2OwnAddress}
        type="select"
        value={parent === "1" ? values.parent1OwnAddress : values.parent2OwnAddress}
        options={[
          { value: "true", label: "Oui" },
          { value: "false", label: "Non" },
        ]}
        transformer={translate}
        className="mb-4"
        onChange={(value, key) => setFieldValue(key, value)}
      />
      {(parent === "1" ? values.parent1OwnAddress : values.parent2OwnAddress) === "true" && (
        <>
          <div className="mb-2 text-xs font-medium leading-snug text-[#242526]">Adresse</div>
          <Field
            name={parent === "1" ? "parent1Address" : "parent2Address"}
            label="Adresse"
            error={parent === "1" ? errors?.parent1Address : errors?.parent2Address}
            value={parent === "1" ? values.parent1Address : values.parent2Address}
            transformer={translate}
            className="flex-[1_1_50%]"
            onChange={(value, name) => handleChange({ target: { name, value } })}
          />
          <div className="my-4 flex items-start justify-between">
            <Field
              name={parent === "1" ? "parent1Zip" : "parent2Zip"}
              label="Code postal"
              error={parent === "1" ? errors?.parent1Zip : errors?.parent2Zip}
              value={parent === "1" ? values.parent1Zip : values.parent2Zip}
              transformer={translate}
              className="mr-2 flex-[1_1_50%]"
              onChange={(value, name) => handleChange({ target: { name, value } })}
            />
            <Field
              name={parent === "1" ? "parent1City" : "parent2City"}
              label="Ville"
              error={parent === "1" ? errors?.parent1City : errors?.parent2City}
              value={parent === "1" ? values.parent1City : values.parent2City}
              transformer={translate}
              className="flex-[1_1_50%]"
              onChange={(value, name) => handleChange({ target: { name, value } })}
            />
          </div>
          <Field
            name={parent === "1" ? "parent1Country" : "parent2Country"}
            label="Pays"
            error={parent === "1" ? errors?.parent1Country : errors?.parent2Country}
            value={parent === "1" ? values.parent1Country : values.parent2Country}
            transformer={translate}
            className="flex-[1_1_50%]"
            onChange={(value, name) => handleChange({ target: { name, value } })}
          />
        </>
      )}
    </>
  );
}

function Situation({ values, handleChange, errors, setFieldValue, classeId, classe }) {
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

  const onChangePSC1 = (key, value) => {
    setFieldValue("psc1Info", value);
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

  const classeGrades = classe.grades.reduce((acc, grade) => {
    acc[grade] = grade;
    return acc;
  }, {});
  const classeType = classeId ? classeGrades : GRADES;
  const gradeOptions = Object.keys(classeType).map((g) => ({ value: g, label: translateGrade(g) }));
  const psc1Options = [
    { value: "true", label: "Oui" },
    { value: "false", label: "Non" },
    { value: null, label: "Non renseigné" },
  ];
  return (
    <>
      <div className="mb-2 text-xs font-medium leading-snug text-[#242526]">Situation</div>
      <Field
        name="grade"
        label="Classe"
        type="select"
        error={errors?.grade}
        value={values.grade}
        transformer={translate}
        className="flex-[1_1_50%]"
        options={gradeOptions}
        onChange={(value, key) => onChangeGrade(key, value)}
      />
      {values.schooled !== "" && (
        <Field
          name="situation"
          label="Statut"
          type="select"
          error={errors?.situation}
          value={values.situation}
          transformer={translate}
          className="mt-4 flex-[1_1_50%]"
          options={values.schooled === "true" ? youngSchooledSituationOptions : youngActiveSituationOptions}
          onChange={(value, key) => onChangeSituation(key, value)}
        />
      )}
      <div className="mt-[16px]">
        <div className="flex flex">
          <h1 className="mb-2 text-xs font-medium leading-snug text-[#242526]">Titulaire du PSC1</h1>
          <HiInformationCircle data-tip data-for="psc1Info" className="mt-0.5 ml-1 text-gray-400" />
        </div>
        <ReactTooltip id="psc1Info" className="bg-white shadow-xl" arrowColor="white" place="right">
          <div className="text-xs text-[#414458]">Information déclarée par le volontaire lors de son inscription </div>
        </ReactTooltip>
        <Field
          name="psc1Info"
          value={values?.psc1Info || "Non renseigné"}
          transformer={translate}
          type="select"
          options={psc1Options}
          // onChange={(value) => onLocalChange("psc1Info", value)}
          onChange={(value, key) => onChangePSC1(key, value)}
          young={values}
          className="flex-[1_1_50%]"
        />
      </div>
      {values.situation !== "" && values.schooled === "true" && !classeId && (
        <div className="mt-4">
          <SchoolEditor showBackgroundColor={false} young={values} onChange={onChange} />
        </div>
      )}
      <div className="mt-8">
        <div className="mt-8 mb-2 text-xs font-medium leading-snug text-[#242526]">Situations particulières</div>
        <FieldSituationsParticulieres name="specificSituations" young={values} mode="edition" onChange={(key, value) => setFieldValue(key, value)} />
        {values.specificAmenagment === "true" && (
          <Field
            name="specificAmenagmentType"
            label="Nature de l'aménagement spécifique"
            error={errors?.specificAmenagmentType}
            value={values.specificAmenagmentType}
            mode="edition"
            onChange={(value, name) => handleChange({ target: { name, value } })}
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
        error={errors?.temporaryDate}
        value={values.temporaryDate}
        transformer={translate}
        className="mb-4"
        onChange={(date, key) => setFieldValue(key, date)}
      />
      <div className="mb-4 flex items-start justify-between">
        <Field
          name="birthCity"
          label="Ville de naissance"
          error={errors?.birthCity}
          value={values.birthCity}
          transformer={translate}
          className="mr-2 flex-[1_1_50%]"
          onChange={(value, name) => handleChange({ target: { name, value } })}
        />
        <Field
          name="birthCityZip"
          label="Code postal de naissance"
          error={errors?.birthCityZip}
          value={values.birthCityZip}
          transformer={translate}
          className="flex-[1_1_50%]"
          onChange={(value, name) => handleChange({ target: { name, value } })}
        />
      </div>
      <Field
        name="birthCountry"
        label="Pays de naissance"
        error={errors?.birthCountry}
        value={values.birthCountry}
        transformer={translate}
        className="flex-[1_1_50%]"
        onChange={(value, name) => handleChange({ target: { name, value } })}
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
        error={liveInFrance ? errors?.address : errors?.foreignAddress}
        value={liveInFrance ? values.address : values.foreignAddress}
        transformer={translate}
        className="mb-4"
        onChange={(value, name) => handleAdressChange({ target: { name, value } })}
      />
      {!liveInFrance && (
        <Field
          name="foreignCountry"
          type="select"
          options={countries ? countries.map((c) => ({ value: c, label: c })) : []}
          label="Pays"
          error={errors?.foreignCountry}
          filterOnType
          value={values.foreignCountry}
          transformer={translate}
          className="mb-4"
          onChange={(value, key) => setFieldValue(key, value)}
        />
      )}
      <div className="mb-4 flex items-start justify-between">
        <Field
          name={liveInFrance ? "zip" : "foreignZip"}
          label="Code postal"
          error={liveInFrance ? errors?.zip : errors?.foreignZip}
          value={liveInFrance ? values.zip : values.foreignZip}
          transformer={translate}
          className="mr-2 flex-[1_1_50%]"
          onChange={(value, name) => handleAdressChange({ target: { name, value } })}
        />
        <Field
          name={liveInFrance ? "city" : "foreignCity"}
          label="Ville"
          error={liveInFrance ? errors?.city : errors?.foreignCity}
          value={liveInFrance ? values.city : values.foreignCity}
          transformer={translate}
          className="flex-[1_1_50%]"
          onChange={(value, name) => handleAdressChange({ target: { name, value } })}
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
            <Field
              className="mr-2 flex-[1_1_50%]"
              name="hostFirstName"
              value={values.hostFirstName}
              label="Prénom de l’hébergeur"
              onChange={(value, name) => handleChange({ target: { name, value } })}
              error={errors?.hostFirstName}
            />
            <Field
              className="flex-[1_1_50%]"
              name="hostLastName"
              value={values.hostLastName}
              label="Nom de l’hébergeur"
              onChange={(value, name) => handleChange({ target: { name, value } })}
              error={errors?.hostLastName}
            />
          </div>
          <Field
            options={hostRelationshipOptions}
            name="hostRelationship"
            value={values.hostRelationship}
            type="select"
            label="Précisez votre lien avec l’hébergeur"
            className="mb-4"
            onChange={(value, key) => setFieldValue(key, value)}
            error={errors?.hostRelationship}
          />
          <Field value={values.address} name="address" label="Son adresse" onChange={(value, name) => handleAdressChange({ target: { name, value } })} error={errors?.address} />
          <div className="my-4 flex items-start justify-between">
            <Field
              name="zip"
              label="Code postal"
              error={errors?.zip}
              value={values.zip}
              transformer={translate}
              className="mr-2 flex-[1_1_50%]"
              onChange={(value, name) => handleAdressChange({ target: { name, value } })}
            />
            <Field
              name="city"
              label="Ville"
              error={errors?.city}
              value={values.city}
              transformer={translate}
              className="flex-[1_1_50%]"
              onChange={(value, name) => handleAdressChange({ target: { name, value } })}
            />
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

function Identite({ values, handleChange, errors, setFieldValue }) {
  const genderOptions = [
    { value: "male", label: "Homme" },
    { value: "female", label: "Femme" },
  ];
  const nationalityOptions = [
    { value: "true", label: translate("true") },
    { value: "false", label: translate("false") },
  ];
  const user = useSelector((state) => state.Auth.user);
  const handleChangeBool = (e, value) => {
    e.target.value = value;
    handleChange(e);
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
        <Field
          name="lastName"
          label="Nom"
          error={errors?.lastName}
          value={values.lastName}
          transformer={translate}
          className="mr-2 flex-[1_1_50%]"
          onChange={(value, name) => handleChange({ target: { name, value } })}
        />
        <Field
          name="firstName"
          label="Prénom"
          error={errors?.firstName}
          value={values.firstName}
          transformer={translate}
          className="flex-[1_1_50%]"
          onChange={(value, name) => handleChange({ target: { name, value } })}
        />
      </div>
      <Field
        name="gender"
        label="Sexe"
        error={errors?.gender}
        value={values.gender}
        className="mb-4"
        type="select"
        options={genderOptions}
        transformer={translate}
        onChange={(value, key) => setFieldValue(key, value)}
      />
      <Field
        name="email"
        label="Email"
        error={errors?.email}
        value={values.email}
        className="mb-4"
        transformer={translate}
        onChange={(value, name) => handleChange({ target: { name, value } })}
      />
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
        <Field
          name="frenchNationality"
          label="Nationalité Française"
          value={values.frenchNationality}
          error={errors?.frenchNationality}
          mode="edition"
          className="mb-[16px]"
          type="select"
          options={nationalityOptions}
          transformer={translate}
          onChange={(value, key) => setFieldValue(key, value)}
        />
      </div>
    </>
  );
}

const PARENT_STATUS_NAME = {
  father: "Le père",
  mother: "La mère",
  representant: "Le représentant légal",
};
function SectionConsentements({ young, setFieldValue, errors, cohort }) {
  const [volontaireConsentement, setVolontaireConsentement] = React.useState({
    acceptCGU1: false,
    consentment1: false,
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
    if (volontaireConsentement.acceptCGU1) {
      setFieldValue("acceptCGU", "true");
    } else {
      setFieldValue("acceptCGU", "false");
    }
    if (volontaireConsentement.consentment1) {
      setFieldValue("consentment", "true");
    } else {
      setFieldValue("consentment", "false");
    }
  }, [volontaireConsentement]);

  React.useEffect(() => {
    if (parent1Consentement.allow1 && parent1Consentement.allow2 && parent1Consentement.allow3 && parent1Consentement.allow4 && parent1Consentement.allowGeneral) {
      setFieldValue("parent1AllowSNU", "true");
    } else {
      setFieldValue("parent1AllowSNU", "false");
    }
  }, [parent1Consentement]);

  const cohortYear = young.source === YOUNG_SOURCE.CLE ? getSchoolYear(young.etablissement) : getCohortYear(young.cohort);

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
          <CheckRead name="consentment" onClick={() => handleVolontaireChange("consentment1")} errors={errors} value={volontaireConsentement.consentment1}>
            Se porte volontaire pour participer à la session <b>{cohortYear}</b> du Service National Universel qui comprend la participation à un séjour de cohésion puis la
            réalisation d&apos;une mission d&apos;intérêt général.
          </CheckRead>
          <CheckRead name="acceptCGU" onClick={() => handleVolontaireChange("acceptCGU1")} errors={errors} value={volontaireConsentement.acceptCGU1}>
            S&apos;inscrit pour le séjour de cohésion <strong>{getCohortPeriod(cohort)}</strong> sous réserve de places disponibles et s&apos;engage à en respecter le règlement
            intérieur.
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
          <div className="whitespace-nowrap text-[13px] font-normal text-[#1F2937]">{dayjs(young.parent1ValidationDate).format("DD/MM/YYYY HH:mm")}</div>
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
          à s&apos;engager comme volontaire du Service National Universel et à participer à une session <b>{cohortYear}</b> du SNU.
        </div>
        <div>
          <CheckRead name="parent1AllowSNU" onClick={() => handleParent1Change("allow1")} errors={errors} value={parent1Consentement.allow1}>
            Confirme être titulaire de l&apos;autorité parentale/représentant(e) légal(e) de{" "}
            <b>
              {young.firstName} {young.lastName}
            </b>
            .
          </CheckRead>
          <CheckRead name="parent1AllowSNU" onClick={() => handleParent1Change("allow3")} errors={errors} value={parent1Consentement.allow3}>
            S&apos;engage à communiquer la fiche sanitaire de{" "}
            <b>
              {young.firstName} {young.lastName}
            </b>{" "}
            au responsable du séjour de cohésion.
          </CheckRead>
          <CheckRead name="parent1AllowSNU" onClick={() => handleParent1Change("allow4")} errors={errors} value={parent1Consentement.allow4}>
            S&apos;engage à ce que{" "}
            <b>
              {young.firstName} {young.lastName}
            </b>{" "}
            , à la date du séjour de cohésion, ait satisfait aux obligations vaccinales en vigueur.
          </CheckRead>
          <CheckRead name="rulesParent1" onClick={() => handleConsentementChange("rulesParent1")} errors={errors} value={young.rulesParent1 === "true"}>
            Reconnait avoir pris connaissance du Règlement Intérieur du séjour de cohésion.
          </CheckRead>
          <CheckRead name="parent1AllowSNU" onClick={() => handleParent1Change("allow2")} errors={errors} value={parent1Consentement.allow2}>
            Accepte la collecte et le traitement des données personnelles de{" "}
            <b>
              {young.firstName} {young.lastName}{" "}
            </b>
            dans le cadre d’une mission d’intérêt public.
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
              <div className="whitespace-nowrap text-[13px] font-normal text-[#1F2937]">{dayjs(young.parent2ValidationDate).format("DD/MM/YYYY HH:mm")}</div>
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
