import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { getCohortStartDate, translate, ROLES } from "snu-lib";

import api from "@/services/api";
import dayjs from "@/utils/dayjs.utils";

import { getCorrectionRequest } from "../../../utils";

import { BorderButton } from "../../Buttons";
import { FieldsGroup } from "../../FieldsGroup";
import Field from "../../Field";
import { CniField } from "../../CniField";
import { MiniTitle } from "../../commons/MiniTitle";

export default function SectionIdentiteCni({ young, cohort, globalMode, currentRequest, onStartRequest, requests, onCorrectionRequestChange, className, onChange }) {
  const user = useSelector((state) => state.Auth.user);
  const categoryOptions = ["cniNew", "cniOld", "passport"].map((s) => ({ value: s, label: translate(s) }));
  let cniDay = "";
  let cniMonth = "";
  let cniYear = "";

  if (young.latestCNIFileExpirationDate) {
    const date = dayjs(young.latestCNIFileExpirationDate).toUtcLocally();
    cniDay = date.date();
    cniMonth = date.format("MMMM");
    cniYear = date.year();
  }

  return (
    <div className={className}>
      <CniField
        name="cniFile"
        label="Pièce d'identité"
        young={young}
        mode={globalMode}
        onStartRequest={onStartRequest}
        currentRequest={currentRequest}
        correctionRequest={getCorrectionRequest(requests, "cniFile")}
        onCorrectionRequestChange={onCorrectionRequestChange}
        onChange={onChange}
      />

      <FieldsGroup
        name="latestCNIFileExpirationDate"
        title="Date d'expiration de la pièce d'identité"
        mode={globalMode}
        onStartRequest={onStartRequest}
        currentRequest={currentRequest}
        correctionRequest={getCorrectionRequest(requests, "latestCNIFileExpirationDate")}
        onCorrectionRequestChange={onCorrectionRequestChange}
        type="date"
        disabled={young.latestCNIFileExpirationDate === null}
        value={young.latestCNIFileExpirationDate}
        onChange={(value) => onChange("latestCNIFileExpirationDate", value)}
        young={young}>
        <Field name="cni_day" label="Jour" value={cniDay} className="mr-[14px] flex-[1_1_23%]" />
        <Field name="cni_month" label="Mois" value={cniMonth} className="mr-[14px] flex-[1_1_42%]" />
        <Field name="cni_year" label="Année" value={cniYear} className="flex-[1_1_35%]" />
      </FieldsGroup>

      {user.role === ROLES.ADMIN && (
        <Field
          name="latestCNIFileCategory"
          label="Type de pièce d'identité"
          value={young.latestCNIFileCategory}
          transformer={translate}
          mode={globalMode}
          className="my-[16px]"
          onStartRequest={onStartRequest}
          currentRequest={currentRequest}
          correctionRequest={getCorrectionRequest(requests, "latestCNIFileCategory")}
          onCorrectionRequestChange={onCorrectionRequestChange}
          type="select"
          disabled={young.latestCNIFileCategory === "deleted"}
          options={categoryOptions}
          onChange={(cat) => onChange("latestCNIFileCategory", cat)}
          young={young}
        />
      )}
      <HonorCertificate young={young} cohort={cohort} />
    </div>
  );
}

function HonorCertificate({ young, cohort }) {
  let cniExpired = false;
  if (young && young.cohort && young.latestCNIFileExpirationDate) {
    const cohortDate = getCohortStartDate(young, cohort);
    if (cohortDate) {
      cniExpired = dayjs(young.latestCNIFileExpirationDate).toUtc().valueOf() < dayjs(cohortDate).toUtc().valueOf();
    }
  }

  async function remind() {
    try {
      await api.post(`/correction-request/${young._id}/remind-cni`, {});
      toastr.success("Le représentant légal a été relancé.");
    } catch (err) {
      toastr.error("Erreur !", "Nous n'avons pas pu envoyer la relance. Veuillez réessayer dans quelques instants.");
    }
  }

  if (cniExpired) {
    return (
      <div className="mt-[8px] flex items-center justify-between">
        <MiniTitle>Attestation sur l&apos;honneur</MiniTitle>
        <div className="flex items-center">
          <div className="rounded-[100px] border-[1px] border-[#CECECE] bg-[#FFFFFF] py-[3px] px-[10px] text-[12px] font-normal">
            {young.parentStatementOfHonorInvalidId === "true" ? "Validée" : "En attente"}
          </div>
          {young.parentStatementOfHonorInvalidId !== "true" && young.parent1Email && (
            <BorderButton className="ml-[8px]" onClick={remind}>
              Relancer
            </BorderButton>
          )}
        </div>
      </div>
    );
  } else {
    return null;
  }
}
