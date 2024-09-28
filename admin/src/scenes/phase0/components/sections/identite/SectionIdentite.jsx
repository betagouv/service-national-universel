import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import validator from "validator";

import { isPhoneNumberWellFormated, PHONE_ZONES, ERRORS, translate, YOUNG_STATUS, YOUNG_SOURCE } from "snu-lib";

import api from "@/services/api";
import dayjs from "@/utils/dayjs.utils";
import { getCorrectionRequest, validateEmpty, filterDataForYoungSection } from "../../../utils";

import { countryOptions } from "../../../commons";

import SectionContext from "../../../context/SectionContext";

import { FieldsGroup } from "../../FieldsGroup";
import Field from "../../Field";
import VerifyAddress from "../../VerifyAddress";
import Section from "../../Section";

import SectionIdentiteCni from "./SectionIdentiteCni";
import SectionIdentiteContact from "./SectionIdentiteContact";
import { MiniTitle } from "../../commons/MiniTitle";
import { HiOutlineCheckCircle, HiOutlineExclamation } from "react-icons/hi";

export default function SectionIdentite({ young, cohort, onStartRequest, currentRequest, onCorrectionRequestChange, requests, globalMode, onChange, readonly = false }) {
  const [sectionMode, setSectionMode] = useState(globalMode);
  const [data, setData] = useState(filterDataForYoungSection(young, "identite"));
  const [saving, setSaving] = useState(false);
  const birthDate = getBirthDate();
  const [errors, setErrors] = useState({});

  function getBirthDate() {
    if (data && data.birthdateAt) {
      const date = dayjs(data.birthdateAt);
      return { day: date.date(), month: date.format("MMMM"), year: date.year() };
    } else {
      return { day: "", month: "", year: "" };
    }
  }

  function onSectionChangeMode(mode) {
    setSectionMode(mode === "default" ? globalMode : mode);
  }

  function onLocalChange(field, value) {
    setData({ ...data, [field]: value });
  }

  function onLocalAddressChange(field, value) {
    onLocalChange(field, value);
    setData((prev) => ({ ...prev, addressVerified: "false" }));
  }

  function onCancel() {
    setData({ ...young });
    setErrors({});
  }

  async function onSave() {
    setSaving(true);
    if (validate()) {
      try {
        // eslint-disable-next-line no-unused-vars
        const { applications, ...dataToSend } = data;
        const result = await api.put(`/young-edition/${young._id}/identite`, dataToSend);
        if (result.ok) {
          toastr.success("Les données ont bien été enregistrées.");
          setSectionMode(globalMode);
          onChange();
        } else {
          if (result.code === "ALREADY_EXISTS") {
            toastr.error("Erreur !", "Email déjà existant.");
          } else if (result.code === ERRORS.OPERATION_UNAUTHORIZED) {
            toastr.error("Erreur !", "Vous n'avez pas les droits pour effectuer cette action.");
          } else {
            toastr.error("Erreur !", "Nous n'avons pas pu enregistrer les modifications. Veuillez réessayer dans quelques instants.");
          }
        }
      } catch (err) {
        toastr.error("Erreur !", "Nous n'avons pas pu enregistrer les modifications. Veuillez réessayer dans quelques instants.");
      }
    }
    setSaving(false);
  }

  function validate() {
    let result = true;
    let errors = {};

    if (!data.email || !validator.isEmail(data.email)) {
      errors.email = "L'email ne semble pas valide";
      result = false;
    }

    if (!data.phone || !isPhoneNumberWellFormated(data.phone, data.phoneZone || "AUTRE")) {
      errors.phone = PHONE_ZONES[data.phoneZone || "AUTRE"].errorMessage;
      result = false;
    }

    result = validateEmpty(data, "lastName", errors) && result;
    result = validateEmpty(data, "firstName", errors) && result;
    result = validateEmpty(data, "birthCity", errors) && result;
    result = validateEmpty(data, "birthCityZip", errors) && result;
    result = validateEmpty(data, "birthCountry", errors) && result;

    result = validateEmpty(data, "address", errors) && result;
    result = validateEmpty(data, "zip", errors) && result;
    result = validateEmpty(data, "city", errors) && result;
    result = validateEmpty(data, "country", errors) && result;

    setErrors(errors);
    return result;
  }

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setData({
      ...data,
      addressVerified: true,
      cityCode: suggestion.cityCode,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      // if the suggestion is not confirmed we keep the address typed by the user
      address: isConfirmed ? suggestion.address : data.address,
      zip: isConfirmed ? suggestion.zip : data.zip,
      city: isConfirmed ? suggestion.city : data.city,
    });
  };

  const nationalityOptions = [
    { value: "true", label: translate("true") },
    { value: "false", label: translate("false") },
  ];

  return (
    <SectionContext.Provider value={{ errors }}>
      <Section
        step={globalMode === "correction" ? "Première étape" : null}
        title={globalMode === "correction" ? "Vérifier l'identité" : "Informations générales"}
        editable={young.status !== YOUNG_STATUS.DELETED && !readonly}
        mode={sectionMode}
        onChangeMode={onSectionChangeMode}
        saving={saving}
        onSave={onSave}
        onCancel={onCancel}>
        <div className="flex-[1_0_50%] pr-[56px]">
          {globalMode === "correction" ? (
            <>
              {young.source === YOUNG_SOURCE.VOLONTAIRE && (
                <SectionIdentiteCni
                  young={data}
                  cohort={cohort}
                  globalMode={sectionMode}
                  requests={requests}
                  onStartRequest={onStartRequest}
                  currentRequest={currentRequest}
                  onCorrectionRequestChange={onCorrectionRequestChange}
                  onChange={onLocalChange}
                  className="mb-[32px]"
                />
              )}
              <SectionIdentiteContact
                young={data}
                globalMode={sectionMode}
                requests={requests}
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                onCorrectionRequestChange={onCorrectionRequestChange}
                onChange={onLocalChange}
              />
            </>
          ) : (
            <>
              <SectionIdentiteContact
                young={data}
                globalMode={sectionMode}
                requests={requests}
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                onCorrectionRequestChange={onCorrectionRequestChange}
                onChange={onLocalChange}
              />
              {young.source === YOUNG_SOURCE.VOLONTAIRE && (
                <SectionIdentiteCni
                  cohort={cohort}
                  className="mt-[32px]"
                  young={data}
                  globalMode={sectionMode}
                  requests={requests}
                  onStartRequest={onStartRequest}
                  currentRequest={currentRequest}
                  onCorrectionRequestChange={onCorrectionRequestChange}
                  onChange={onLocalChange}
                />
              )}
            </>
          )}
        </div>
        <div className="my-[73px] w-[1px] flex-[0_0_1px] bg-[#E5E7EB]" />
        <div className="flex-[1_0_50%] pl-[56px]">
          <div>
            <FieldsGroup
              name="birthdateAt"
              title="Date et lieu de naissance"
              mode={sectionMode}
              correctionLabel="Date de naissance"
              className="mb-[16px]"
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, "birthdateAt")}
              onCorrectionRequestChange={onCorrectionRequestChange}
              type="date"
              value={data.birthdateAt}
              onChange={(value) => onLocalChange("birthdateAt", value)}
              young={young}>
              <Field name="birth_day" label="Jour" value={birthDate.day} className="mr-[14px] flex-[1_1_23%]" />
              <Field name="birth_month" label="Mois" value={birthDate.month} className="mr-[14px] flex-[1_1_42%]" />
              <Field name="birth_year" label="Année" value={birthDate.year} className="flex-[1_1_35%]" />
            </FieldsGroup>
            <div className="mb-[16px] flex">
              <Field
                name="birthCity"
                label="Ville de naissance"
                value={data.birthCity}
                mode={sectionMode}
                className="mr-[8px] flex-[1_1_50%]"
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, "birthCity")}
                onCorrectionRequestChange={onCorrectionRequestChange}
                onChange={(value) => onLocalChange("birthCity", value)}
                young={young}
              />
              <Field
                name="birthCityZip"
                label="Code postal de naissance"
                value={data.birthCityZip}
                mode={sectionMode}
                className="ml-[8px] flex-[1_1_50%]"
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, "birthCityZip")}
                onCorrectionRequestChange={onCorrectionRequestChange}
                onChange={(value) => onLocalChange("birthCityZip", value)}
                young={young}
              />
            </div>
            <Field
              name="birthCountry"
              label="Pays de naissance"
              value={data.birthCountry}
              mode={sectionMode}
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, "birthCountry")}
              onCorrectionRequestChange={onCorrectionRequestChange}
              type="select"
              options={countryOptions}
              filterOnType
              onChange={(value) => onLocalChange("birthCountry", value)}
              young={young}
            />
          </div>
          {young.source === YOUNG_SOURCE.CLE && (
            <div className="mt-[32px]">
              <MiniTitle>Nationalité Française</MiniTitle>
              <Field
                name="frenchNationality"
                label="Nationalité Française"
                value={data.frenchNationality}
                mode={sectionMode}
                className="mb-[16px]"
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, "frenchNationality")}
                onCorrectionRequestChange={onCorrectionRequestChange}
                type="select"
                options={nationalityOptions}
                transformer={translate}
                onChange={(value) => onLocalChange("frenchNationality", value)}
                young={young}
              />
            </div>
          )}
          <div className="mt-[32px]">
            <MiniTitle>Adresse de résidence</MiniTitle>
            <Field
              name="address"
              label="Adresse"
              value={data.address}
              mode={sectionMode}
              className="mb-[16px]"
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, "address")}
              onCorrectionRequestChange={onCorrectionRequestChange}
              onChange={(value) => onLocalAddressChange("address", value)}
              young={young}
            />
            <div className="mb-[16px] flex items-start justify-between">
              <Field
                name="zip"
                label="Code postal"
                value={data.zip}
                mode={sectionMode}
                className="mr-[8px] flex-[1_1_50%]"
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, "zip")}
                onCorrectionRequestChange={onCorrectionRequestChange}
                onChange={(value) => onLocalAddressChange("zip", value)}
                young={young}
              />
              <Field
                name="city"
                label="Ville"
                value={data.city}
                mode={sectionMode}
                className="ml-[8px] flex-[1_1_50%]"
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, "city")}
                onCorrectionRequestChange={onCorrectionRequestChange}
                onChange={(value) => onLocalAddressChange("city", value)}
                young={young}
              />
            </div>
            <div className="mb-[16px] flex items-start justify-between">
              <Field name="department" label="Département" value={data.department} mode="readonly" className="mr-[8px] flex-[1_1_50%]" />
              <Field name="region" label="Région" value={data.region} mode="readonly" className="ml-[8px] flex-[1_1_50%]" />
            </div>
            <Field
              name="country"
              label="Pays"
              value={data.country}
              mode={sectionMode}
              className="mb-[16px]"
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, "country")}
              onCorrectionRequestChange={onCorrectionRequestChange}
              type="select"
              options={countryOptions}
              filterOnType
              onChange={(value) => onLocalAddressChange("country", value)}
              young={young}
            />
            {data?.etablissementDepartment ? (
              data?.etablissementDepartment !== data?.department ? (
                <div className="w-full h-full p-2 bg-amber-50 rounded-md flex justify-center items-center gap-2">
                  <HiOutlineExclamation className="text-amber-500 p-2" size={40} />
                  <div className="flex-1 text-amber-600 text-xs font-medium leading-4 break-words">
                    Le département de ce volontaire n’est pas le même que le département de son établissement
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-2 bg-emerald-50 rounded-md flex justify-center items-center gap-2">
                  <HiOutlineCheckCircle className="text-emerald-500 p-2" size={40} />
                  <div className="flex-1 text-emerald-600 text-xs font-medium leading-4 break-words">
                    Le département de résidence de ce volontaire est le même que le département de son établissement
                  </div>
                </div>
              )
            ) : null}
            {sectionMode === "edition" && data.country && data.country.toUpperCase() === "FRANCE" && (
              <VerifyAddress
                address={data.address}
                zip={data.zip}
                city={data.city}
                onSuccess={onVerifyAddress(true)}
                onFail={onVerifyAddress()}
                isVerified={data.addressVerified === true}
                buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
              />
            )}
          </div>
          {data.foreignAddress && (
            <div className="mt-[32px]">
              <MiniTitle>Adresse à l&apos;étranger</MiniTitle>
              <Field
                name="address"
                label="Adresse"
                value={data.foreignAddress}
                mode={sectionMode}
                className="mb-[16px]"
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, "foreignAddress")}
                onCorrectionRequestChange={onCorrectionRequestChange}
                onChange={(value) => onLocalChange("foreignAddress", value)}
                young={young}
              />
              <div className="mb-[16px] flex items-start justify-between">
                <Field
                  name="zip"
                  label="Code postal"
                  value={data.foreignZip}
                  mode={sectionMode}
                  className="mr-[8px] flex-[1_1_50%]"
                  onStartRequest={onStartRequest}
                  currentRequest={currentRequest}
                  correctionRequest={getCorrectionRequest(requests, "foreignZip")}
                  onCorrectionRequestChange={onCorrectionRequestChange}
                  onChange={(value) => onLocalChange("foreignZip", value)}
                  young={young}
                />
                <Field
                  name="city"
                  label="Ville"
                  value={data.foreignCity}
                  mode={sectionMode}
                  className="ml-[8px] flex-[1_1_50%]"
                  onStartRequest={onStartRequest}
                  currentRequest={currentRequest}
                  correctionRequest={getCorrectionRequest(requests, "foreignCity")}
                  onCorrectionRequestChange={onCorrectionRequestChange}
                  onChange={(value) => onLocalChange("foreignCity", value)}
                  young={young}
                />
              </div>
              <Field
                name="country"
                label="Pays"
                value={data.foreignCountry}
                mode={sectionMode}
                className="mb-[16px]"
                onStartRequest={onStartRequest}
                currentRequest={currentRequest}
                correctionRequest={getCorrectionRequest(requests, "foreignCountry")}
                onCorrectionRequestChange={onCorrectionRequestChange}
                type="select"
                options={countryOptions}
                filterOnType
                onChange={(value) => onLocalChange("foreignCountry", value)}
                young={young}
              />
            </div>
          )}
        </div>
      </Section>
    </SectionContext.Provider>
  );
}
