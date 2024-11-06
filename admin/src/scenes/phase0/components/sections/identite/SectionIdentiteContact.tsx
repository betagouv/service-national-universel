import React from "react";

import { PHONE_ZONES, translate } from "snu-lib";

import { getCorrectionRequest } from "../../../utils";

import Field from "../../Field";
import PhoneField from "../../PhoneField";
import { MiniTitle } from "../../commons/MiniTitle";

interface SectionIdentiteContactProps {
  young: any;
  globalMode: string;
  currentRequest: any;
  onStartRequest: any;
  requests: any;
  onCorrectionRequestChange: any;
  className?: string;
  onChange: any;
}

export default function SectionIdentiteContact({
  young,
  globalMode,
  currentRequest,
  onStartRequest,
  requests,
  onCorrectionRequestChange,
  className,
  onChange,
}: SectionIdentiteContactProps) {
  const genderOptions = [
    { value: "female", label: translate("female") },
    { value: "male", label: translate("male") },
  ];

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
      <Field
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
      />
    </div>
  );
}
