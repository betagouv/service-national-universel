import React, { useEffect, useState } from "react";
import FileIcon from "../../../assets/FileIcon";
import { FILE_STATUS_PHASE1, translate, translateFileStatusPhase1 } from "../../../utils";
import ButtonPlain from "../../volontaires/components/ButtonPlain";
import ModalDocument from "./ModalDocument";

export default function DocumentPhase1(props) {
  const young = props.young;
  const [statusCohesionStayMedical, setStatusCohesionStayMedical] = useState();
  const [statusAutoTestPCR, setStatusAutoTestPCR] = useState();
  const [statusImageRight, setStatusImageRight] = useState();
  const [statusRules, setStatusRules] = useState();
  const [dataImageRight, setDataImageRight] = useState();
  const [dataAutoTestPCR, setDataAutoTestPCR] = useState();
  const [isOpenImg, setIsOpenImg] = useState(false);
  const [isOpenAut, setIsOpenAut] = useState(false);
  const options = [FILE_STATUS_PHASE1.TO_UPLOAD, FILE_STATUS_PHASE1.WAITING_VERIFICATION, FILE_STATUS_PHASE1.WAITING_CORRECTION, FILE_STATUS_PHASE1.VALIDATED];
  const medicalFileOptions = [
    { value: "RECEIVED", label: "Réceptionné" },
    { value: "TO_DOWNLOAD", label: "Non téléchargé" },
    { value: "DOWNLOADED", label: "Téléchargé" },
  ];

  const rulesFileOptions = [
    { value: "true", label: "Accepté" },
    { value: "false", label: "Non renseigné" },
  ];

  useEffect(() => {
    if (young) {
      if (young.cohesionStayMedicalFileReceived !== "true") {
        if (young.cohesionStayMedicalFileDownload === "false") {
          setStatusCohesionStayMedical("TO_DOWNLOAD");
        } else {
          setStatusCohesionStayMedical("DOWNLOADED");
        }
      } else {
        setStatusCohesionStayMedical("RECEIVED");
      }
      setStatusAutoTestPCR(young.autoTestPCRFilesStatus);
      setStatusImageRight(young.imageRightFilesStatus);
      setStatusRules(young.rulesYoung);
      setDataImageRight({
        imageRight: young.imageRight,
        imageRightFiles: young.files.imageRightFiles,
      });
      setDataAutoTestPCR({
        autoTestPCR: young.autoTestPCR,
        autoTestPCRFiles: young.files.autoTestPCRFiles,
      });
    }
  }, [young]);

  if (!dataImageRight && !dataAutoTestPCR) return null;

  return (
    <>
      <article className="flex items-start justify-between flex-wrap">
        <div className="flex flex-col justify-center items-center">
          <section className="bg-gray-50 rounded-lg w-[280px] h-[300px] m-2 flex flex-col items-center justify-start p-4">
            <div className="flex row justify-center mx-2 mb-3">
              <select disabled className="form-control text-sm" value={statusRules} name="rules">
                {rulesFileOptions.map((o, i) => (
                  <option key={i} value={o.value} label={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <FileIcon icon="reglement" filled={young.rulesYoung === "true"} />
            <p className="text-base font-bold mt-2">Règlement intérieur</p>
          </section>
        </div>
        <div className="flex flex-col justify-center items-center">
          <section className="bg-gray-50 rounded-lg w-[280px] h-[300px] m-2 flex flex-col items-center justify-start p-4">
            <div className="flex row justify-center mx-2 mb-3">
              <select disabled className="form-control text-sm" value={statusCohesionStayMedical} name="cohesionStayMedical">
                {medicalFileOptions.map((o) => (
                  <option key={o.label} data-color="green" value={o.value} label={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <FileIcon icon="sanitaire" filled={young.cohesionStayMedicalFileDownload === "true"} />
            <p className="text-base font-bold mt-2">Fiche sanitaire</p>
          </section>
        </div>
        <div className="flex flex-col justify-center items-center">
          <section className="bg-gray-50 rounded-lg w-[280px] h-[300px] m-2 flex flex-col items-center justify-start p-4">
            <div className="flex row justify-center mx-2 mb-3">
              <select disabled className="form-control text-sm" value={statusImageRight} name="imageRight">
                {options.map((o, i) => (
                  <option key={i} value={o} label={translateFileStatusPhase1(o)}>
                    {translateFileStatusPhase1(o)}
                  </option>
                ))}
              </select>
            </div>
            <FileIcon icon="image" filled={young.imageRightFilesStatus !== "TO_UPLOAD"} />
            <p className="text-base font-bold mt-2">Droit à l&apos;image</p>
            <p className="text-gray-500">
              Accord : {dataImageRight.imageRight && young.files.imageRightFilesStatus !== "TO_UPLOAD" ? translate(dataImageRight.imageRight) : "Non renseigné"}
            </p>
            {young.files.imageRightFiles.length ? <ButtonPlain onClick={() => setIsOpenImg(true)}>Télécharger</ButtonPlain> : null}
          </section>
          <ModalDocument
            isOpen={isOpenImg}
            onCancel={() => setIsOpenImg(false)}
            initialValues={dataImageRight}
            young={young}
            nameFiles="imageRightFiles"
            title="Consentement de droit à l'image"
          />
        </div>
        <div className="flex flex-col justify-center items-center">
          <section className="bg-gray-50 rounded-lg w-[280px] h-[300px] m-2 flex flex-col items-center justify-start p-4">
            <div className="flex row justify-center mx-2 mb-3">
              <select disabled className="form-control text-sm" value={statusAutoTestPCR} name="autoTestPCR">
                {options.map((o) => (
                  <option key={o} value={o} label={translateFileStatusPhase1(o)}>
                    {translateFileStatusPhase1(o)}
                  </option>
                ))}
              </select>
            </div>
            <FileIcon icon="autotest" filled={young.files.autoTestPCRFilesStatus !== "TO_UPLOAD"} />
            <p className="text-base font-bold mt-2">Autotest PCR</p>
            <p className="text-gray-500">
              Accord : {dataAutoTestPCR.autoTestPCR && young.files.autoTestPCRFilesStatus !== "TO_UPLOAD" ? translate(dataAutoTestPCR.autoTestPCR) : "Non renseigné"}
            </p>
            {young.files.autoTestPCRFiles.length ? <ButtonPlain onClick={() => setIsOpenAut(true)}>Télécharger</ButtonPlain> : null}
          </section>
          <ModalDocument
            isOpen={isOpenAut}
            onCancel={() => setIsOpenAut(false)}
            initialValues={dataAutoTestPCR}
            young={young}
            nameFiles="autoTestPCRFiles"
            title="Consentement à l'utilisation d'autotest COVID"
          />
        </div>
      </article>
    </>
  );
}
