import React, { useEffect, useState } from "react";
import { YOUNG_STATUS_PHASE1 } from "../../utils";
import FileCard from "./components/FileCard";
import MedicalFile from "./MedicalFile";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "../../utils/cohorts";

export default function DocumentsPhase1({ young }) {
  const [isOpenMed, setIsOpenMed] = useState(false);
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
      <h3 className="text-2xl font-medium">Ma fiche sanitaire</h3>
      <div className={`flex flex-col md:flex-row items-center ${youngStatusPhase1 !== YOUNG_STATUS_PHASE1.AFFECTED && "justify-between"} overflow-x-auto scrollbar-x pt-4`}>
        {youngStatusPhase1 !== YOUNG_STATUS_PHASE1.AFFECTED ? (
          <>
            <FileCard
              name="Fiche sanitaire"
              icon="sanitaire"
              filled={young.cohesionStayMedicalFileDownload === "true"}
              color={young.cohesionStayMedicalFileDownload === "true" ? "bg-white text-indigo-700" : "bg-indigo-700 text-white"}
              status={
                young.cohesionStayMedicalFileReceived === "true" ? "Réceptionnée" : young.cohesionStayMedicalFileDownload === "true" ? "Télécharger de nouveau" : "Télécharger"
              }
              onClick={() => setIsOpenMed(true)}
            />
          </>
        ) : null}
      </div>
      <MedicalFile isOpen={isOpenMed} onCancel={() => setIsOpenMed(false)} />
    </section>
  );
}
