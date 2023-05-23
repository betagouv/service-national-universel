import React, { useEffect, useState } from "react";
import { YOUNG_STATUS_PHASE1 } from "../../utils";
import FileCard from "./components/FileCard";
import MedicalFileModal from "./components/MedicalFileModal";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "../../utils/cohorts";

export default function DocumentsPhase1({ young }) {
  const [isMedicalFileModalOpen, setMedicalFileModalOpen] = useState(false);
  const [youngStatusPhase1, setYoungStatusPhase1] = useState(young.statusPhase1);

  useEffect(() => {
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED) {
      if (cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
        setYoungStatusPhase1(YOUNG_STATUS_PHASE1.AFFECTED);
      } else {
        setYoungStatusPhase1(YOUNG_STATUS_PHASE1.WAITING_AFFECTATION);
      }
    } else {
      setYoungStatusPhase1(young.statusPhase1);
    }
  }, [young]);

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
