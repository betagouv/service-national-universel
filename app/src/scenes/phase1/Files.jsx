import React, { useState } from "react";
import { YOUNG_STATUS_PHASE1 } from "../../utils";
import FileCard from "./components/FileCard";
import MedicalFileModal from "./components/MedicalFileModal";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "../../utils/cohorts";
import { CDN_BASE_URL } from "../representants-legaux/commons";
import FileIcon from "@/assets/FileIcon";
import ButtonExternalLinkPrimary from "@/components/ui/buttons/ButtonExternalLinkPrimary";
import { YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";

function getStatusPhase1(young) {
  if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && !cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
    return YOUNG_STATUS_PHASE1.WAITING_AFFECTATION;
  }
  return young.statusPhase1;
}

export default function DocumentsPhase1({ young }) {
  const [isMedicalFileModalOpen, setMedicalFileModalOpen] = useState(false);
  const youngStatusPhase1 = getStatusPhase1(young);

  // TODO: find a better way to implement feature flags
  if (young.status === YOUNG_STATUS.VALIDATED) {
    return (
      <section>
        <h3 className="text-base font-semibold">Document à préparer</h3>
        <p className="text-sm mt-2">Complétez votre fiche sanitaire et préparez vos documents annexes.</p>
        <div className="bg-gray-50 rounded-lg p-3 w-full md:w-64 mt-4 flex flex-col gap-3 items-center">
          <FileIcon filled={true} icon="sanitaire" />
          <p className="text-lg font-bold">Fiche sanitaire</p>
          <p className="text-xs bg-blue-100 text-blue-800 rounded w-fit px-1">Obligatoire</p>
          {young.source === YOUNG_SOURCE.VOLONTAIRE ? (
            <p className="text-xs text-center">La consigne pour transmettre la fiche sanitaire sera précisée lors de l'affectation.</p>
          ) : (
            <p className="text-xs text-center">Remettre l’ensemble des documents en mains propres le jour du départ.</p>
          )}
          <ButtonExternalLinkPrimary href={CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf"} className="w-full">
            Télécharger
          </ButtonExternalLinkPrimary>
        </div>
      </section>
    );
  }

  // TODO: Delete after test
  return (
    <section>
      <MedicalFileModal isOpen={isMedicalFileModalOpen} onClose={() => setMedicalFileModalOpen(false)} />
      <h3 className="text-base font-medium">Document à préparer</h3>
      <span className="text-sm text-[#1F2937]">Complétez votre fiche sanitaire et remettez la à votre arrivée au centre de séjour.</span>
      <div className={`flex flex-col items-center md:flex-row ${youngStatusPhase1 !== YOUNG_STATUS_PHASE1.AFFECTED && "justify-between"} scrollbar-x overflow-x-auto pt-4`}>
        {youngStatusPhase1 !== YOUNG_STATUS_PHASE1.AFFECTED ? (
          <>
            <FileCard
              name="Fiche sanitaire"
              icon="sanitaire"
              filled={young.cohesionStayMedicalFileDownload === "true"}
              color={young.cohesionStayMedicalFileDownload === "true" ? "bg-white text-indigo-700" : "bg-indigo-700 text-white"}
              status={young.cohesionStayMedicalFileReceived === "true" ? "Réceptionnée" : "Ouvrir"}
              onClick={() => setMedicalFileModalOpen(true)}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
