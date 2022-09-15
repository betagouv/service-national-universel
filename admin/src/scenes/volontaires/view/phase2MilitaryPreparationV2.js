import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import { BsCheck2, BsChevronDown } from "react-icons/bs";
import { GoPrimitiveDot } from "react-icons/go";
import Bell from "../../../assets/icons/Bell";
import CheckCircle from "../../../assets/icons/CheckCircle";
import ChevronDown from "../../../assets/icons/ChevronDown";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";
import XCircle from "../../../assets/icons/XCircle";
import FileCard from "../../../components/FileCard";
import Loader from "../../../components/Loader";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import api from "../../../services/api";
import { APPLICATION_STATUS, SENDINBLUE_TEMPLATES, translate, translateStatusMilitaryPreparationFiles } from "../../../utils";
import ModalFilesPM from "../components/ModalFilesPM";
import { capture } from "../../../sentry";

export default function Phase2militaryPrepartionV2({ young }) {
  const optionsStatus = ["WAITING_CORRECTION", "REFUSED", "VALIDATED"];
  const [applicationsToMilitaryPreparation, setApplicationsToMilitaryPreparation] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, template: null, data: null });
  const [modalFiles, setModalFiles] = useState({ isOpen: false });
  const [cardOpen, setCardOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  const history = useHistory();

  const theme = {
    WAITING_VERIFICATION: "text-sky-400 h-4 w-4",
    WAITING_CORRECTION: "text-[#4484FF] h-4 w-4",
    VALIDATED: "text-[#27AF66] h-4 w-4",
    REFUSED: "text-[#EF6737] h-4 w-4",
  };

  const themeBadge = {
    background: {
      WAITING_VERIFICATION: "bg-sky-100",
      WAITING_CORRECTION: "bg-[#FD7A02]",
      VALIDATED: "bg-[#71C784]",
      REFUSED: "bg-red-500",
    },
    text: {
      WAITING_VERIFICATION: "text-sky-600",
      WAITING_CORRECTION: "text-white",
      VALIDATED: "text-white",
      REFUSED: "text-white",
    },
  };

  useEffect(() => {
    getApplications();
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/young/${young._id}/application`);
    if (!ok) {
      capture(code);
      return toastr.error("Oups, une erreur est survenue", code);
    }
    return setApplicationsToMilitaryPreparation(data?.filter((a) => a?.mission?.isMilitaryPreparation === "true"));
  };

  if (!applicationsToMilitaryPreparation) return <Loader />;

  if (!["WAITING_VERIFICATION", "VALIDATED", "WAITING_CORRECTION", "REFUSED"].includes(young.statusMilitaryPreparationFiles)) {
    // display nothing if the young has not validated the files at least one time
    return null;
  }

  const handleValidate = () => {
    setModal({ isOpen: true, template: "confirm" });
  };
  const onValidate = async () => {
    try {
      // validate the files
      const responseYoung = await api.put(`/referent/young/${young._id}`, { statusMilitaryPreparationFiles: "VALIDATED" });
      if (!responseYoung.ok) return toastr.error(translate(responseYoung.code), "Une erreur s'est produite lors de la validation des documents");

      // change status of applications
      for (let i = 0; i < applicationsToMilitaryPreparation.length; i++) {
        const app = applicationsToMilitaryPreparation[i];
        if (app.status === APPLICATION_STATUS.WAITING_VERIFICATION) {
          const responseApplication = await api.put("/application", { _id: app._id, status: "WAITING_VALIDATION" });
          if (!responseApplication.ok)
            toastr.error(
              translate(responseApplication.code),
              `Une erreur s'est produite lors du changement automatique de statut de la candidtature à la mission : ${app.missionName}`,
            );
        }
      }
      setModal({ isOpen: false, template: null, data: null });
      await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_VALIDATED}`);
      for (let i = 0; i < applicationsToMilitaryPreparation.length; i++) {
        const app = applicationsToMilitaryPreparation[i];
        if (app.status === APPLICATION_STATUS.WAITING_VERIFICATION) {
          await api.post(`/referent/${app.tutorId}/email/${SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_VALIDATED}`, { app });
        }
      }
    } catch (e) {
      console.error(e);
      toastr.error("Une erreur est survenue", translate(e.code));
    }
    //Refresh
    history.go(0);
  };

  const handleCorrection = () => {
    setModal({ isOpen: true, template: "correction" });
  };
  const onCorrection = async (message) => {
    // update the young
    const responseYoung = await api.put(`/referent/young/${young._id}`, { statusMilitaryPreparationFiles: "WAITING_CORRECTION", militaryPreparationCorrectionMessage: message });
    if (!responseYoung.ok) return toastr.error(translate(responseYoung.code), "Une erreur s'est produite lors de la validation des documents");

    await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_CORRECTION}`, { message });
    toastr.success("Email envoyé !");
    setModal({ isOpen: false, template: null, data: null });
    // Refresh
    history.go(0);
  };

  const handleRefused = () => {
    setModal({ isOpen: true, template: "refuse" });
  };

  const onRefuse = async (message) => {
    // update the young
    const responseYoung = await api.post(`/referent/young/${young._id}/refuse-military-preparation-files`);
    if (!responseYoung.ok) return toastr.error(translate(responseYoung.code), "Une erreur s'est produite lors de la validation des documents");

    // change status of applications if its not already correct
    for (let i = 0; i < applicationsToMilitaryPreparation.length; i++) {
      const app = applicationsToMilitaryPreparation[i];
      if (app.status === APPLICATION_STATUS.WAITING_VERIFICATION) {
        const responseApplication = await api.put("/application", { _id: app._id, status: "REFUSED" });
        if (!responseApplication.ok)
          toastr.error(
            translate(responseApplication.code),
            `Une erreur s'est produite lors du changement automatique de statut de la candidtature à la mission : ${app.missionName}`,
          );
      }
    }
    await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_REFUSED}`, { message });
    toastr.success("Email envoyé !");
    setModal({ isOpen: false, template: null, data: null });
    // Refresh
    history.go(0);
  };

  return (
    <>
      <ModalConfirm
        isOpen={modal.isOpen && modal.template === "confirm"}
        topTitle="alerte"
        title={`Vous êtes sur le point de confirmer l'éligibilité de ${young.firstName} à la préparation militaire, sur la base des documents reçus.`}
        message={`Une fois l'éligibilité confirmée un mail sera envoyé à ${young.firstName} (${young.email}).`}
        onCancel={() => setModal({ isOpen: false, template: null, data: null })}
        onConfirm={onValidate}
      />
      <ModalConfirmWithMessage
        isOpen={modal.isOpen && modal.template === "correction"}
        topTitle="alerte"
        title={`Attention, vous êtes sur le point de demander des corrections aux documents envoyés, car ces derniers ne vous permettent pas de confirmer ou d'infirmer l'éligibilité de ${young.firstName} à la préparation militaire`}
        message={`Une fois le message ci-dessous validé, il sera transmis par mail à ${young.firstName} (${young.email}).`}
        young={young}
        onChange={() => setModal({ isOpen: false, template: null, data: null })}
        onConfirm={onCorrection}
      />
      <ModalConfirmWithMessage
        isOpen={modal.isOpen && modal.template === "refuse"}
        topTitle="alerte"
        title={`Attention, vous êtes sur le point d'infirmer l'éligibilité de ${young.firstName} à la préparation militaire, sur la base des documents reçus.`}
        message={`Merci de motiver votre refus au jeune en lui expliquant sur quelle base il n'est pas éligible à la préparation militaire. Une fois le message ci-dessous validé, il sera transmis par mail à ${young.firstName} (${young.email}).`}
        young={young}
        onChange={() => setModal({ isOpen: false, template: null, data: null })}
        onConfirm={onRefuse}
      />
      {modalFiles.nameFiles ? (
        <ModalFilesPM
          isOpen={modalFiles?.isOpen}
          onCancel={() => setModalFiles({ isOpen: false })}
          title={modalFiles?.title}
          path={`/young/${young._id}/documents/${modalFiles?.nameFiles}`}
        />
      ) : null}
      <div className="flex flex-col w-full rounded-lg bg-white px-4 pt-3 mb-4 shadow-md">
        <div className="mb-3">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              <div className="duration-150 flex rounded-full bg-[#FD7A02] p-2 items-center justify-center mr-2">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div className="text-base leading-5 font-bold">Dossier d’éligibilité aux préparations militaires</div>
            </div>
            {!cardOpen ? (
              <div className="flex items-center gap-5">
                <div
                  className={`text-xs font-normal ${themeBadge.background[young.statusMilitaryPreparationFiles]} ${
                    themeBadge.text[young.statusMilitaryPreparationFiles]
                  } px-2 py-[2px] rounded-sm `}>
                  {translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}
                </div>
                <BsChevronDown className="text-gray-400 h-5 w-5 cursor-pointer" onClick={() => setCardOpen(true)} />
              </div>
            ) : (
              <>
                {/* todo: remove WAITING_VALIDATION after sync */}
                {young.statusMilitaryPreparationFiles === "WAITING_VERIFICATION" ? (
                  <div className="flex items-center gap-5 ">
                    <button
                      className="group flex items-center justify-center rounded-lg shadow-ninaButton px-4 py-2 hover:bg-indigo-400 transition duration-300 ease-in-out"
                      onClick={() => handleCorrection()}>
                      <ExclamationCircle className="text-indigo-400 mr-2 w-5 h-5 group-hover:text-white" />
                      <span className="text-sm leading-5 font-medium text-gray-700 group-hover:text-white">Demander une correction</span>
                    </button>
                    <button
                      className="flex items-center justify-center rounded-lg px-4 py-2 bg-green-500 hover:bg-green-400 transition duration-300 ease-in-ou"
                      onClick={() => handleValidate()}>
                      <CheckCircle className="text-green-500 mr-2 w-5 h-5 hover:bg-green-400" />
                      <span className="text-sm leading-5 font-medium text-white">Valider</span>
                    </button>
                    <button
                      className="flex items-center justify-center rounded-lg px-4 py-2 bg-red-500 hover:bg-red-400 transition duration-300 ease-in-ou"
                      onClick={() => handleRefused()}>
                      <XCircle className="text-red-500 mr-2 w-5 h-5 hover:bg-red-400" />
                      <span className="text-sm leading-5 font-medium text-white">Refuser</span>
                    </button>
                    <BsChevronDown className="text-gray-400 h-5 w-5 rotate-180 cursor-pointer" onClick={() => setCardOpen(false)} />
                  </div>
                ) : (
                  <div className="flex items-center gap-5 ">
                    <div className="border-[1px] border-gray-300 rounded-lg px-3 py-2.5">
                      <div className="relative" ref={ref}>
                        <button
                          className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait min-w-[200px]"
                          onClick={() => setOpen((e) => !e)}>
                          <div className="flex items-center gap-2">
                            <GoPrimitiveDot className={theme[young.statusMilitaryPreparationFiles]} />
                            <span className="text-sm leading-5 font-normal">{translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}</span>
                          </div>
                          <ChevronDown className="ml-2 text-gray-400 cursor-pointer" />
                        </button>
                        {/* display options */}

                        <div className={`${open ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0 shadow overflow-hidden z-50 top-[35px]`}>
                          {optionsStatus.map((option) => (
                            <div
                              key={option}
                              className={`${option === young.statusMilitaryPreparationFiles && "font-bold bg-gray"}`}
                              onClick={() => {
                                switch (option) {
                                  case "WAITING_CORRECTION":
                                    handleCorrection();
                                    break;
                                  case "REFUSED":
                                    handleRefused();
                                    break;
                                  case "VALIDATED":
                                    handleValidate();
                                    break;
                                }
                                setOpen(false);
                              }}>
                              <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                                <div>{translate(option)}</div>
                                {option === young.statusMilitaryPreparationFiles ? <BsCheck2 /> : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <BsChevronDown className="text-gray-400 h-5 w-5 rotate-180 cursor-pointer" onClick={() => setCardOpen(false)} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {cardOpen ? (
          <>
            <hr className="text-gray-200" />
            <div className="flex flex-row flex-wrap lg:!flex-nowrap gap-4 my-4 w-full justify-between">
              <FileCard
                name="Pièce d’identité"
                icon="reglement"
                filled={young.files.militaryPreparationFilesIdentity.length}
                onClick={() =>
                  setModalFiles({
                    isOpen: true,
                    title: "Pièce d'identité",
                    nameFiles: "militaryPreparationFilesIdentity",
                  })
                }
              />
              <FileCard
                name="Autorisation parentale"
                icon="image"
                filled={young.files.militaryPreparationFilesAuthorization.length}
                onClick={() =>
                  setModalFiles({
                    isOpen: true,
                    title: "Autorisation parentale",
                    nameFiles: "militaryPreparationFilesAuthorization",
                    initialValues: young.files.militaryPreparationFilesAuthorization,
                  })
                }
              />
              <FileCard
                name="Certifical médical de non contre-indication..."
                icon="autotest"
                filled={young.files.militaryPreparationFilesCertificate.length}
                onClick={() =>
                  setModalFiles({
                    isOpen: true,
                    title: "Certifical médical de non contre-indication...",
                    nameFiles: "militaryPreparationFilesCertificate",
                    initialValues: young.files.militaryPreparationFilesCertificate,
                  })
                }
              />
              <FileCard
                name="Attestation de recensement"
                icon="sanitaire"
                filled={young.files.militaryPreparationFilesCensus.length}
                description="Facultatif"
                onClick={() =>
                  setModalFiles({
                    isOpen: true,
                    title: "Attestation de recensement",
                    nameFiles: "militaryPreparationFilesCensus",
                    initialValues: young.files.militaryPreparationFilesCensus,
                  })
                }
              />
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
