import React, { useEffect, useState } from "react";
import styled from "styled-components";
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
    <>
      <h3 className="text-2xl font-medium">Ma fiche sanitaire</h3>
      <ScrollSection
        className={`flex flex-col md:flex-row items-center ${youngStatusPhase1 !== YOUNG_STATUS_PHASE1.AFFECTED && "justify-between"} overflow-x-auto scrollbar-x pt-4`}>
        {youngStatusPhase1 !== YOUNG_STATUS_PHASE1.AFFECTED ? (
          <>
            <FileCard
              name="Fiche sanitaire"
              icon="sanitaire"
              filled={young.cohesionStayMedicalFileDownload === "true"}
              color={young.cohesionStayMedicalFileDownload === "true" ? "bg-white text-indigo-700" : "bg-indigo-700 text-white"}
              status={
                young.cohesionStayMedicalFileReceived === "true" ? "Réceptionnée" : young.cohesionStayMedicalFileDownload === "true" ? "Télécharger de nouveau" : "Non Téléchargée"
              }
              onClick={() => setIsOpenMed(true)}
            />
          </>
        ) : null}
      </ScrollSection>
      <MedicalFile isOpen={isOpenMed} onCancel={() => setIsOpenMed(false)} />
    </>
  );
}

const ScrollSection = styled.section`
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
