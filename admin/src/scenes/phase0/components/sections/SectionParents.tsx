import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@snu/ds/admin";
import { toastr } from "react-redux-toastr";
import ReactTooltip from "react-tooltip";
import validator from "validator";
import { HiInformationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import cx from "classnames";

import { ClasseDto, EtablissementDto, YoungDto } from "snu-lib";

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
  translateEtablissementSector,
  translateColoration,
  departmentToAcademy,
  region2zone,
  ROLES,
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

interface ParentStatusOption {
  label: string;
  value: string;
}

interface BooleanOption {
  value: string;
  label: string;
}

interface Tab {
  label: string;
  value: number;
  warning: boolean;
}

interface ExtendedYoungDto extends YoungDto {
  classe?: ClasseDto;
  etablissement?: EtablissementDto;
}

interface SectionParentsProps {
  young: ExtendedYoungDto;
  onStartRequest: (field: string) => void;
  currentRequest: string;
  onCorrectionRequestChange: (field: string, value: any) => void;
  requests: any[];
  globalMode: string;
  onChange?: () => void;
  oldCohort?: boolean;
  readonly?: boolean;
  isPrecompte?: boolean;
}

const PARENT_STATUS_OPTIONS: ParentStatusOption[] = [
  { label: "Mère", value: "mother" },
  { label: "Père", value: "father" },
  { label: "Autre", value: "representant" },
];

const BOOLEAN_OPTIONS: BooleanOption[] = [
  { value: "true", label: translate("true") },
  { value: "false", label: translate("false") },
];

const psc1Options: BooleanOption[] = [
  { value: "true", label: "Oui" },
  { value: "false", label: "Non" },
  { value: "", label: "Non renseigné" },
];

export default function SectionParents({
  young,
  onStartRequest,
  currentRequest,
  onCorrectionRequestChange,
  requests,
  globalMode,
  isPrecompte,
  onChange,
  oldCohort,
  readonly,
}: SectionParentsProps) {
  const [currentParent, setCurrentParent] = useState<number>(1);
  const [hasSpecificSituation, setHasSpecificSituation] = useState<boolean>(false);
  const [sectionMode, setSectionMode] = useState<string>(globalMode);
  const [youngFiltered, setYoungFiltered] = useState<ExtendedYoungDto>(filterDataForYoungSection(young, "parent") as ExtendedYoungDto);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [youngAge, setYoungAge] = useState<number>(0);
  const [situationOptions, setSituationOptions] = useState<ParentStatusOption[]>([]);
  const gradeOptions = Object.keys(GRADES).map((g) => ({ value: g, label: translateGrade(g) }));
  const user = useSelector((state: any) => state.Auth.user);

  useEffect(() => {
    if (youngFiltered) {
      if (youngFiltered.grade === GRADES.NOT_SCOLARISE) {
        setSituationOptions(Object.keys(YOUNG_ACTIVE_SITUATIONS).map((s) => ({ value: s, label: translate(s) })));
      } else {
        setSituationOptions(Object.keys(YOUNG_SCHOOLED_SITUATIONS).map((s) => ({ value: s, label: translate(s) })));
      }
    }
    if (young) {
      setYoungFiltered({ ...young });
      setHasSpecificSituation(SPECIFIC_SITUATIONS_KEY.findIndex((key) => young[key] === "true") >= 0);
      setYoungAge(getAge(young.birthdateAt || new Date()) as number);
    } else {
      setYoungFiltered({} as ExtendedYoungDto);
      setHasSpecificSituation(false);
      setYoungAge(0);
    }
  }, [young]);

  function onSectionChangeMode(mode: string) {
    setSectionMode(mode === "default" ? globalMode : mode);
  }

  function onLocalChange(field: string, value: any) {
    const newData = { ...youngFiltered, [field]: value };
    if (field === "grade") {
      if (value === GRADES.NOT_SCOLARISE) {
        newData.schooled = "false";
        if (!YOUNG_ACTIVE_SITUATIONS[youngFiltered.situation || ""]) {
          newData.situation = "";
        }
        setSituationOptions(Object.keys(YOUNG_ACTIVE_SITUATIONS).map((s) => ({ value: s, label: translate(s) })));
      } else {
        newData.schooled = "true";
        if (!YOUNG_SCHOOLED_SITUATIONS[youngFiltered.situation || ""]) {
          newData.situation = "";
        }
        setSituationOptions(Object.keys(YOUNG_SCHOOLED_SITUATIONS).map((s) => ({ value: s, label: translate(s) })));
      }
    }
    setYoungFiltered(newData);
  }

  function onSchoolChange(changes: Partial<ExtendedYoungDto>) {
    setYoungFiltered((prev) => ({ ...prev, ...changes }));
  }

  function onCancel() {
    setYoungFiltered({ ...young });
    setErrors({});
  }

  const trimmedPhones: Record<number, string> = {};
  if (youngFiltered.parent1Phone) trimmedPhones[1] = youngFiltered.parent1Phone.replace(/\s/g, "");
  if (youngFiltered.parent2Phone) trimmedPhones[2] = youngFiltered.parent2Phone.replace(/\s/g, "");

  async function onSave() {
    setSaving(true);
    if (validate()) {
      try {
        if (youngFiltered.parent1Phone) youngFiltered.parent1Phone = trimmedPhones[1];
        if (youngFiltered.parent2Phone) youngFiltered.parent2Phone = trimmedPhones[2];

        if (youngFiltered.grade === GRADES.NOT_SCOLARISE) {
          youngFiltered.schoolName = "";
          youngFiltered.schoolType = "";
          youngFiltered.schoolAddress = "";
          youngFiltered.schoolComplementAdresse = "";
          youngFiltered.schoolZip = "";
          youngFiltered.schoolCity = "";
          youngFiltered.schoolDepartment = "";
          youngFiltered.schoolRegion = "";
          youngFiltered.schoolCountry = "";
          youngFiltered.schoolLocation = undefined;
          youngFiltered.schoolId = "";
          youngFiltered.academy = "";
        }

        const result = await api.put(`/young-edition/${young._id}/situationparents`, youngFiltered);
        if (result.ok) {
          toastr.success("Succès !", "Les données ont bien été enregistrées.");
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

  function validate(): boolean {
    let result = true;
    const errors: Record<string, string> = {};

    if (!youngFiltered.parent1Status) return true;

    if (youngFiltered.parent1Phone) youngFiltered.parent1Phone = trimmedPhones[1];
    if (youngFiltered.parent2Phone) youngFiltered.parent2Phone = trimmedPhones[2];

    for (let parent = 1; parent <= (young.parent2Status ? 2 : 1); ++parent) {
      if (["", undefined].includes(youngFiltered[`parent${parent}Email`]) || !validator.isEmail(youngFiltered[`parent${parent}Email`] || "")) {
        errors[`parent${parent}Email`] = "L'email ne semble pas valide";
        result = false;
      }
      if (!trimmedPhones[parent] || !youngFiltered[`parent${parent}Phone`]) {
        errors[`parent${parent}Phone`] = "Le numéro de téléphone est obligatoire";
        result = false;
      }
      if (!trimmedPhones[parent]) {
        errors[`parent${parent}Phone`] = "Le numéro de téléphone est obligatoire";
        result = false;
      }
      if (
        trimmedPhones[parent] &&
        trimmedPhones[parent] !== "" &&
        !isPhoneNumberWellFormated(youngFiltered[`parent${parent}Phone`] || "", youngFiltered[`parent${parent}PhoneZone`] || "AUTRE")
      ) {
        errors[`parent${parent}Phone`] = PHONE_ZONES[youngFiltered[`parent${parent}PhoneZone`] || "AUTRE"].errorMessage;
        result = false;
      }
      result = validateEmpty(youngFiltered, `parent${parent}LastName`, errors) && result;
      result = validateEmpty(youngFiltered, `parent${parent}FirstName`, errors) && result;
      if (!youngFiltered[`parent${parent}OwnAddress`]) {
        errors[`parent${parent}OwnAddress`] = "Ce champ ne peut pas être vide";
        result = false;
      }
      if (youngFiltered[`parent${parent}OwnAddress`] === "true") {
        result = validateEmpty(youngFiltered, `parent${parent}Address`, errors) && result;
        result = validateEmpty(youngFiltered, `parent${parent}Zip`, errors) && result;
        result = validateEmpty(youngFiltered, `parent${parent}City`, errors) && result;
        result = validateEmpty(youngFiltered, `parent${parent}Country`, errors) && result;
      }
      if (young.source === YOUNG_SOURCE.VOLONTAIRE) {
        if (!youngFiltered.situation || youngFiltered.situation === "") {
          errors["situation"] = "Ce champ ne peut pas être vide";
          result = false;
        }
        if (!youngFiltered.grade || youngFiltered.grade === "") {
          errors["grade"] = "Ce champ ne peut pas être vide";
          result = false;
        }
      }
    }
    setErrors(errors);
    return result;
  }

  const [isChecked, setIsChecked] = useState<boolean>(young.sameSchoolCLE === "false");

  const handleCheckboxChange = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    setYoungFiltered({ ...youngFiltered, sameSchoolCLE: newValue ? "false" : "true" });
  };

  function parentHasRequest(parentId: number): boolean {
    return (
      requests &&
      requests.findIndex((req) => {
        return req.field.startsWith("parent" + parentId);
      }) >= 0
    );
  }

  let tabs: Tab[] = [{ label: "Représentant légal 1", value: 1, warning: parentHasRequest(1) || Object.keys(errors)?.some((error) => error.includes("parent1")) }];
  if (young.parent2Status) {
    tabs.push({ label: "Représentant légal 2", value: 2, warning: parentHasRequest(2) || Object.keys(errors)?.some((error) => error.includes("parent2")) });
  }
  if (isPrecompte) {
    tabs = [];
  }

  function onParrentTabChange(tab: number) {
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
                  <MiniTitle>Situation scolaire</MiniTitle>
                  <Field
                    name="grade"
                    label="Classe"
                    value={youngFiltered.grade}
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
                    value={youngFiltered.situation}
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
                  <MiniTitle>Établissement</MiniTitle>
                  {youngFiltered.schooled === "true" && (
                    <>
                      {sectionMode === "edition" ? (
                        <SchoolEditor young={youngFiltered as YoungDto} onChange={onSchoolChange} />
                      ) : (
                        <>
                          <div className="flex items-center gap-4 mb-[16px]">
                            <Field
                              name="schoolZone"
                              label="Zone"
                              value={region2zone[youngFiltered?.schoolRegion || ""]}
                              mode={sectionMode}
                              className="w-1/2"
                              onStartRequest={onStartRequest}
                              currentRequest={currentRequest}
                              correctionRequest={getCorrectionRequest(requests, "schoolZone")}
                              onCorrectionRequestChange={onCorrectionRequestChange}
                              onChange={(value) => onLocalChange("schoolZone", value)}
                              young={young}
                            />
                            <Field
                              name="schoolAcademy"
                              label="Académie"
                              value={departmentToAcademy[youngFiltered?.schoolDepartment || ""]}
                              mode={sectionMode}
                              className="w-1/2"
                              onStartRequest={onStartRequest}
                              currentRequest={currentRequest}
                              correctionRequest={getCorrectionRequest(requests, "schoolAcademy")}
                              onCorrectionRequestChange={onCorrectionRequestChange}
                              onChange={(value) => onLocalChange("schoolAcademy", value)}
                              young={young}
                            />
                          </div>
                          <div className="flex items-center gap-4 mb-[16px]">
                            <Field
                              name="schoolRegion"
                              label="Région"
                              value={youngFiltered.schoolRegion}
                              mode={sectionMode}
                              className="w-1/2"
                              onStartRequest={onStartRequest}
                              currentRequest={currentRequest}
                              correctionRequest={getCorrectionRequest(requests, "schoolRegion")}
                              onCorrectionRequestChange={onCorrectionRequestChange}
                              onChange={(value) => onLocalChange("schoolRegion", value)}
                              young={young}
                            />
                            <Field
                              name="schoolDepartment"
                              label="Département"
                              value={youngFiltered.schoolDepartment}
                              mode={sectionMode}
                              className="w-1/2"
                              onStartRequest={onStartRequest}
                              currentRequest={currentRequest}
                              correctionRequest={getCorrectionRequest(requests, "schoolDepartment")}
                              onCorrectionRequestChange={onCorrectionRequestChange}
                              onChange={(value) => onLocalChange("schoolDepartment", value)}
                              young={young}
                            />
                          </div>
                          <Field
                            name="schoolCity"
                            label="Ville de l'établissement"
                            value={youngFiltered.schoolCity}
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
                            value={youngFiltered.schoolName}
                            mode={sectionMode}
                            className="mb-[24px]"
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
                  <Field name="classeName" label="Nom" value={youngFiltered?.classe?.name} mode="readonly" className="mb-[16px]" young={young} />
                  <div className="flex items-center gap-4">
                    <Field
                      name="uniqueKeyAndId"
                      label="Numéro d'identification"
                      value={youngFiltered?.classe?.uniqueKeyAndId}
                      mode="readonly"
                      className="mb-[16px] w-1/2"
                      young={young}
                    />
                    <Field
                      name="coloration"
                      label="Coloration"
                      value={youngFiltered?.classe?.coloration}
                      mode="readonly"
                      className="mb-[16px] w-1/2"
                      young={young}
                      transformer={translateColoration}
                    />
                  </div>
                  {![ROLES.HEAD_CENTER].includes(user.role) && (
                    <Link to={`/classes/${young.classeId}`}>
                      <Button type="tertiary" title="Voir la classe" className="w-full mb-[24px] max-w-none" />
                    </Link>
                  )}
                  <MiniTitle>Situation scolaire</MiniTitle>
                  <Field
                    name="classeStatus"
                    label="Statut"
                    // @ts-ignore
                    value={youngFiltered?.etablissement?.sector}
                    mode="readonly"
                    className="mb-[16px]"
                    young={young}
                    transformer={translateEtablissementSector}
                  />
                  <Field name="classeGrade" label="Niveau Scolaire" value={young?.grade} mode="readonly" className="mb-[24px]" young={young} transformer={translateGrade} />
                  <MiniTitle>Établissement</MiniTitle>
                  <div className="flex items-center gap-4 mb-[16px]">
                    <Field name="etablissementZone" label="Zone" value={region2zone[youngFiltered?.etablissement?.region || ""]} mode="readonly" className="w-1/2" young={young} />
                    <Field name="etablissementAcademy" label="Académie" value={youngFiltered?.etablissement?.academy} mode="readonly" className="w-1/2" young={young} />
                  </div>
                  <div className="flex items-center gap-4 mb-[16px]">
                    <Field name="etablissementRegion" label="Région" value={youngFiltered?.etablissement?.region} mode="readonly" className="w-1/2" young={young} />
                    <Field name="etablissementDepartment" label="Département" value={youngFiltered?.etablissement?.department} mode="readonly" className="w-1/2" young={young} />
                  </div>
                  <Field name="etablissementCity" label="Ville" value={youngFiltered?.etablissement?.city} mode="readonly" className="mb-[16px]" young={young} />
                  <Field name="etablissementName" label="Nom" value={youngFiltered?.etablissement?.name} mode="readonly" className="mb-[24px]" young={young} />
                  <div className={cx("flex items-center", { hidden: isPrecompte })}>
                    <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} className="mr-2" />
                    <p className="text-xs font-base text-gray-900 mr-1">Situation de l'élève différente de celle de la Classe engagée</p>
                  </div>
                </>
              )}
            </div>
            {(sectionMode === "edition" || hasSpecificSituation) && (
              <div className="mt-[32px]">
                <MiniTitle>Situations particulières</MiniTitle>
                <FieldSituationsParticulieres
                  name="specificSituations"
                  young={youngFiltered as YoungDto}
                  mode={sectionMode === "edition" ? "edition" : "readonly"}
                  onStartRequest={onStartRequest}
                  currentRequest={currentRequest}
                  correctionRequest={getCorrectionRequest(requests, "specificSituations")}
                  // @ts-ignore
                  onCorrectionRequestChange={onCorrectionRequestChange}
                  onChange={onLocalChange}
                />
                {youngFiltered.specificAmenagment === "true" && (
                  <Field
                    name="specificAmenagmentType"
                    label="Nature de l'aménagement spécifique"
                    value={youngFiltered.specificAmenagmentType}
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
            <div className={cx("mt-[24px]", { hidden: isPrecompte })}>
              <div className="flex flex">
                <MiniTitle>Titulaire du PSC1</MiniTitle>
                <HiInformationCircle data-tip data-for="psc1Info" className="mt-0.5 ml-1 text-gray-400" />
              </div>
              <ReactTooltip id="psc1Info" className="bg-white shadow-xl" arrowColor="white" place="right">
                <div className="text-xs text-[#414458]">Information déclarée par le volontaire lors de son inscription </div>
              </ReactTooltip>
              <Field
                name="psc1Info"
                // @ts-ignore
                value={youngFiltered?.psc1Info || "Non renseigné"}
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
          </div>
          <div className="my-[73px] w-[1px] flex-[0_0_1px] bg-[#E5E7EB]" />
          <div className="flex-[1_0_50%] pl-[56px]">
            <Tabs tabs={tabs} selected={currentParent} onChange={onParrentTabChange} />
            <div className={cx("mt-[32px]", { hidden: isPrecompte })}>
              <Field
                name={`parent${currentParent}Status`}
                label="Statut"
                value={youngFiltered[`parent${currentParent}Status`]}
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
                  value={youngFiltered[`parent${currentParent}LastName`]}
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
                  value={youngFiltered[`parent${currentParent}FirstName`]}
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
                value={youngFiltered[`parent${currentParent}Email`]}
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
                value={youngFiltered[`parent${currentParent}Phone`]}
                onChange={(value) => onLocalChange(`parent${currentParent}Phone`, value)}
                zoneValue={youngFiltered[`parent${currentParent}PhoneZone`]}
                onChangeZone={(value) => onLocalChange(`parent${currentParent}PhoneZone`, value)}
                mode={sectionMode}
                placeholder={PHONE_ZONES[youngFiltered[`parent${currentParent}PhoneZone`]]?.example}
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, `parent${currentParent}Phone`)}
                onCorrectionRequestChange={onCorrectionRequestChange}
              />
              <Field
                name={`parent${currentParent}OwnAddress`}
                label="Adresse différente de celle du volontaire"
                value={youngFiltered[`parent${currentParent}OwnAddress`]}
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
              {youngFiltered[`parent${currentParent}OwnAddress`] === "true" && (
                // @ts-ignore
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
                    value={youngFiltered[`parent${currentParent}Address`] || ""}
                    mode={sectionMode}
                    className="mb-[16px]"
                    onChange={(value) => onLocalChange(`parent${currentParent}Address`, value)}
                    young={young}
                  />
                  <Field
                    name={`parent${currentParent}Zip`}
                    label="Code postal"
                    value={youngFiltered[`parent${currentParent}Zip`] || ""}
                    mode={sectionMode}
                    className="mr-[8px] mb-[16px] inline-block w-[calc(50%-8px)]"
                    onChange={(value) => onLocalChange(`parent${currentParent}Zip`, value)}
                    young={young}
                  />
                  <Field
                    name={`parent${currentParent}City`}
                    label="Ville"
                    value={youngFiltered[`parent${currentParent}City`] || ""}
                    mode={sectionMode}
                    className="ml-[8px] mb-[16px] inline-block w-[calc(50%-8px)]"
                    onChange={(value) => onLocalChange(`parent${currentParent}City`, value)}
                    young={young}
                  />
                  <Field
                    name={`parent${currentParent}Country`}
                    label="Pays"
                    value={youngFiltered[`parent${currentParent}Country`] || ""}
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
              {youngFiltered[`parent${currentParent}FromFranceConnect`] === "true" && (
                <div className="mt-[16px] flex items-center rounded-[7px] bg-[#F9FAFB] p-[18px]">
                  <FranceConnect className="mr-[28px] flex-[0_0_100px]" />
                  <div>
                    <div className="text-bold mb-[6px] text-[14px] leading-[20px] text-[#242526]">Attestation des représentants légaux</div>
                    <div className="grow text-[12px] leading-[20px] text-[#000000]">
                      Consentement parental validé via FranceConnect. Les représentants légaux ont utilisé FranceConnect pour s'identifier et consentir, ce qui permet de
                      s'affranchir du formulaire de consentement numérique.
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
              {youngFiltered.motivations && (
                <div>
                  <div className="">Motivations</div>
                  <div className="">&laquo;&nbsp;{youngFiltered.motivations}&nbsp;&raquo;</div>
                </div>
              )}
            </div>
            <div className="my-[73px] w-[1px] flex-[0_0_1px] bg-[#E5E7EB]" />
            <div className="flex-[1_0_50%] pl-[56px]">
              <FileField
                mode={sectionMode}
                young={youngFiltered}
                label="Droit à l'image"
                onChange={onLocalChange}
                statusField="imageRightFilesStatus"
                fileType="imageRightFiles"
                updateYoung={onChange}
              />
              {youngAge && youngAge < 15 && (
                // @ts-ignore
                <FileField mode={sectionMode} young={youngFiltered} label="Accord pour les mineurs de moins de 15 ans" fileType="parentConsentmentFiles" updateYoung={onChange} />
              )}
            </div>
          </div>
        )}
      </Section>
    </SectionContext.Provider>
  );
}
