import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import cx from "classnames";
import { translate, YOUNG_STATUS, ROLES, getCohortPeriod, getCohortYear, YOUNG_SOURCE, getSchoolYear, CohortDto } from "snu-lib";
import { YoungDto, EtablissementDto } from "snu-lib";

import dayjs from "@/utils/dayjs.utils";

import api from "@/services/api";
import downloadPDF from "@/utils/download-pdf";

import XCircle from "@/assets/icons/XCircle";

import Section from "../../Section";

import CheckRead from "./partials/CheckRead";
import ForceConsentement from "./partials/ForceConsentement";

interface SectionConsentementsProps {
  young: YoungDto;
  onChange?: (options?: any) => void;
  readonly?: boolean;
  isPrecompte?: boolean;
  cohort?: CohortDto;
}

const PARENT_STATUS_NAME: Record<string, string> = {
  father: "Le père",
  mother: "La mère",
  representant: "Le représentant légal",
};

const PENDING_ACCORD = "en attente";

export default function SectionConsentements({ young, onChange, isPrecompte, cohort }: SectionConsentementsProps) {
  const [pdfDownloading, setPdfDownloading] = useState<string>("");

  const user = useSelector((state: any) => state.Auth.user);
  const consent = young.parentAllowSNU === "true" ? "Autorise " : "N'autorise pas ";
  const cohortYear = young.source === YOUNG_SOURCE.CLE ? getSchoolYear(young.etablissementId as unknown as EtablissementDto) : getCohortYear(cohort);

  async function handleConfirmConsent(participationConsent: string, imageRights: string) {
    try {
      await api.put(`/young-edition/${young._id}/ref-allow-snu`, {
        consent: participationConsent,
        imageRights: imageRights,
      });
      toastr.success("Le consentement a été pris en compte. Le jeune a été notifié.", "");
      onChange && onChange();
    } catch (err) {
      toastr.error("Nous n'avons pas pu enregistrer le consentement. Veuillez réessayer dans quelques instants.", "");
    }
  }

  async function downloadImageRightDocument() {
    setPdfDownloading("(en cours...)");
    await downloadPDF({
      url: `/young/${young._id}/documents/droitImage/droitImage`,
      fileName: `${young.firstName} ${young.lastName} - attestation droit image.pdf`,
    });
    setPdfDownloading("");
  }

  if (isPrecompte) {
    return null;
  }

  return (
    <Section title="Consentements" collapsable>
      <div className={cx("flex-[1_0_50%] pr-[56px]", { hidden: isPrecompte })}>
        <div className="text-[16px] font-bold leading-[24px] text-[#242526]">
          Le volontaire{" "}
          <span className="font-normal text-[#6B7280]">
            {young.firstName} {young.lastName}
          </span>
        </div>
        <div>
          <CheckRead value={young.consentment === "true"}>
            Se porte volontaire pour participer à la session <b>{cohortYear}</b> du Service National Universel qui comprend la participation à un séjour de cohésion puis la
            réalisation d&apos;une phase d'engagement.
          </CheckRead>
          <CheckRead value={young.acceptCGU === "true"}>
            {young.source === YOUNG_SOURCE.CLE ? (
              <>S&apos;inscrit pour le séjour de cohésion et s&apos;engage à en respecter le règlement intérieur.</>
            ) : (
              <>
                S&apos;inscrit pour le séjour de cohésion <strong>{getCohortPeriod(cohort)}</strong> sous réserve de places disponibles et s&apos;engage à en respecter le règlement
                intérieur.
              </>
            )}
          </CheckRead>
        </div>
      </div>
      <div className="my-[73px] w-[1px] flex-[0_0_1px] bg-[#E5E7EB]" />
      <div className="flex-[1_0_50%] pl-[56px] pb-[32px]">
        <div className="mb-[16px] flex items-center justify-between text-[16px] font-bold leading-[24px] text-[#242526]">
          <div className="grow">
            {PARENT_STATUS_NAME[young.parent1Status as keyof typeof PARENT_STATUS_NAME]}{" "}
            <span className="font-normal text-[#6B7280]">
              {young.parent1FirstName} {young.parent1LastName}
            </span>
          </div>
          {young.parent1ValidationDate && (
            <div className="whitespace-nowrap text-[13px] font-normal text-[#1F2937]">Le {dayjs(young.parent1ValidationDate).format("DD/MM/YYYY HH:mm")}</div>
          )}
        </div>
        <div className="my-[16px] text-[14px] leading-[20px] text-[#161616]">
          {consent}
          <b>
            {young.firstName} {young.lastName}
          </b>{" "}
          à s&apos;engager comme volontaire du Service National Universel et à participer à une session <b>{cohortYear}</b> du SNU.
        </div>
        <div className="border-b border-[#E5E7EB] pb-6">
          <CheckRead value={young.parent1AllowSNU === "true"}>
            Confirme être titulaire de l&apos;autorité parentale/représentant(e) légal(e) de{" "}
            <b>
              {young.firstName} {young.lastName}
            </b>
            .
          </CheckRead>
          <CheckRead value={young.parent1AllowSNU === "true"}>
            S&apos;engage à communiquer la fiche sanitaire de{" "}
            <b>
              {young.firstName} {young.lastName}
            </b>{" "}
            au responsable du séjour de cohésion.
          </CheckRead>
          <CheckRead value={young.parent1AllowSNU === "true"}>
            S&apos;engage à ce que{" "}
            <b>
              {young.firstName} {young.lastName}
            </b>{" "}
            , à la date du séjour de cohésion, ait satisfait aux obligations vaccinales en vigueur.
          </CheckRead>
          <CheckRead value={young.parent1AllowSNU === "true"}>Reconnait avoir pris connaissance du règlement Intérieur du séjour de cohésion.</CheckRead>
          <CheckRead value={young.parent1AllowSNU === "true"}>
            Accepte la collecte et le traitement des données personnelles de{" "}
            <b>
              {young.firstName} {young.lastName}{" "}
            </b>
            dans le cadre d'une mission d'intérêt public.
          </CheckRead>
        </div>
        <div className="mb-[16px] mt-4 flex items-center justify-between text-[16px] font-bold leading-[24px] text-[#242526]">
          <div className="grow">
            {PARENT_STATUS_NAME[young.parent1Status as keyof typeof PARENT_STATUS_NAME]}{" "}
            <span className="font-normal text-[#6B7280]">
              {young.parent1FirstName} {young.parent1LastName}
            </span>
          </div>
          {young.parent1ValidationDate && (
            <div className="whitespace-nowrap text-[13px] font-normal text-[#1F2937]">Le {dayjs(young.parent1ValidationDate).format("DD/MM/YYYY HH:mm")}</div>
          )}
        </div>
        <div className="itemx-center mt-[16px] flex justify-between">
          <div className="grow text-[14px] leading-[20px] text-[#374151]">
            <CheckRead value={young.parent1AllowImageRights === "true"}>
              <b>Droit à l&apos;image : </b>
              {translate(young.parent1AllowImageRights || "") || PENDING_ACCORD}
            </CheckRead>
          </div>
          {(young.parent1AllowImageRights === "true" || young.parent1AllowImageRights === "false") && (
            <a href="#" className="mt-2 text-blue-600 underline" onClick={downloadImageRightDocument}>
              Télécharger {pdfDownloading}
            </a>
          )}
        </div>
        {young.parent1AllowSNU === "true" || young.parent1AllowSNU === "false" ? (
          <div className="itemx-center mt-[16px] flex justify-between">
            <div className="grow text-[14px] leading-[20px] text-[#374151]">
              <CheckRead value={young.parent1AllowSNU === "true"}>
                <b>Consentement à la participation : </b>
                {translate(young.parent1AllowSNU || "") || PENDING_ACCORD}
              </CheckRead>
            </div>
          </div>
        ) : null}
        {young.parent2Status && (
          <div className="mt-[24px] border-t-[1px] border-t-[#E5E7EB] pt-[24px]">
            <div className="mb-[16px] flex items-center justify-between text-[16px] font-bold leading-[24px] text-[#242526]">
              <div className="grow">
                {PARENT_STATUS_NAME[young.parent2Status as keyof typeof PARENT_STATUS_NAME]}{" "}
                <span className="font-normal text-[#6B7280]">
                  {young.parent2FirstName} {young.parent2LastName}
                </span>
              </div>
              {young.parent2ValidationDate && (
                <div className="whitespace-nowrap text-[13px] font-normal text-[#1F2937]">Le {dayjs(young.parent2ValidationDate).format("DD/MM/YYYY HH:mm")}</div>
              )}
            </div>
            {young.parent1AllowImageRights === "true" && (
              <>
                <div className="mt-[16px] flex items-center justify-between">
                  <div className="grow text-[14px] leading-[20px] text-[#374151]">
                    <CheckRead value={young.parent2AllowImageRights === "true"}>
                      <b>Droit à l&apos;image : </b>
                      {translate(young.parent2AllowImageRights || "") || PENDING_ACCORD}
                    </CheckRead>
                  </div>
                  {(young.parent2AllowImageRights === "true" || young.parent2AllowImageRights === "false") && (
                    <a href="#" className="mt-2 text-blue-600 underline" onClick={downloadImageRightDocument}>
                      Télécharger {pdfDownloading}
                    </a>
                  )}
                </div>
              </>
            )}
            {[YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.NOT_AUTORISED].includes(
              young.status as any,
            ) ? (
              <div className="mt-[16px] flex items-center justify-between">
                <div className="flex-column flex grow justify-center text-[14px] leading-[20px] text-[#374151]">
                  <div className="font-bold">Consentement à la participation</div>
                  {young.parent2RejectSNUComment && <div>{young.parent2RejectSNUComment}</div>}
                </div>
                {young.parent2AllowSNU === "true" || young.parent2AllowSNU === "false" ? (
                  <div className="flex items-center gap-2 text-sm text-red-500 ">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Refusé
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
        {[YOUNG_STATUS.IN_PROGRESS].includes(young.status as any) && [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) && young.parentAllowSNU !== "true" && (
          <ForceConsentement young={young} onConfirmConsent={handleConfirmConsent} />
        )}
      </div>
    </Section>
  );
}
