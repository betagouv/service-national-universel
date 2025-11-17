import React, { useState } from "react";
import { useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";
import { toastr } from "react-redux-toastr";
import { BsCheck2, BsChevronDown, BsCircleFill } from "react-icons/bs";
import Bell from "../../../assets/icons/Bell";
import CheckCircle from "../../../assets/icons/CheckCircle";
import ChevronDown from "../../../assets/icons/ChevronDown";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";
import XCircle from "../../../assets/icons/XCircle";
import FileCard from "../../../components/FileCard";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import api from "../../../services/api";
import { APPLICATION_STATUS, ROLES, SENDINBLUE_TEMPLATES, translate, translateStatusMilitaryPreparationFiles } from "../../../utils";
import { isCohortFullyArchived } from "snu-lib";
import ModalFilesPM from "../components/ModalFilesPM";
import { queryClient } from "@/services/react-query";

export default function Phase2militaryPrepartionV2({ young, applications }) {
  const optionsStatus = ["WAITING_CORRECTION", "REFUSED", "VALIDATED"];
  const [modal, setModal] = useState({ isOpen: false, template: null, data: null });
  const [modalFiles, setModalFiles] = useState({ isOpen: false });
  const [cardOpen, setCardOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  const user = useSelector((state) => state.Auth.user);
  const cohortList = useSelector((state) => state.Cohorts);
  const cohort = cohortList.find((c) => c.name === young.cohort);
  const isReferentRegionalOrDepartmental = [ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role);
  const isCohortFullyArchivedForReferent = isReferentRegionalOrDepartmental && cohort ? isCohortFullyArchived(cohort) : false;
  const tooltipId = `tooltip-military-prep-${young._id}`;
  const tooltipFilesId = `tooltip-military-prep-files-${young._id}`;
  const tooltipButtonsId = `tooltip-military-prep-buttons-${young._id}`;
  const shouldShowTooltip = isCohortFullyArchivedForReferent;
  const shouldBlockFiles = isCohortFullyArchivedForReferent;
  const shouldBlockButtons = isCohortFullyArchivedForReferent;

  React.useEffect(() => {
    ReactTooltip.rebuild();
  });

  function refetch() {
    queryClient.invalidateQueries({ queryKey: ["young", young._id] });
    queryClient.invalidateQueries({ queryKey: ["application", young._id] });
  }

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
      await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_VALIDATED}`);

      // change status of applications
      for (let i = 0; i < applications.length; i++) {
        const app = applications[i];
        if (app.status === APPLICATION_STATUS.WAITING_VERIFICATION) {
          const responseApplication = await api.put("/application", { _id: app._id, status: "WAITING_VALIDATION" });
          if (!responseApplication.ok)
            toastr.error(
              translate(responseApplication.code),
              `Une erreur s'est produite lors du changement automatique de statut de la candidature à la mission : ${app.missionName}`,
            );
          await api.post(`/referent/${app.tutorId}/email/${SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_VALIDATED}`, { app });
        }
      }
      setModal({ isOpen: false, template: null, data: null });
    } catch (e) {
      console.error(e);
      toastr.error("Une erreur est survenue", translate(e.code));
    }
    refetch();
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
    refetch();
  };

  const handleRefused = () => {
    setModal({ isOpen: true, template: "refuse" });
  };

  const onRefuse = async (message) => {
    // update the young
    const responseYoung = await api.post(`/referent/young/${young._id}/refuse-military-preparation-files`);
    if (!responseYoung.ok) return toastr.error(translate(responseYoung.code), "Une erreur s'est produite lors de la validation des documents");

    // change status of applications if its not already correct
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
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
    refetch();
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
      {modalFiles?.nameFiles ? (
        <ModalFilesPM
          isOpen={modalFiles?.isOpen}
          onCancel={() => setModalFiles({ isOpen: false })}
          title={modalFiles?.title}
          path={`/young/${young._id}/documents/${modalFiles?.nameFiles}`}
        />
      ) : null}
      <div className="mb-4 flex w-full flex-col rounded-lg bg-white px-4 pt-3 shadow-md">
        <div className="mb-3">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              <div className="mr-2 flex items-center justify-center rounded-full bg-[#FD7A02] p-2 duration-150">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div className="text-base font-bold leading-5">Dossier d’éligibilité aux préparations militaires</div>
            </div>
            {!cardOpen ? (
              <div className="flex items-center gap-5">
                <div
                  className={`text-xs font-normal ${themeBadge.background[young.statusMilitaryPreparationFiles]} ${
                    themeBadge.text[young.statusMilitaryPreparationFiles]
                  } rounded-sm px-2 py-[2px] `}>
                  {translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}
                </div>
                <BsChevronDown className="h-5 w-5 cursor-pointer text-gray-400" onClick={() => setCardOpen(true)} />
              </div>
            ) : (
              <>
                {/* todo: remove WAITING_VALIDATION after sync */}
                {young.statusMilitaryPreparationFiles === "WAITING_VERIFICATION" ? (
                  <div className="flex items-center gap-5 ">
                    <div
                      className={shouldBlockButtons ? "opacity-50 cursor-not-allowed" : ""}
                      data-tip=""
                      data-for={shouldBlockButtons ? tooltipButtonsId : ""}>
                      <button
                        className="group flex items-center justify-center rounded-lg px-4 py-2 shadow-ninaButton transition duration-300 ease-in-out hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => handleCorrection()}
                        disabled={shouldBlockButtons}>
                        <ExclamationCircle className="mr-2 h-5 w-5 text-indigo-400 group-hover:text-white" />
                        <span className="text-sm font-medium leading-5 text-gray-700 group-hover:text-white">Demander une correction</span>
                      </button>
                    </div>
                    <div
                      className={shouldBlockButtons ? "opacity-50 cursor-not-allowed" : ""}
                      data-tip=""
                      data-for={shouldBlockButtons ? tooltipButtonsId : ""}>
                      <button
                        className="ease-in-ou flex items-center justify-center rounded-lg bg-green-500 px-4 py-2 transition duration-300 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => handleValidate()}
                        disabled={shouldBlockButtons}>
                        <CheckCircle className="mr-2 h-5 w-5 text-green-500 hover:bg-green-400" />
                        <span className="text-sm font-medium leading-5 text-white">Valider</span>
                      </button>
                    </div>
                    <div
                      className={shouldBlockButtons ? "opacity-50 cursor-not-allowed" : ""}
                      data-tip=""
                      data-for={shouldBlockButtons ? tooltipButtonsId : ""}>
                      <button
                        className="ease-in-ou flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 transition duration-300 hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => handleRefused()}
                        disabled={shouldBlockButtons}>
                        <XCircle className="mr-2 h-5 w-5 text-red-500 hover:bg-red-400" />
                        <span className="text-sm font-medium leading-5 text-white">Refuser</span>
                      </button>
                    </div>
                    <BsChevronDown className="h-5 w-5 rotate-180 cursor-pointer text-gray-400" onClick={() => setCardOpen(false)} />
                  </div>
                ) : (
                  <div className="flex items-center gap-5 ">
                    {shouldShowTooltip ? (
                      <div className="rounded-lg border-[1px] border-gray-300 px-3 py-2.5" data-tip="" data-for={tooltipId}>
                        <div className="flex min-w-[200px] items-center gap-2">
                          <BsCircleFill className={theme[young.statusMilitaryPreparationFiles]} />
                          <span className="text-sm font-normal leading-5">{translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border-[1px] border-gray-300 px-3 py-2.5">
                        <div className="relative" ref={ref}>
                          <button
                            className="flex min-w-[200px] cursor-pointer items-center justify-between disabled:cursor-wait disabled:opacity-50"
                            onClick={() => setOpen((e) => !e)}>
                            <div className="flex items-center gap-2">
                              <BsCircleFill className={theme[young.statusMilitaryPreparationFiles]} />
                              <span className="text-sm font-normal leading-5">{translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}</span>
                            </div>
                            <ChevronDown className="ml-2 cursor-pointer text-gray-400" />
                          </button>
                          {/* display options */}

                          <div className={`${open ? "block" : "hidden"}  absolute left-0 top-[35px] z-50 min-w-full overflow-hidden rounded-lg bg-white shadow transition`}>
                            {optionsStatus.map((option) => (
                              <div
                                key={option}
                                className={`${option === young.statusMilitaryPreparationFiles && "bg-gray font-bold"}`}
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
                                <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                                  <div>{translate(option)}</div>
                                  {option === young.statusMilitaryPreparationFiles ? <BsCheck2 /> : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <BsChevronDown className="h-5 w-5 rotate-180 cursor-pointer text-gray-400" onClick={() => setCardOpen(false)} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {cardOpen ? (
          <>
              <hr className="text-gray-200" />
              <div className="my-4 flex w-full flex-row flex-wrap justify-between gap-4 lg:!flex-nowrap">
                <div className={shouldBlockFiles ? "opacity-50 cursor-not-allowed" : ""} data-tip="" data-for={shouldBlockFiles ? tooltipFilesId : ""}>
                  <FileCard
                    name="Pièce d'identité"
                    icon="reglement"
                    filled={young.files?.militaryPreparationFilesIdentity.length}
                    onClick={() => {
                      if (!shouldBlockFiles) {
                        setModalFiles({
                          isOpen: true,
                          title: "Pièce d'identité",
                          nameFiles: "militaryPreparationFilesIdentity",
                        });
                      }
                    }}
                  />
                </div>
                <div className={shouldBlockFiles ? "opacity-50 cursor-not-allowed" : ""} data-tip="" data-for={shouldBlockFiles ? tooltipFilesId : ""}>
                  <FileCard
                    name="Autorisation parentale"
                    icon="image"
                    filled={young.files?.militaryPreparationFilesAuthorization.length}
                    onClick={() => {
                      if (!shouldBlockFiles) {
                        setModalFiles({
                          isOpen: true,
                          title: "Autorisation parentale",
                          nameFiles: "militaryPreparationFilesAuthorization",
                          initialValues: young.files?.militaryPreparationFilesAuthorization,
                        });
                      }
                    }}
                  />
                </div>
                <div className={shouldBlockFiles ? "opacity-50 cursor-not-allowed" : ""} data-tip="" data-for={shouldBlockFiles ? tooltipFilesId : ""}>
                  <FileCard
                    name="Certificat médical de non contre-indication..."
                    icon="autotest"
                    filled={young.files?.militaryPreparationFilesCertificate.length}
                    onClick={() => {
                      if (!shouldBlockFiles) {
                        setModalFiles({
                          isOpen: true,
                          title: "Certificat médical de non contre-indication...",
                          nameFiles: "militaryPreparationFilesCertificate",
                          initialValues: young.files?.militaryPreparationFilesCertificate,
                        });
                      }
                    }}
                  />
                </div>
                <div className={shouldBlockFiles ? "opacity-50 cursor-not-allowed" : ""} data-tip="" data-for={shouldBlockFiles ? tooltipFilesId : ""}>
                  <FileCard
                    name="Attestation de recensement"
                    icon="sanitaire"
                    filled={young.files?.militaryPreparationFilesCensus.length}
                    description="Facultatif"
                    onClick={() => {
                      if (!shouldBlockFiles) {
                        setModalFiles({
                          isOpen: true,
                          title: "Attestation de recensement",
                          nameFiles: "militaryPreparationFilesCensus",
                          initialValues: young.files?.militaryPreparationFilesCensus,
                        });
                      }
                    }}
                  />
                </div>
              </div>
          </>
        ) : null}
      </div>
      {shouldShowTooltip ? (
        <ReactTooltip id={tooltipId} className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
          <div className="text-[black]">Vous ne pouvez plus effectuer cette action. La cohorte du jeune est archivée.</div>
        </ReactTooltip>
      ) : null}
      {shouldBlockFiles ? (
        <ReactTooltip id={tooltipFilesId} className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
          <div className="text-[black]">Vous ne pouvez plus effectuer cette action. La cohorte du jeune est archivée.</div>
        </ReactTooltip>
      ) : null}
      {shouldBlockButtons ? (
        <ReactTooltip id={tooltipButtonsId} className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
          <div className="text-[black]">Vous ne pouvez plus effectuer cette action. La cohorte du jeune est archivée.</div>
        </ReactTooltip>
      ) : null}
    </>
  );
}
