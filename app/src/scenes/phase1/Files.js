import React, { useEffect, useState } from "react";
import ImageRight from "./ImageRight";
import AutoTest from "./AutoTest";
import MedicalFile from "./MedicalFile";
import Rules from "./Rules";
import styled from "styled-components";

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

  useEffect(() => {
    if (young) {
      let nb = 0;
      if (young.imageRightFilesStatus === FILE_STATUS_PHASE1.VALIDATED) nb++;
      if (young.cohesionStayMedicalFileReceived === "true") nb++;
      if (young.rulesYoung === "true") nb++;
      if (young.autoTestPCRFilesStatus === FILE_STATUS_PHASE1.VALIDATED) nb++;
      setDocuments(nb);
    }
  }, []);

  return (
    <>
      {environment !== "production" ? (
        <>
          <h3>
            Mes documents justificatifs <strong>({documents}/4)</strong>
          </h3>
          <ScrollSection className="flex justify-between overflow-x-auto scrollbar-x pt-4">
            <FileCard
              name="Règlement intérieur"
              icon="reglement"
              filled={young.rulesYoung === "true"}
              color={young.rulesYoung !== "true" ? "bg-indigo-700 text-white" : "bg-white text-indigo-700"}
              status={young.rulesYoung === "true" ? "Accepté" : "À renseigner"}
              onClick={() => setIsOpenReg(true)}
            />
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
            <FileCard
              name="Droit à l'image"
              icon="image"
              filled={young.imageRightFilesStatus !== "TO_UPLOAD"}
              color={["TO_UPLOAD", "WAITING_CORRECTION"].includes(young.imageRightFilesStatus) ? "bg-indigo-700 text-white" : "bg-white text-indigo-700"}
              status={translateFileStatusPhase1(young.imageRightFilesStatus)}
              onClick={() => setIsOpenIm(true)}
            />
            <FileCard
              name="Utilisation d'autotest"
              icon="autotest"
              filled={young.autoTestPCRFilesStatus !== "TO_UPLOAD"}
              color={["TO_UPLOAD", "WAITING_CORRECTION"].includes(young.autoTestPCRFilesStatus) ? "bg-indigo-700 text-white" : "bg-white text-indigo-700"}
              status={translateFileStatusPhase1(young.autoTestPCRFilesStatus)}
              onClick={() => setIsOpenAut(true)}
            />
          </ScrollSection>
        </>
      ) : null}
      <MedicalFile isOpen={isOpenMed} onCancel={() => setIsOpenMed(false)} />
      <Rules isOpen={isOpenReg} onCancel={() => setIsOpenReg(false)} />
      <ImageRight
        isOpen={isOpenIm}
        onCancel={() => setIsOpenIm(false)}
        correction={young.imageRightFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? young.imageRightFilesComment : ""}
      />
      <AutoTest
        isOpen={isOpenAut}
        onCancel={() => setIsOpenAut(false)}
        correction={young.autoTestPCRFilesStatus === FILE_STATUS_PHASE1.WAITING_CORRECTION ? young.autoTestPCRFilesComment : ""}
      />
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
