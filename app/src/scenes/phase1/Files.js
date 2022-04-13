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
  const [isOpenMed, setIsOpenMed] = useState(false);
  const [isOpenIm, setIsOpenIm] = useState(false);
  const [isOpenAut, setIsOpenAut] = useState(false);
  const [isOpenReg, setIsOpenReg] = useState(false);

  // useEffect(() => {
  //   console.log(isOpenReg);
  // }, [isOpenReg]);

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
          <h3>
            Mes documents justificatifs <strong>({documents}/4)</strong>
          </h3>
          <section className="flex justify-between overflow-scroll">
            <FileCard
              name="Fiche sanitaire"
              icon="sanitaire"
              filled={young.cohesionStayMedicalFileDownload === "true"}
              bgColor={young.cohesionStayMedicalFileDownload === "true" ? "bg-indigo-700" : "bg-white"}
              status={young.cohesionStayMedicalFileReceived === "true" ? "Réceptionnée" : young.cohesionStayMedicalFileDownload === "true" ? "Téléchargée" : "Non Téléchargée"}
              onClick={() => setIsOpenMed(true)}
            />
            <FileCard
              name="Droit à l'image"
              icon="image"
              filled={young.imageRightFilesStatus !== "TO_UPLOAD"}
              status={translateFileStatusPhase1(young.imageRightFilesStatus)}
              correction={young.imageRightFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.imageRightFilesComment : ""}
              onClick={() => setIsOpenIm(true)}
            />
            <FileCard
              name="Utilisation d'autotest"
              icon="autotest"
              filled={young.rulesFilesStatus !== "TO_UPLOAD"}
              status={translateFileStatusPhase1(young.rulesFilesStatus)}
              correction={young.rulesFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.rulesFilesComment : ""}
              onClick={() => setIsOpenAut(true)}
            />
            <FileCard
              name="Règlement intérieur"
              icon="reglement"
              filled={young.autoTestPCRFilesStatus !== "TO_UPLOAD"}
              status={translateFileStatusPhase1(young.autoTestPCRFilesStatus)}
              correction={young.autoTestPCRFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? " -> Message : " + young.autoTestPCRFilesComment : ""}
              onClick={() => setIsOpenReg(true)}
            />
          </section>
        </>
      ) : null}
      <MedicalFile isOpen={isOpenMed} onCancel={() => setIsOpenMed(false)} />
      <Rules isOpen={isOpenReg} onCancel={() => setIsOpenReg(false)} />
      <ImageRight isOpen={isOpenIm} onCancel={() => setIsOpenIm(false)} />
      <AutoTest isOpen={isOpenAut} onCancel={() => setIsOpenAut(false)} />
    </>
  );
}
