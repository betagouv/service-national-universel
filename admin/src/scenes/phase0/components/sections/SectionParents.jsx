import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@snu/ds/admin";
import { toastr } from "react-redux-toastr";
import validator from "validator";

import { FieldsGroup } from "../FieldsGroup";
import Field from "../Field";
import {
  isPhoneNumberWellFormated,
  PHONE_ZONES,
  translate,
  translateGrade,
  YOUNG_STATUS,
  GRADES,
  getAge,
  YOUNG_SOURCE,
  translateEtbalissementSector,
  translateColoration,
} from "snu-lib";
import { filterDataForYoungSection } from "../../utils";
import { countryOptions, SPECIFIC_SITUATIONS_KEY, YOUNG_SCHOOLED_SITUATIONS, YOUNG_ACTIVE_SITUATIONS } from "../../commons";
import api from "@/services/api";

import FranceConnect from "@/assets/icons/FranceConnect";

import SectionContext from "../../context/SectionContext";
import Tabs from "../Tabs";
import FieldSituationsParticulieres from "../FieldSituationsParticulieres";
import SchoolEditor from "../SchoolEditor";
import { FileField } from "../FileField";
import PhoneField from "../PhoneField";
import Section from "../Section";
import { validateEmpty, getCorrectionRequest } from "../../utils";
import { MiniTitle } from "../commons/MiniTitle";

const PARENT_STATUS_OPTIONS = [
  { label: "Mère", value: "mother" },
  { label: "Père", value: "father" },
  { label: "Autre", value: "representant" },
];

const BOOLEAN_OPTIONS = [
  { value: "true", label: translate("true") },
  { value: "false", label: translate("false") },
];

const psc1Options = [
  { value: "true", label: "Oui" },
  { value: "false", label: "Non" },
  { value: null, label: "Non renseigné" },
];


export default function SectionParents({ young, onStartRequest, currentRequest, onCorrectionRequestChange, requests, globalMode, onChange, oldCohort, readonly }) {
  const [currentParent, setCurrentParent] = useState(1);
  const [hasSpecificSituation, setHasSpecificSituation] = useState(false);
  const [sectionMode, setSectionMode] = useState(globalMode);
  const [data, setData] = useState(filterDataForYoungSection(young, "parent"));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [youngAge, setYoungAge] = useState(0);
  const [situationOptions, setSituationOptions] = useState([]);
  const gradeOptions = Object.keys(GRADES).map((g) => ({ value: g, label: translateGrade(g) }));

  useEffect(() => {
    if (data) {
      if (data.grade === GRADES.NOT_SCOLARISE) {
        setSituationOptions(Object.keys(YOUNG_ACTIVE_SITUATIONS).map((s) => ({ value: s, label: translate(s) })));
      } else {
        setSituationOptions(Object.keys(YOUNG_SCHOOLED_SITUATIONS).map((s) => ({ value: s, label: translate(s) })));
      }
    }
    if (young) {
      setData({ ...young, psc1Info: young.psc1Info });
      setHasSpecificSituation(SPECIFIC_SITUATIONS_KEY.findIndex((key) => young[key] === "true") >= 0);
      setYoungAge(getAge(young.birthdateAt));
    } else {
      setData({});
      setHasSpecificSituation(false);
      setYoungAge(0);
    }
  }, [young]);

  function onSectionChangeMode(mode) {
    setSectionMode(mode === "default" ? globalMode : mode);
  }

  console.log(data.psc1Info);

  function onLocalChange(field, value) {
    const newData = { ...data, [field]: value };
    if (field === "grade") {
      if (value === GRADES.NOT_SCOLARISE) {
        newData.schooled = "false";
        if (!YOUNG_ACTIVE_SITUATIONS[data.situation]) {
          newData.situation = "";
        }
        setSituationOptions(Object.keys(YOUNG_ACTIVE_SITUATIONS).map((s) => ({ value: s, label: translate(s) })));
      } else {
        newData.schooled = "true";
        if (!YOUNG_SCHOOLED_SITUATIONS[data.situation]) {
          newData.situation = "";
        }
        setSituationOptions(Object.keys(YOUNG_SCHOOLED_SITUATIONS).map((s) => ({ value: s, label: translate(s) })));
      }
    }
    setData(newData);
  }

  function onSchoolChange(changes) {
    setData({ ...data, ...changes });
  }

  function onCancel() {
    setData({ ...young });
    setErrors({});
  }

  const trimmedPhones = {};
  if (data.parent1Phone) trimmedPhones[1] = data.parent1Phone.replace(/\s/g, "");
  if (data.parent2Phone) trimmedPhones[2] = data.parent2Phone.replace(/\s/g, "");

  async function onSave() {
    setSaving(true);
    if (validate()) {
      try {
        if (data.parent1Phone) data.parent1Phone = trimmedPhones[1];
        if (data.parent2Phone) data.parent2Phone = trimmedPhones[2];

        if (data.grade === GRADES.NOT_SCOLARISE) {
          data.schoolName = "";
          data.schoolType = "";
          data.schoolAddress = "";
          data.schoolComplementAdresse = "";
          data.schoolZip = "";
          data.schoolCity = "";
          data.schoolDepartment = "";
          data.schoolRegion = "";
          data.schoolCountry = "";
          data.schoolLocation = null;
          data.schoolId = "";
          data.academy = "";
        }

        const result = await api.put(`/young-edition/${young._id}/situationparents`, data);
        if (result.ok) {
          toastr.success("Les données ont bien été enregistrées.");
          setSectionMode(globalMode);
          onChange && onChange();
        } else {
          toastr.error("Erreur !", "Nous n'avons pas pu enregistrer les modifications. Veuillez réessayer dans quelques instants.");
        }
      } catch (err) {
        console.log(err);
        toastr.error("Erreur !", "Nous n'avons pas pu enregistrer les modifications. Veuillez réessayer dans quelques instants.");
      }
    }
    setSaving(false);
  }

  function validate() {
    let result = true;
    let errors = {};

    if (!data.parent1Status) return true;

    if (data.parent1Phone) data.parent1Phone = trimmedPhones[1];
    if (data.parent2Phone) data.parent2Phone = trimmedPhones[2];

    for (let parent = 1; parent <= (young.parent2Status ? 2 : 1); ++parent) {
      if (["", undefined].includes(data[`parent${parent}Email`]) || !validator.isEmail(data[`parent${parent}Email`])) {
        errors[`parent${parent}Email`] = "L'email ne semble pas valide";
        result = false;
      }
      if (!trimmedPhones[parent] || !data[`parent${parent}Phone`]) {
        errors[`parent${parent}Phone`] = "Le numéro de téléphone est obligatoire";
        result = false;
      }
      if (!trimmedPhones[parent]) {
        errors[`parent${parent}Phone`] = "Le numéro de téléphone est obligatoire";
        result = false;
      }
      if (trimmedPhones[parent] && trimmedPhones[parent] !== "" && !isPhoneNumberWellFormated(data[`parent${parent}Phone`], data[`parent${parent}PhoneZone`] || "AUTRE")) {
        errors[`parent${parent}Phone`] = PHONE_ZONES[data[`parent${parent}PhoneZone`] || "AUTRE"].errorMessage;
        result = false;
      }
      result = validateEmpty(data, `parent${parent}LastName`, errors) && result;
      result = validateEmpty(data, `parent${parent}FirstName`, errors) && result;
      if (!data[`parent${parent}OwnAddress`]) {
        errors[`parent${parent}OwnAddress`] = "Ce champ ne peut pas être vide";
        result = false;
      }
      if (data[`parent${parent}OwnAddress`] === "true") {
        result = validateEmpty(data, `parent${parent}Address`, errors) && result;
        result = validateEmpty(data, `parent${parent}Zip`, errors) && result;
        result = validateEmpty(data, `parent${parent}City`, errors) && result;
        result = validateEmpty(data, `parent${parent}Country`, errors) && result;
      }
      if (young.source === YOUNG_SOURCE.VOLONTAIRE) {
        if (!data.situation || data.situation === "") {
          errors["situation"] = "Ce champ ne peut pas être vide";
          result = false;
        }
        if (!data.grade || data.grade === "") {
          errors["grade"] = "Ce champ ne peut pas être vide";
          result = false;
        }
      }
    }
    setErrors(errors);
    return result;
  }

  const [isChecked, setIsChecked] = useState(young.sameSchoolCLE === "false");

  const handleCheckboxChange = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    setData({ ...data, sameSchoolCLE: newValue ? "false" : "true" });
  };

  function parentHasRequest(parentId) {
    return (
      requests &&
      requests.findIndex((req) => {
        return req.field.startsWith("parent" + parentId);
      }) >= 0
    );
  }

  const tabs = [{ label: "Représentant légal 1", value: 1, warning: parentHasRequest(1) || Object.keys(errors)?.some((error) => error.includes("parent1")) }];
  if (young.parent2Status) {
    tabs.push({ label: "Représentant légal 2", value: 2, warning: parentHasRequest(2) || Object.keys(errors)?.some((error) => error.includes("parent2")) });
  }

  function onParrentTabChange(tab) {
    setCurrentParent(tab);
    onStartRequest("");
  }

  return (
    <SectionContext.Provider value={{ errors }}>
      <Section
        step={globalMode === "correction" ? "Seconde étape :" : null}
        title={globalMode === "correction" ? "Vérifiez la situation et l'accord parental" : "Détails"}
        editable={young.status !== YOUNG_STATUS.DELETED && !readonly}
        mode={sectionMode}
        onChangeMode={onSectionChangeMode}
        saving={saving}
        onSave={onSave}
        onCancel={onCancel}
        containerNoFlex>
        <div className="flex">
          <div className="flex-[1_0_50%] pr-[56px]">
            <div>
              {young.source === YOUNG_SOURCE.VOLONTAIRE ? (
                <>
                  <MiniTitle>Situation</MiniTitle>
                  <Field
                    name="grade"
                    label="Classe"
                    value={data.grade}
                    transformer={translateGrade}
                    mode={sectionMode}
                    onStartRequest={onStartRequest}
                    currentRequest={currentRequest}
                    correctionRequest={getCorrectionRequest(requests, "grade")}
                    onCorrectionRequestChange={onCorrectionRequestChange}
                    type="select"
                    options={gradeOptions}
                    onChange={(value) => onLocalChange("grade", value)}
                    young={young}
                    className="flex-[1_1_50%]"
                  />
                  <Field
                    name="situation"
                    label="Statut"
                    value={data.situation}
                    transformer={translate}
                    mode={sectionMode}
                    className="mt-4 mb-4 flex-[1_1_50%]"
                    onStartRequest={onStartRequest}
                    currentRequest={currentRequest}
                    correctionRequest={getCorrectionRequest(requests, "situation")}
                    onCorrectionRequestChange={onCorrectionRequestChange}
                    type="select"
                    options={situationOptions}
                    onChange={(value) => onLocalChange("situation", value)}
                    young={young}
                  />
                  {data.schooled === "true" && (
                    <>
                      {sectionMode === "edition" ? (
                        <SchoolEditor young={data} onChange={onSchoolChange} />
                      ) : (
                        <>
                          <Field
                            name="schoolCity"
                            label="Ville de l'établissement"
                            value={data.schoolCity}
                            mode={sectionMode}
                            className="mb-[16px]"
                            onStartRequest={onStartRequest}
                            currentRequest={currentRequest}
                            correctionRequest={getCorrectionRequest(requests, "schoolCity")}
                            onCorrectionRequestChange={onCorrectionRequestChange}
                            onChange={(value) => onLocalChange("schoolCity", value)}
                            young={young}
                          />
                          <Field
                            name="schoolName"
                            label="Nom de l'établissement"
                            value={data.schoolName}
                            mode={sectionMode}
                            className="mb-[16px]"
                            onStartRequest={onStartRequest}
                            currentRequest={currentRequest}
                            correctionRequest={getCorrectionRequest(requests, "schoolName")}
                            onCorrectionRequestChange={onCorrectionRequestChange}
                            onChange={(value) => onLocalChange("schoolName", value)}
                            young={young}
                          />
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <MiniTitle>Classe engagée</MiniTitle>
                  <Field name="classeName" label="Nom" value={data?.classe?.name} mode="readonly" className="mb-[16px]" young={young} />
                  <div className="flex items-center gap-4">
                    <Field name="uniqueKeyAndId" label="Numéro d'identification" value={data?.classe?.uniqueKeyAndId} mode="readonly" className="mb-[16px] w-1/2" young={young} />
                    <Field
                      name="coloration"
                      label="Coloration"
                      value={data?.classe?.coloration}
                      mode="readonly"
                      className="mb-[16px] w-1/2"
                      young={young}
                      transformer={translateColoration}
                    />
                  </div>
                  <Link to={`/classes/${young.classeId}`} className="w-full ">
                    <Button type="tertiary" title="Voir la classe" className="w-full mb-[16px]" />
                  </Link>
                  <MiniTitle>Situation scolaire</MiniTitle>
                  <Field
                    name="classeStatus"
                    label="Statut"
                    value={data?.etablissement?.sector}
                    mode="readonly"
                    className="mb-[16px]"
                    young={young}
                    transformer={translateEtbalissementSector}
                  />
                  <Field name="etablissementCity" label="Ville de l'établissement" value={data?.etablissement?.city} mode="readonly" className="mb-[16px]" young={young} />
                  <Field name="classeGrade" label="Classe" value={data?.classe?.grade} mode="readonly" className="mb-[16px]" young={young} transformer={translateGrade} />
                  <div className="flex items-center">
                    <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} className="mr-2" />
                    <p className="text-xs font-base text-gray-900 mr-1">Situation de l’élève différente de celle de la Classe engagée</p>
                  </div>
                </>
              )}
            </div>
            {(sectionMode === "edition" || hasSpecificSituation) && (
              <div className="mt-[32px]">
                <MiniTitle>Situations particulières</MiniTitle>
                <FieldSituationsParticulieres
                  name="specificSituations"
                  young={data}
                  mode={sectionMode === "edition" ? "edition" : "readonly"}
                  onStartRequest={onStartRequest}
                  currentRequest={currentRequest}
                  correctionRequest={getCorrectionRequest(requests, "specificSituations")}
                  onCorrectionRequestChange={onCorrectionRequestChange}
                  onChange={onLocalChange}
                />
                {data.specificAmenagment === "true" && (
                  <Field
                    name="specificAmenagmentType"
                    label="Nature de l'aménagement spécifique"
                    value={data.specificAmenagmentType}
                    mode={sectionMode === "edition" ? "edition" : "readonly"}
                    onStartRequest={onStartRequest}
                    currentRequest={currentRequest}
                    correctionRequest={getCorrectionRequest(requests, "specificAmenagmentType")}
                    onCorrectionRequestChange={onCorrectionRequestChange}
                    onChange={(value) => onLocalChange("specificAmenagmentType", value)}
                    young={young}
                  />
                )}
              </div>
            )}
            <MiniTitle>Titulaire du PSC1</MiniTitle>
            <Field
              name="psc1Info"
              value={data?.psc1Info || "Non renseigné"}
              transformer={translate}
              mode={sectionMode}
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, "psc1Info")}
              onCorrectionRequestChange={onCorrectionRequestChange}
              type="select"
              options={psc1Options}
              onChange={(value) => onLocalChange("psc1Info", value)}
              young={young}
              className="flex-[1_1_50%]"
            />
          </div>
          <div className="my-[73px] w-[1px] flex-[0_0_1px] bg-[#E5E7EB]" />
          <div className="flex-[1_0_50%] pl-[56px]">
            <Tabs tabs={tabs} selected={currentParent} onChange={onParrentTabChange} />
            <div className="mt-[32px]">
              <Field
                name={`parent${currentParent}Status`}
                label="Statut"
                value={data[`parent${currentParent}Status`]}
                transformer={translate}
                mode={sectionMode}
                className="mb-[16px]"
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, `parent${currentParent}Status`)}
                onCorrectionRequestChange={onCorrectionRequestChange}
                type="select"
                options={PARENT_STATUS_OPTIONS}
                onChange={(value) => onLocalChange(`parent${currentParent}Status`, value)}
                young={young}
              />
              <div className="mb-[16px] flex">
                <Field
                  name={`parent${currentParent}LastName`}
                  label="Nom"
                  value={data[`parent${currentParent}LastName`]}
                  mode={sectionMode}
                  className="mr-[8px] flex-[1_1_50%]"
                  onStartRequest={onStartRequest}
                  currentRequest={currentRequest}
                  correctionRequest={getCorrectionRequest(requests, `parent${currentParent}LastName`)}
                  onCorrectionRequestChange={onCorrectionRequestChange}
                  onChange={(value) => onLocalChange(`parent${currentParent}LastName`, value)}
                  young={young}
                />
                <Field
                  name={`parent${currentParent}FirstName`}
                  label="Prénom"
                  value={data[`parent${currentParent}FirstName`]}
                  mode={sectionMode}
                  className="ml-[8px] flex-[1_1_50%]"
                  onStartRequest={onStartRequest}
                  currentRequest={currentRequest}
                  correctionRequest={getCorrectionRequest(requests, `parent${currentParent}FirstName`)}
                  onCorrectionRequestChange={onCorrectionRequestChange}
                  onChange={(value) => onLocalChange(`parent${currentParent}FirstName`, value)}
                  young={young}
                />
              </div>
              <Field
                name={`parent${currentParent}Email`}
                label="Email"
                value={data[`parent${currentParent}Email`]}
                mode={sectionMode}
                className="mb-[16px]"
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, `parent${currentParent}Email`)}
                onCorrectionRequestChange={onCorrectionRequestChange}
                onChange={(value) => onLocalChange(`parent${currentParent}Email`, value)}
                young={young}
                copy={true}
              />
              <PhoneField
                name={`parent${currentParent}Phone`}
                className="mb-[16px]"
                young={young}
                value={data[`parent${currentParent}Phone`]}
                onChange={(value) => onLocalChange(`parent${currentParent}Phone`, value)}
                zoneValue={data[`parent${currentParent}PhoneZone`]}
                onChangeZone={(value) => onLocalChange(`parent${currentParent}PhoneZone`, value)}
                mode={sectionMode}
                placeholder={PHONE_ZONES[data[`parent${currentParent}PhoneZone`]]?.example}
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, `parent${currentParent}Phone`)}
                onCorrectionRequestChange={onCorrectionRequestChange}
              />
              <Field
                name={`parent${currentParent}OwnAddress`}
                label="Adresse différente de celle du volontaire"
                value={data[`parent${currentParent}OwnAddress`]}
                transformer={translate}
                mode={sectionMode === "edition" ? "edition" : "readonly"}
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, `parent${currentParent}OwnAddress`)}
                onCorrectionRequestChange={onCorrectionRequestChange}
                type="select"
                options={BOOLEAN_OPTIONS}
                onChange={(value) => onLocalChange(`parent${currentParent}OwnAddress`, value)}
                young={young}
              />
              {data[`parent${currentParent}OwnAddress`] === "true" && (
                <FieldsGroup
                  name={`parent${currentParent}Address`}
                  mode={sectionMode === "edition" ? "edition" : "readonly"}
                  title="Adresse"
                  noflex
                  className="mt-[16px]"
                  onStartRequest={onStartRequest}
                  currentRequest={currentRequest}
                  correctionRequest={getCorrectionRequest(requests, `parent${currentParent}Address`)}
                  onCorrectionRequestChange={onCorrectionRequestChange}
                  young={young}>
                  <Field
                    name={`parent${currentParent}Address`}
                    label="Adresse"
                    value={data[`parent${currentParent}Address`] || ""}
                    mode={sectionMode}
                    className="mb-[16px]"
                    onChange={(value) => onLocalChange(`parent${currentParent}Address`, value)}
                    young={young}
                  />
                  <Field
                    name={`parent${currentParent}Zip`}
                    label="Code postal"
                    value={data[`parent${currentParent}Zip`] || ""}
                    mode={sectionMode}
                    className="mr-[8px] mb-[16px] inline-block w-[calc(50%-8px)]"
                    onChange={(value) => onLocalChange(`parent${currentParent}Zip`, value)}
                    young={young}
                  />
                  <Field
                    name={`parent${currentParent}City`}
                    label="Ville"
                    value={data[`parent${currentParent}City`] || ""}
                    mode={sectionMode}
                    className="ml-[8px] mb-[16px] inline-block w-[calc(50%-8px)]"
                    onChange={(value) => onLocalChange(`parent${currentParent}City`, value)}
                    young={young}
                  />
                  <Field
                    name={`parent${currentParent}Country`}
                    label="Pays"
                    value={data[`parent${currentParent}Country`] || ""}
                    mode={sectionMode}
                    className="mb-[16px]"
                    type="select"
                    options={countryOptions}
                    filterOnType
                    onChange={(value) => onLocalChange(`parent${currentParent}Country`, value)}
                    young={young}
                  />
                </FieldsGroup>
              )}
              {data[`parent${currentParent}FromFranceConnect`] === "true" && (
                <div className="mt-[16px] flex items-center rounded-[7px] bg-[#F9FAFB] p-[18px]">
                  <FranceConnect className="mr-[28px] flex-[0_0_100px]" />
                  <div>
                    <div className="text-bold mb-[6px] text-[14px] leading-[20px] text-[#242526]">Attestation des représentants légaux</div>
                    <div className="grow text-[12px] leading-[20px] text-[#000000]">
                      Consentement parental validé via FranceConnect. Les représentants légaux ont utilisé FranceConnect pour s’identifier et consentir, ce qui permet de
                      s’affranchir du formulaire de consentement numérique.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {oldCohort && (
          <div className="mt-[32px] flex">
            <div className="flex-[1_0_50%] pr-[56px]">
              {data.motivations && (
                <div>
                  <div className="">Motivations</div>
                  <div className="">&laquo;&nbsp;{data.motivations}&nbsp;&raquo;</div>
                </div>
              )}
            </div>
            <div className="my-[73px] w-[1px] flex-[0_0_1px] bg-[#E5E7EB]" />
            <div className="flex-[1_0_50%] pl-[56px]">
              <FileField
                mode={sectionMode}
                young={data}
                label="Droit à l'image"
                onChange={onLocalChange}
                statusField="imageRightFilesStatus"
                fileType="imageRightFiles"
                updateYoung={onChange}
              />
              {youngAge && youngAge < 15 && (
                <FileField mode={sectionMode} young={data} label="Accord pour les mineurs de moins de 15 ans" fileType="parentConsentmentFiles" updateYoung={onChange} />
              )}
            </div>
          </div>
        )}
      </Section>
    </SectionContext.Provider>
  );
}
