import React, { useEffect, useState } from "react";
import ImageRight from "./ImageRight";
import AutoTest from "./AutoTest";
import MedicalFile from "./MedicalFile";
import Rules from "./Rules";

import { useSelector } from "react-redux";
import { HeroContainer, Hero } from "../../components/Content";
import { FILE_STATUS_PHASE1, translateFileStatusPhase1 } from "../../utils";

export default function NextStep() {
  const young = useSelector((state) => state.Auth.young);
  const [documents, setDocuments] = useState();

  useEffect(() => {
    if (young) {
      let nb = 0;
      if (young.imageRightFilesStatus === FILE_STATUS_PHASE1.VALIDATED) nb++;
      if (young.cohesionStayMedicalFileReceived === "true") nb++;
      if (young.rulesFilesStatus === FILE_STATUS_PHASE1.VALIDATED) nb++;
      if (young.autoTestPCRFilesStatus === FILE_STATUS_PHASE1.VALIDATED) nb++;
      setDocuments(nb);
      console.log(young);
    }
  }, []);

  return (
    <>
      <HeroContainer>
        <Hero>
          <div className="flex flex-col">
            <h2>Documents complété(s) {documents}/4</h2>
            <p>
              Status Fiche Sanitaire:{" "}
              {young.cohesionStayMedicalFileReceived === "true" ? "Réceptionné" : young.cohesionStayMedicalFileDownload === "true" ? "Téléchargé" : "Non Téléchargé"}
            </p>
            <p>
              Status droit a l'image : {translateFileStatusPhase1(young.imageRightFilesStatus)}{" "}
              {young.imageRightFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.imageRightFilesComment : ""}
            </p>
            <p>
              Status règlement interieur : {translateFileStatusPhase1(young.rulesFilesStatus)}
              {young.rulesFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.rulesFilesComment : ""}
            </p>
            <p>
              Status Utilisation d'autotest PCR : {translateFileStatusPhase1(young.autoTestPCRFilesStatus)}
              {young.autoTestPCRFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.autoTestPCRFilesComment : ""}
            </p>
          </div>
        </Hero>
      </HeroContainer>
      <MedicalFile />
      <ImageRight />
      <AutoTest />
      <Rules />
    </>
  );
}
