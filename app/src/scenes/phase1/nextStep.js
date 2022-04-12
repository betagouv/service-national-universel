import React, { useEffect, useState } from "react";
import ImageRight from "./ImageRight";
import AutoTest from "./AutoTest";
import MedicalFile from "./MedicalFile";
import Rules from "./Rules";

import { useSelector } from "react-redux";
import { HeroContainer, Hero } from "../../components/Content";
import { FILE_STATUS_PHASE1, translateFileStatusPhase1 } from "../../utils";
import { environment } from "../../config";
import FileIcon from "../../assets/FileIcon";

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

  console.log(young.autoTestPCRFilesStatus);

  return (
    <>
      {environment !== "production" ? (
        <HeroContainer>
          <Hero>
            <div className="flex flex-col">
              <h2>Documents complété(s) {documents}/4</h2>
              <FileIcon filled={young.cohesionStayMedicalFileDownload === "true" ? true : false} icon="sanitaire" />
              <p>
                Statut Fiche Sanitaire:{" "}
                {young.cohesionStayMedicalFileReceived === "true" ? "Réceptionné" : young.cohesionStayMedicalFileDownload === "true" ? "Téléchargé" : "Non Téléchargé"}
              </p>
              <FileIcon filled={young.imageRightFilesStatus === "TO_UPLOAD" ? false : true} icon="image" />
              <p>
                Statut droit a l&apos;image : {translateFileStatusPhase1(young.imageRightFilesStatus)}{" "}
                {young.imageRightFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.imageRightFilesComment : ""}
              </p>
              <FileIcon filled={young.rulesFilesStatus === "TO_UPLOAD" ? false : true} icon="reglement" />
              <p>
                Statut règlement interieur : {translateFileStatusPhase1(young.rulesFilesStatus)}
                {young.rulesFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.rulesFilesComment : ""}
              </p>
              <FileIcon filled={young.autoTestPCRFilesStatus === "TO_UPLOAD" ? false : true} icon="autotest" />
              <p>
                Statut Utilisation d&apos;autotest PCR : {translateFileStatusPhase1(young.autoTestPCRFilesStatus)}
                {young.autoTestPCRFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.autoTestPCRFilesComment : ""}
              </p>
            </div>
          </Hero>
        </HeroContainer>
      ) : null}
      <MedicalFile />
      <ImageRight />
      <AutoTest />
      <Rules />
    </>
  );
}
