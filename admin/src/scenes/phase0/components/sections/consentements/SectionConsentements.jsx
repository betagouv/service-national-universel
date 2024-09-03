import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { translate, YOUNG_STATUS, ROLES, getCohortPeriod, getCohortYear, YOUNG_SOURCE, getSchoolYear } from "snu-lib";

import dayjs from "@/utils/dayjs.utils";

import { appURL } from "@/config";
import { capture } from "@/sentry";
import { copyToClipboard } from "@/utils";
import api from "@/services/api";
import downloadPDF from "@/utils/download-pdf";

import XCircle from "@/assets/icons/XCircle";
import Warning from "@/assets/icons/Warning";

import { BorderButton } from "../../Buttons";
import ConfirmationModal from "../../ConfirmationModal";
import Section from "../../Section";

import CheckRead from "./partials/CheckRead";
import ForceConsentement from "./partials/ForceConsentement";

const PARENT_STATUS_NAME = {
  father: "Le père",
  mother: "La mère",
  representant: "Le représentant légal",
};

const PENDING_ACCORD = "en attente";

export default function SectionConsentements({ young, onChange, readonly = false, cohort }) {
  const [confirmModal, setConfirmModal] = useState(null);
  const [pdfDownloading, setPdfDownloading] = useState("");

  const user = useSelector((state) => state.Auth.user);
  const consent = young.parentAllowSNU === "true" ? "Autorise " : "N'autorise pas ";
  const cohortYear = young.source === YOUNG_SOURCE.CLE ? getSchoolYear(young.etablissement) : getCohortYear(young.cohort);

  async function handleConfirmConsent(participationConsent, imageRights) {
    try {
      setConfirmModal(null);
      await api.put(`/young-edition/${young._id}/ref-allow-snu`, {
        consent: participationConsent,
        imageRights: imageRights,
      });
      toastr.success("Le consentement a été pris en compte. Le jeune a été notifié.");
      onChange && onChange();
    } catch (err) {
      toastr.error("Nous n'avons pas pu enregistrer le consentement. Veuillez réessayer dans quelques instants.");
    }
  }

  function parent2RejectSNU() {
    setConfirmModal({
      icon: <Warning />,
      title: "Consentement refusé",
      message: (
        <div>
          Vous vous apprêtez à passer le dossier d&apos;inscription de {young.firstName} {young.lastName} en statut &laquo;non autorisé&raquo;.
          <br />
          {young.firstName} ne pourra pas participer au SNU.
          <br />
          Un email lui sera automatiquement envoyé.
        </div>
      ),
      confirm: confirmParent2Rejection,
    });
  }

  async function confirmParent2Rejection() {
    try {
      setConfirmModal(null);
      await api.put(`/young-edition/${young._id}/parent-allow-snu`, {
        parent: 2,
        allow: false,
      });
      toastr.success("Le refus a été pris en compte. Le jeune a été notifié.");
      onChange && onChange();
    } catch (err) {
      toastr.error("Nous n'avons pas pu enregistrer le refus. Veuillez réessayer dans quelques instants.");
    }
  }

  function confirmImageRightsChange(parentId, event) {
    event.preventDefault();

    const parent = {
      firstName: young[`parent${parentId}FirstName`],
      lastName: young[`parent${parentId}LastName`],
    };

    setConfirmModal({
      title: "Modification de l’accord de droit à l’image",
      message: (
        <div>
          Vous vous apprêtez à envoyer à {parent.firstName} {parent.lastName} une demande de modification de son accord de droit à l&apos;image.
          <br />
          Un email lui sera envoyé. Cela annulera l&apos;ancien accord.
        </div>
      ),
      confirm: () => changeImagesRights(parentId),
    });
  }

  async function changeImagesRights(parentId) {
    try {
      const result = await api.put(`/young-edition/${young._id}/parent-image-rights-reset`, { parentId });
      if (!result.ok) {
        toastr.error("Erreur !", "Nous n'avons pu modifier le droit à l'image pour ce représentant légal. Veuillez réessayer dans quelques instants.");
      } else {
        toastr.success("Le droit à l'image a été remis à zéro. Un email a été envoyé au représentant légal.");
        onChange && onChange(result.data);
      }
    } catch (err) {
      capture(err);
      toastr.error("Erreur !", "Nous n'avons pu modifier le droit à l'image pour ce représentant légal. Veuillez réessayer dans quelques instants.");
    }
  }

  function openParentsAllowSNUModal() {
    setConfirmModal({
      icon: <Warning />,
      title: "Annulation du refus de consentement",
      message: (
        <div>
          Vous vous apprêtez à annuler le refus de consentement des représentants légaux de {young.firstName} {young.lastName}.
          <br />
          Ils recevront un email de relance pour leur demander de confirmer leur consentement.
        </div>
      ),
      confirm: resetParentsAllowSNU,
    });
  }

  async function resetParentsAllowSNU() {
    try {
      let result = await api.put(`/young-edition/${young._id}/parent-allow-snu-reset`);
      if (!result.ok) {
        toastr.error("Erreur !", "Nous n'avons pu réinitialiser le consentement pour les représentants légaux. Veuillez réessayer dans quelques instants.");
      } else {
        toastr.success("Le consentement a été réinitialisé. Un email a été envoyé au représentant légal 1.");
        onChange && onChange(result.data);
      }
    } catch (err) {
      capture(err);
      toastr.error("Erreur !", "Nous n'avons pu réinitialiser le consentement pour ce représentant légal. Veuillez réessayer dans quelques instants.");
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

  return (
    <Section title="Consentements" collapsable>
      <div className="flex-[1_0_50%] pr-[56px]">
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
            {PARENT_STATUS_NAME[young.parent1Status]}{" "}
            <span className="font-normal text-[#6B7280]">
              {young.parent1FirstName} {young.parent1LastName}
            </span>
          </div>
          {young.parent1ValidationDate && (
            <div className="whitespace-nowrap text-[13px] font-normal text-[#1F2937]">Le {dayjs(young.parent1ValidationDate).format("DD/MM/YYYY HH:mm")}</div>
          )}
        </div>
        <div className="flex items-center gap-8">
          {young.parentAllowSNU === "false" && (
            <button onClick={openParentsAllowSNUModal} className="mt-2 mb-6 text-blue-600 underline">
              Annuler le refus de consentement
            </button>
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
            dans le cadre d’une mission d’intérêt public.
          </CheckRead>
        </div>
        <div className="mb-[16px] mt-4 flex items-center justify-between text-[16px] font-bold leading-[24px] text-[#242526]">
          <div className="grow">
            {PARENT_STATUS_NAME[young.parent1Status]}{" "}
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
              {translate(young.parent1AllowImageRights) || PENDING_ACCORD}
            </CheckRead>
          </div>
          {(young.parent1AllowImageRights === "true" || young.parent1AllowImageRights === "false") && young.parent1Email && (
            <a href="#" className="mt-2 mr-2 text-blue-600 underline" onClick={(e) => confirmImageRightsChange(1, e)}>
              Modifier
            </a>
          )}
          {(young.parent1AllowImageRights === "true" || young.parent1AllowImageRights === "false") && (
            <a href="#" className="mt-2 text-blue-600 underline" onClick={downloadImageRightDocument}>
              Télécharger {pdfDownloading}
            </a>
          )}
        </div>
        {
          /* lien et relance du droit à l'image du parent 1 si parent1AllowImageRights n'a pas de valeur */
          (young.parent1AllowSNU === "true" || young.parent1AllowSNU === "false") &&
            young.parent1AllowImageRights !== "true" &&
            young.parent1AllowImageRights !== "false" &&
            !readonly && (
              <div className="mt-2 flex items-center justify-between">
                <div
                  className="cursor-pointer italic text-[#1D4ED8]"
                  onClick={() => {
                    copyToClipboard(`${appURL}/representants-legaux/droits-image?token=${young.parent1Inscription2023Token}&parent=1`);
                    toastr.info(translate("COPIED_TO_CLIPBOARD"), "");
                  }}>
                  Copier le lien du formulaire
                </div>
                {young.parent1Email && (
                  <BorderButton
                    mode="blue"
                    onClick={async () => {
                      try {
                        const response = await api.put(`/young-edition/${young._id}/reminder-parent-image-rights`, { parentId: 1 });
                        if (response.ok) {
                          toastr.success(translate("REMINDER_SENT"), "");
                        } else {
                          toastr.error(translate(response.code), "");
                        }
                      } catch (error) {
                        toastr.error(translate(error.code), "");
                      }
                    }}>
                    Relancer
                  </BorderButton>
                )}
              </div>
            )
        }
        {young.parent1AllowSNU === "true" || young.parent1AllowSNU === "false" ? (
          <div className="itemx-center mt-[16px] flex justify-between">
            <div className="grow text-[14px] leading-[20px] text-[#374151]">
              <CheckRead value={young.parent1AllowSNU === "true"}>
                <b>Consentement à la participation : </b>
                {translate(young.parent1AllowSNU) || PENDING_ACCORD}
              </CheckRead>
            </div>
          </div>
        ) : (
          !readonly &&
          young.inscriptionDoneDate && (
            <div className="mt-2 flex items-center justify-between">
              <div
                className="cursor-pointer italic text-[#1D4ED8]"
                onClick={() => {
                  copyToClipboard(`${appURL}/representants-legaux/presentation?token=${young.parent1Inscription2023Token}&parent=1`);
                  toastr.info(translate("COPIED_TO_CLIPBOARD"), "");
                }}>
                Copier le lien du formulaire
              </div>
              {young.parent1Email && (
                <BorderButton
                  mode="blue"
                  onClick={async () => {
                    try {
                      const response = await api.get(`/young-edition/${young._id}/remider/1`);
                      if (response.ok) {
                        toastr.success(translate("REMINDER_SENT"), "");
                      } else {
                        toastr.error(translate(response.code), "");
                      }
                    } catch (error) {
                      toastr.error(translate(error.code), "");
                    }
                  }}>
                  Relancer
                </BorderButton>
              )}
            </div>
          )
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
                      {translate(young.parent2AllowImageRights) || PENDING_ACCORD}
                    </CheckRead>
                  </div>
                  {(young.parent2AllowImageRights === "true" || young.parent2AllowImageRights === "false") && young.parent2Email && (
                    <a href="#" className="mt-2 mr-2 text-blue-600 underline" onClick={(e) => confirmImageRightsChange(2, e)}>
                      Modifier
                    </a>
                  )}
                  {(young.parent2AllowImageRights === "true" || young.parent2AllowImageRights === "false") && (
                    <a href="#" className="mt-2 text-blue-600 underline" onClick={downloadImageRightDocument}>
                      Télécharger {pdfDownloading}
                    </a>
                  )}
                </div>
                {
                  /* lien et relance du droit à l'image du parent 2 si parent2AllowImageRights n'a pas de valeur  et que le droit à l'image a été réinitialisé
                   * on envoit alors vers le formulaire de modification du droit à l'image */
                  young.parent2AllowImageRights !== "true" && young.parent2AllowImageRights !== "false" && young.parent2AllowImageRightsReset === "true" && !readonly && (
                    <div className="mt-2 flex items-center justify-between">
                      <div
                        className="cursor-pointer italic text-[#1D4ED8]"
                        onClick={() => {
                          copyToClipboard(`${appURL}/representants-legaux/droits-image2?token=${young.parent2Inscription2023Token}&parent=2`);
                          toastr.info(translate("COPIED_TO_CLIPBOARD"), "");
                        }}>
                        Copier le lien du formulaire
                      </div>
                      {young.parent2Email && (
                        <BorderButton
                          mode="blue"
                          onClick={async () => {
                            try {
                              const response = await api.put(`/young-edition/${young._id}/reminder-parent-image-rights`, { parentId: 2 });
                              if (response.ok) {
                                toastr.success(translate("REMINDER_SENT"), "");
                              } else {
                                toastr.error(translate(response.code), "");
                              }
                            } catch (error) {
                              toastr.error(translate(error.code), "");
                            }
                          }}>
                          Relancer
                        </BorderButton>
                      )}
                    </div>
                  )
                }
              </>
            )}
            {
              /* lien et relance du consentement (droit à l'image) du parent 2 si parent2AllowImageRights n'a jamais eu de valeur (première demande)
               * on envoit alors vers le formulaire complet de consentement du parent 2 */
              young.parent1AllowSNU === "true" &&
                young.parent1AllowImageRights === "true" &&
                young.parent2AllowSNU !== "false" &&
                !young.parent2AllowImageRights &&
                young.parent2AllowImageRightsReset !== "true" &&
                !readonly && (
                  <div className="mt-2 flex items-center justify-between">
                    <div
                      className="cursor-pointer italic text-[#1D4ED8]"
                      onClick={() => {
                        copyToClipboard(`${appURL}/representants-legaux/presentation-parent2?token=${young.parent2Inscription2023Token}`);
                        toastr.info(translate("COPIED_TO_CLIPBOARD"), "");
                      }}>
                      Copier le lien du formulaire
                    </div>
                    {young.parent2Email && (
                      <BorderButton
                        mode="blue"
                        onClick={async () => {
                          try {
                            const response = await api.get(`/young-edition/${young._id}/remider/2`);
                            if (response.ok) {
                              toastr.success(translate("REMINDER_SENT"), "");
                            } else {
                              toastr.error(translate(response.code), "");
                            }
                          } catch (error) {
                            toastr.error(translate(error.code), "");
                          }
                        }}>
                        Relancer
                      </BorderButton>
                    )}
                  </div>
                )
            }
            {[YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.NOT_AUTORISED].includes(
              young.status,
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
                ) : (
                  !readonly && (
                    <BorderButton mode="red" onClick={parent2RejectSNU}>
                      Déclarer un refus
                    </BorderButton>
                  )
                )}
              </div>
            ) : null}
          </div>
        )}
        {[YOUNG_STATUS.IN_PROGRESS].includes(young.status) && [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) && young.parentAllowSNU !== "true" && (
          <ForceConsentement young={young} onConfirmConsent={handleConfirmConsent} />
        )}
      </div>
      {confirmModal && (
        <ConfirmationModal
          isOpen={true}
          icon={confirmModal.icon}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmLabel || "Confirmer"}
          confirmMode={confirmModal.confirmColor || "blue"}
          onCancel={() => setConfirmModal(null)}
          onConfirm={confirmModal.confirm}
        />
      )}
    </Section>
  );
}
