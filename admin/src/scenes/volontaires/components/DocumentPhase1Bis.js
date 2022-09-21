import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import FileIcon from "../../../assets/FileIcon";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import api from "../../../services/api";
import { FILE_STATUS_PHASE1, SENDINBLUE_TEMPLATES, translate, translateFileStatusPhase1 } from "../../../utils";
import ButtonPlain from "./ButtonPlain";
import ModalDocument from "./ModalDocument";

export default function DocumentPhase1(props) {
  const [young, setYoung] = useState(props.young);
  const [statusCohesionStayMedical, setStatusCohesionStayMedical] = useState();
  const [statusAutoTestPCR, setStatusAutoTestPCR] = useState();
  const [statusImageRight, setStatusImageRight] = useState();
  const [statusRules, setStatusRules] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loading, setLoading] = useState(false);
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

  const medicalFileValue = {
    RECEIVED: { cohesionStayMedicalFileReceived: "true", cohesionStayMedicalFileDownload: "true" },
    TO_DOWNLOAD: { cohesionStayMedicalFileReceived: "false", cohesionStayMedicalFileDownload: "false" },
    DOWNLOADED: { cohesionStayMedicalFileReceived: "false", cohesionStayMedicalFileDownload: "true" },
  };

  const rulesFileOptions = [
    { value: "true", label: "Accepté" },
    { value: "false", label: "Non renseigné" },
  ];

  const updateYoung = async () => {
    const { data } = await api.get(`/referent/young/${young._id}`);
    if (data) setYoung(data);
    setLoading(false);
  };

  const handleEmailClick = async (view) => {
    setLoading(true);
    let template;
    let body = {};
    if (["autoTestPCR", "imageRight", "rules"].includes(view)) {
      template = SENDINBLUE_TEMPLATES.young.PHASE_1_FOLLOW_UP_DOCUMENT;
      body = { type_document: translateFileStatusPhase1(view) };
    } else if (view === "cohesionStayMedical") {
      template = SENDINBLUE_TEMPLATES.young.PHASE_1_FOLLOW_UP_MEDICAL_FILE;
    }

    try {
      const { ok } = await api.post(`/young/${young._id}/email/${template}`, body);
      if (!ok) return toastr.error("Une erreur s'est produite lors de la relance du volontaire");
      toastr.success("Relance du volontaire envoyée avec succès");
      setLoading(false);
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue lors de l'envoie de la relance :", translate(e.code));
      setLoading(false);
    }
  };

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

  const setState = (key, value) => {
    switch (key) {
      case "cohesionStayMedical":
        setStatusCohesionStayMedical(value);
        break;
      case "autoTestPCR":
        setStatusAutoTestPCR(value);
        break;
      case "imageRight":
        setStatusImageRight(value);
        break;
      case "rules":
        setStatusRules(value);
        break;
    }
  };

  const needModal = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setLoading(true);

    if (value === FILE_STATUS_PHASE1.WAITING_CORRECTION) {
      setModal({
        isOpen: true,
        onConfirm: (correctionMessage) => {
          setState(name, value);
          handleChange({ value, name, correctionMessage });
        },
        title: `Vous êtes sur le point de demander la correction du document ${translateFileStatusPhase1(name)}`,
        message: `Car celui n’est pas conforme. Merci de préciser ci-dessous les corrections à apporter.
        Une fois le message validé, il sera transmis par mail à ${young.firstName} ${young.lastName} (${young.email}).`,
      });
    } else {
      setState(name, value);
      handleChange({ value, name });
    }
  };

  const handleChange = async ({ value, name, correctionMessage = null }) => {
    let params = {};
    console.log(value, name);
    if (["autoTestPCR", "imageRight"].includes(name)) {
      params[`${name}FilesStatus`] = value;
      if (value === FILE_STATUS_PHASE1.WAITING_CORRECTION && correctionMessage) {
        params[`${name}FilesComment`] = correctionMessage;
      }
    } else if (name === "cohesionStayMedical") {
      params = medicalFileValue[value];
    } else if (name === "rules") {
      params.rulesYoung = value;
    }

    try {
      const { code, ok } = await api.put(`/referent/young/${young._id}/phase1Status/${name}`, params);
      if (!ok) return toastr.error("Une erreur s'est produite lors de la mise a jour des status :", translate(code));
      toastr.success("Statut mis à jour!");
      updateYoung();
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant la mise à jour des status :", translate(e.code));
    }
  };

  if (!dataImageRight && !dataAutoTestPCR) return null;

  return (
    <>
      <article className="flex items-start justify-between gap-6 px-2">
        <div className="flex flex-col justify-center items-center basis-1/4">
          <section className="bg-gray-50 rounded-[7px] m-2 flex flex-col items-center justify-start py-3 h-[300px] w-full">
            <div className="flex row justify-center mx-2 mb-3 w-full ">
              <select
                disabled={loading}
                className="form-control w-full mx-6 py-[8px] pr-[13px] pl-[17px] h-[40px] text-xs text-medium rounded-[6px] border-[1px] border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                value={statusRules}
                name="rules"
                onChange={(e) => needModal(e)}>
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
          {statusRules !== "true" && (
            <ButtonPlain
              tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
              disabled={loading}
              className="border rounded-lg m-2 px-4 py-2"
              onClick={() => handleEmailClick("rules")}>
              Relancer le volontaire
            </ButtonPlain>
          )}
        </div>
        <div className="flex flex-col justify-center items-center basis-1/4">
          <section className="bg-gray-50 rounded-[7px] m-2 flex flex-col items-center justify-start py-3 h-[300px] w-full">
            <div className="flex row justify-center mx-2 mb-3 w-full">
              <select
                disabled={loading}
                className="form-control w-full mx-6 py-[8px] pr-[13px] pl-[17px] h-[40px] text-xs text-medium rounded-[6px] border-[1px] border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                value={statusCohesionStayMedical}
                name="cohesionStayMedical"
                onChange={(e) => needModal(e)}>
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
          {statusCohesionStayMedical === "TO_DOWNLOAD" && (
            <ButtonPlain
              tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
              disabled={loading}
              className="border rounded-lg m-2 px-4 py-2"
              onClick={() => handleEmailClick("cohesionStayMedical")}>
              Relancer le volontaire
            </ButtonPlain>
          )}
        </div>
        <div className="flex flex-col justify-center items-center basis-1/4">
          <section className="bg-gray-50 rounded-[7px] m-2 flex flex-col items-center justify-start py-3 h-[300px] w-full">
            <div className="flex row justify-center mx-2 mb-3 w-full">
              <select
                disabled={loading}
                className="form-control w-full mx-6 py-[8px] pr-[13px] pl-[17px] h-[40px] text-xs text-medium rounded-[6px] border-[1px] border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                value={statusImageRight}
                name="imageRight"
                onChange={(e) => needModal(e)}>
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
              Accord : {dataImageRight.imageRight && young.imageRightFilesStatus !== "TO_UPLOAD" ? translate(dataImageRight.imageRight) : "Non renseigné"}
            </p>
            <ButtonPlain onClick={() => setIsOpenImg(true)}>Gérer le document</ButtonPlain>
          </section>
          <ModalDocument
            isOpen={isOpenImg}
            onCancel={() => setIsOpenImg(false)}
            initialValues={dataImageRight}
            updateYoung={updateYoung}
            young={young}
            name="imageRight"
            nameFiles="imageRightFiles"
            title="Consentement de droit à l'image"
            comment={young.imageRightFilesComment}
          />
          {statusImageRight === FILE_STATUS_PHASE1.TO_UPLOAD && (
            <ButtonPlain
              tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
              disabled={loading}
              className="border rounded-lg m-2 px-4 py-2"
              onClick={() => handleEmailClick("imageRight")}>
              Relancer le volontaire
            </ButtonPlain>
          )}
        </div>
        <div className="flex flex-col justify-center items-center basis-1/4">
          <section className="bg-gray-50 rounded-[7px] m-2 flex flex-col items-center justify-start py-3 h-[300px] w-full">
            <div className="flex row justify-center mx-2 mb-3 w-full">
              <select
                disabled={loading}
                className="form-control w-full mx-6 py-[8px] pr-[13px] pl-[17px] h-[40px] text-xs text-medium rounded-[6px] border-[1px] border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                value={statusAutoTestPCR}
                name="autoTestPCR"
                onChange={(e) => needModal(e)}>
                {options.map((o) => (
                  <option key={o} value={o} label={translateFileStatusPhase1(o)}>
                    {translateFileStatusPhase1(o)}
                  </option>
                ))}
              </select>
            </div>
            <FileIcon icon="autotest" filled={young.autoTestPCRFilesStatus !== "TO_UPLOAD"} />
            <p className="text-base font-bold mt-2">Autotest PCR</p>
            <p className="text-gray-500">
              Accord : {dataAutoTestPCR.autoTestPCR && young.autoTestPCRFilesStatus !== "TO_UPLOAD" ? translate(dataAutoTestPCR.autoTestPCR) : "Non renseigné"}
            </p>
            <ButtonPlain onClick={() => setIsOpenAut(true)}>Gérer le document</ButtonPlain>
          </section>
          <ModalDocument
            isOpen={isOpenAut}
            onCancel={() => setIsOpenAut(false)}
            initialValues={dataAutoTestPCR}
            young={young}
            name="autoTestPCR"
            nameFiles="autoTestPCRFiles"
            title="Consentement à l'utilisation d'autotest COVID"
            comment={young.autoTestPCRFilesComment}
          />
          {statusAutoTestPCR === FILE_STATUS_PHASE1.TO_UPLOAD && (
            <ButtonPlain
              tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
              disabled={loading}
              className="border rounded-lg m-2 px-4 py-2"
              onClick={() => handleEmailClick("autoTestPCR")}>
              Relancer le volontaire
            </ButtonPlain>
          )}
        </div>
        <ModalConfirmWithMessage
          isOpen={modal?.isOpen}
          title={modal?.title}
          message={modal?.message}
          placeholder="Précisez les corrections à apporter ici"
          onChange={() => {
            setModal({ isOpen: false, onConfirm: null }), setLoading(false);
          }}
          onConfirm={(message) => {
            modal?.onConfirm(message);
            setModal({ isOpen: false, onConfirm: null });
          }}
        />
      </article>
    </>
  );
}
