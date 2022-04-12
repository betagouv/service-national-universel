import React, { useEffect, useState } from "react";
import ImageRight from "./ImageRight";
import AutoTest from "./AutoTest";
import MedicalFile from "./MedicalFile";
import Rules from "./Rules";

import { useSelector } from "react-redux";
import { HeroContainer, Hero } from "../../components/Content";
import { FILE_STATUS_PHASE1, translateFileStatusPhase1 } from "../../utils";
import { environment } from "../../config";
import FileCard from "./components/FileCard";

export default function DocumentsPhase1({ young }) {
  const [documents, setDocuments] = useState();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log(isOpen);
  }, [isOpen]);

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
      {environment !== "production" ? (
        <>
          <h3>Mes documents justificatifs {documents}/4</h3>
          <FileCard
            name="Fiche sanitaire"
            icon="sanitaire"
            filled={young.cohesionStayMedicalFileDownload === "true"}
            status={young.cohesionStayMedicalFileReceived === "true" ? "Réceptionnée" : young.cohesionStayMedicalFileDownload === "true" ? "Téléchargée" : "Non Téléchargée"}
            onClick={() => setIsOpen(true)}
          />
          <FileCard
            name="Droit à l'image"
            icon="image"
            filled={young.imageRightFilesStatus !== "TO_UPLOAD"}
            status={translateFileStatusPhase1(young.imageRightFilesStatus)}
            correction={young.imageRightFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.imageRightFilesComment : ""}
          />
          <FileCard
            name="Utilisation d'autotest"
            icon="autotest"
            filled={young.rulesFilesStatus !== "TO_UPLOAD"}
            status={translateFileStatusPhase1(young.rulesFilesStatus)}
            correction={young.rulesFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.rulesFilesComment : ""}
          />
          <FileCard
            name="Règlement intérieur"
            icon="reglement"
            filled={young.autoTestPCRFilesStatus !== "TO_UPLOAD"}
            status={translateFileStatusPhase1(young.autoTestPCRFilesStatus)}
            correction={young.autoTestPCRFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.autoTestPCRFilesComment : ""}
          />
        </>
      ) : null}
      <MedicalFile isOpen={isOpen} onCancel={() => setIsOpen(false)} />
    </>
  );
}
