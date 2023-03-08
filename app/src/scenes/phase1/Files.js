import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { YOUNG_STATUS_PHASE1 } from "../../utils";
import FileCard from "./components/FileCard";
import MedicalFile from "./MedicalFile";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "../../utils/cohorts";
import { Link } from "react-router-dom";
import ChevronRight from "../../assets/icons/ChevronRight";

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
      <h2 className="text-lg font-medium mb-1">Documents à préparer</h2>
      <p className="text-sm mb-2">Renseignez votre fiche sanitaire et remettez la à votre arrivée au centre de séjour.</p>
      <Link to="/" className="d-flex gap-2 items-center text-blue-600 text-xs mb-7">
        Voir le mode d&apos;emploi <ChevronRight className="mt-1" />
      </Link>
      <ScrollSection className={`flex flex-col md:flex-row items-center ${youngStatusPhase1 !== YOUNG_STATUS_PHASE1.AFFECTED && "justify-between"} overflow-x-auto scrollbar-x`}>
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
      </ScrollSection>
      <MedicalFile isOpen={isOpenMed} onCancel={() => setIsOpenMed(false)} />
    </section>
  );
}

const ScrollSection = styled.div`
  ::-webkit-scrollbar {
    height: 10px; /* height of horizontal scrollbar ← You're missing this */
    border: 2px solid #fff;
    background: rgb(249 250 251);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    height: 5px;
    background-color: #d5d5d5;
    border-radius: 10px;
  }
`;
