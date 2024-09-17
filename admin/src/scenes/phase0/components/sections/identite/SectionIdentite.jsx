import React from "react";
import dayjs from "@/utils/dayjs.utils";

import { translate, YOUNG_SOURCE } from "snu-lib";

import { getCorrectionRequest } from "../../../utils";

import Field from "../../Field";
import { countryOptions } from "../../../commons";
import { FieldsGroup } from "../../FieldsGroup";
import { MiniTitle } from "../../commons/MiniTitle";

export default function SectionIdentite({ young, globalMode, currentRequest, onStartRequest, requests, onCorrectionRequestChange, className, onChange, sectionMode }) {
  const genderOptions = [
    { value: "female", label: translate("female") },
    { value: "male", label: translate("male") },
  ];
  const birthDate = getBirthDate();

  const nationalityOptions = [
    { value: "true", label: translate("true") },
    { value: "false", label: translate("false") },
  ];

  function getBirthDate() {
    if (young && young.birthdateAt) {
      const date = dayjs(young.birthdateAt);
      return { day: date.date(), month: date.format("MMMM"), year: date.year() };
    } else {
      return { day: "", month: "", year: "" };
    }
  }

  return (
    <div className={className}>
      <MiniTitle>Identité et contact</MiniTitle>
      <div className="mb-[16px] flex items-start justify-between">
        <Field
          name="lastName"
          label="Nom"
          value={young.lastName}
          mode={globalMode}
          className="mr-[8px] flex-[1_1_50%]"
          onStartRequest={onStartRequest}
          currentRequest={currentRequest}
          correctionRequest={getCorrectionRequest(requests, "lastName")}
          onCorrectionRequestChange={onCorrectionRequestChange}
          onChange={(value) => onChange("lastName", value)}
          young={young}
        />
        <Field
          name="firstName"
          label="Prénom"
          value={young.firstName}
          mode={globalMode}
          className="ml-[8px] flex-[1_1_50%]"
          onStartRequest={onStartRequest}
          currentRequest={currentRequest}
          correctionRequest={getCorrectionRequest(requests, "firstName")}
          onCorrectionRequestChange={onCorrectionRequestChange}
          onChange={(value) => onChange("firstName", value)}
          young={young}
        />
      </div>

      <Field
        name="gender"
        label="Sexe"
        value={young.gender}
        mode={globalMode}
        className="mb-[16px]"
        onStartRequest={onStartRequest}
        currentRequest={currentRequest}
        correctionRequest={getCorrectionRequest(requests, "gender")}
        onCorrectionRequestChange={onCorrectionRequestChange}
        type="select"
        options={genderOptions}
        transformer={translate}
        onChange={(value) => onChange("gender", value)}
        young={young}
      />

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
        value={young.birthdateAt}
        onChange={(value) => onChange("birthdateAt", value)}
        young={young}>
        <Field name="birth_day" label="Jour" value={birthDate.day} className="mr-[14px] flex-[1_1_23%]" />
        <Field name="birth_month" label="Mois" value={birthDate.month} className="mr-[14px] flex-[1_1_42%]" />
        <Field name="birth_year" label="Année" value={birthDate.year} className="flex-[1_1_35%]" />
      </FieldsGroup>
      <div className="mb-[16px] flex">
        <Field
          name="birthCity"
          label="Ville de naissance"
          value={young.birthCity}
          mode={sectionMode}
          className="mr-[8px] flex-[1_1_50%]"
          onStartRequest={onStartRequest}
          currentRequest={currentRequest}
          correctionRequest={getCorrectionRequest(requests, "birthCity")}
          onCorrectionRequestChange={onCorrectionRequestChange}
          onChange={(value) => onChange("birthCity", value)}
          young={young}
        />
        <Field
          name="birthCityZip"
          label="Code postal de naissance"
          value={young.birthCityZip}
          mode={sectionMode}
          className="ml-[8px] flex-[1_1_50%]"
          onStartRequest={onStartRequest}
          currentRequest={currentRequest}
          correctionRequest={getCorrectionRequest(requests, "birthCityZip")}
          onCorrectionRequestChange={onCorrectionRequestChange}
          onChange={(value) => onChange("birthCityZip", value)}
          young={young}
        />
      </div>
      <Field
        name="birthCountry"
        label="Pays de naissance"
        value={young.birthCountry}
        mode={sectionMode}
        onStartRequest={onStartRequest}
        currentRequest={currentRequest}
        correctionRequest={getCorrectionRequest(requests, "birthCountry")}
        onCorrectionRequestChange={onCorrectionRequestChange}
        type="select"
        options={countryOptions}
        filterOnType
        onChange={(value) => onChange("birthCountry", value)}
        young={young}
      />
      {young.source === YOUNG_SOURCE.CLE && (
        <div className="mt-[32px]">
          <MiniTitle>Nationalité Française</MiniTitle>
          <Field
            name="frenchNationality"
            label="Nationalité Française"
            value={young.frenchNationality}
            mode={sectionMode}
            className="mb-[16px]"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "frenchNationality")}
            onCorrectionRequestChange={onCorrectionRequestChange}
            type="select"
            options={nationalityOptions}
            transformer={translate}
            onChange={(value) => onChange("frenchNationality", value)}
            young={young}
          />
        </div>
      )}
      {/* <Field
        name="email"
        label="Email"
        value={young.email}
        mode={globalMode}
        className="mb-[16px]"
        onStartRequest={onStartRequest}
        currentRequest={currentRequest}
        correctionRequest={getCorrectionRequest(requests, "email")}
        onCorrectionRequestChange={onCorrectionRequestChange}
        onChange={(value) => onChange("email", value)}
        young={young}
        copy={true}
      />
      <PhoneField
        name="phone"
        young={young}
        value={young.phone}
        onChange={(value) => onChange("phone", value)}
        zoneValue={young.phoneZone}
        onChangeZone={(value) => onChange("phoneZone", value)}
        mode={globalMode}
        placeholder={PHONE_ZONES[young.phoneZone]?.example}
        onStartRequest={onStartRequest}
        currentRequest={currentRequest}
        correctionRequest={getCorrectionRequest(requests, "phone")}
        onCorrectionRequestChange={onCorrectionRequestChange}
      /> */}
    </div>
  );
}
