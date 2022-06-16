import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import Loader from "../../../components/Loader";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import api from "../../../services/api";
import { APPLICATION_STATUS, SENDINBLUE_TEMPLATES, translate } from "../../../utils";

export default function Phase2militaryPrepartionV2({ young }) {
  const [applicationsToMilitaryPreparation, setApplicationsToMilitaryPreparation] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, template: null, data: null });
  const history = useHistory();

  useEffect(() => {
    getApplications();
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/young/${young._id}/application`);
    if (!ok) return toastr.error("Oups, une erreur est survenue", code);
    return setApplicationsToMilitaryPreparation(data?.filter((a) => a?.mission?.isMilitaryPreparation === "true"));
  };

  if (!applicationsToMilitaryPreparation) return <Loader />;

  if (!["WAITING_VALIDATION", "VALIDATED", "WAITING_CORRECTION", "REFUSED"].includes(young.statusMilitaryPreparationFiles)) {
    // display nothing if the young has not validated the files at least one time
    return null;
  }

  const handleValidate = () => {
    console.log("handleValidate");
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
    console.log("handleCorrection");
    setModal({ isOpen: true, template: "correction" });
  };
  const onCorrection = async (message) => {
    // update the young
    const responseYoung = await api.put(`/referent/young/${young._id}`, { statusMilitaryPreparationFiles: "WAITING_CORRECTION" });
    if (!responseYoung.ok) return toastr.error(translate(responseYoung.code), "Une erreur s'est produite lors de la validation des documents");

    await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_CORRECTION}`, { message });
    toastr.success("Email envoyé !");
    setModal({ isOpen: false, template: null, data: null });
    // Refresh
    history.go(0);
  };

  const handleRefused = () => {
    console.log("handleRefused");
    setModal({ isOpen: true, template: "refuse" });
  };

  const onRefuse = async (message) => {
    console.log("onRefuse");

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
      {/* <div className="flex flex-col w-full rounded-lg bg-white px-4 pt-3 mb-4 shadow-md">
        <div className="mb-3">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              <div className="duration-150 flex rounded-full bg-[#FD7A02] p-2 items-center justify-center mr-2">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div className="flex-col items-center ">
                <div className="text-xs font-normal text-gray-500 leading-4 uppercase">envoyée le {formatDateFR(equivalence.createdAt)}</div>
                <div className="text-base leading-5 font-bold">Demande de reconnaissance d’engagement déjà réalisé</div>
              </div>
            </div>
            {!cardOpen ? (
              <div className="flex items-center gap-5">
                <div className={`text-xs font-normal ${themeBadge.background[equivalence.status]} ${themeBadge.text[equivalence.status]} px-2 py-[2px] rounded-sm `}>
                  {translateEquivalenceStatus(equivalence.status)}
                </div>
                <BsChevronDown className="text-gray-400 h-5 w-5 cursor-pointer" onClick={() => setCardOpen(true)} />
              </div>
            ) : (
              <>
                {equivalence.status === "WAITING_VERIFICATION" ? (
                  <div className="flex items-center gap-5 ">
                    <button
                      className="group flex items-center justify-center rounded-lg shadow-ninaButton px-4 py-2 hover:bg-indigo-400 transition duration-300 ease-in-out"
                      onClick={() => setModalStatus({ isOpen: true, status: "WAITING_CORRECTION", equivalenceId: equivalence._id })}>
                      <ExclamationCircle className="text-indigo-400 mr-2 w-5 h-5 group-hover:text-white" />
                      <span className="text-sm leading-5 font-medium text-gray-700 group-hover:text-white">Demander une correction</span>
                    </button>
                    <button
                      className="flex items-center justify-center rounded-lg px-4 py-2 bg-green-500 hover:bg-green-400 transition duration-300 ease-in-ou"
                      onClick={() => setModalStatus({ isOpen: true, status: "VALIDATED", equivalenceId: equivalence._id })}>
                      <CheckCircle className="text-green-500 mr-2 w-5 h-5 hover:bg-green-400" />
                      <span className="text-sm leading-5 font-medium text-white">Valider</span>
                    </button>
                    <button
                      className="flex items-center justify-center rounded-lg px-4 py-2 bg-red-500 hover:bg-red-400 transition duration-300 ease-in-ou"
                      onClick={() => setModalStatus({ isOpen: true, status: "REFUSED", equivalenceId: equivalence._id })}>
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
                            <GoPrimitiveDot className={theme[equivalence.status]} />
                            <span className="text-sm leading-5 font-normal">{translate(equivalence?.status)}</span>
                          </div>
                          <ChevronDown className="ml-2 text-gray-400 cursor-pointer" />
                        </button>
                        {/* display options */}
      {/*
                        <div className={`${open ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0 shadow overflow-hidden z-50 top-[35px]`}>
                          {optionsStatus.map((option) => (
                            <div
                              key={option}
                              className={`${option === equivalence?.status && "font-bold bg-gray"}`}
                              // eslint-disable-next-line react/jsx-no-duplicate-props
                              onClick={() => {
                                setModalStatus({ isOpen: true, status: option, equivalenceId: equivalence._id });
                                setOpen(false);
                              }}>
                              <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                                <div>{translate(option)}</div>
                                {option === equivalence?.type ? <BsCheck2 /> : null}
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
            <hr className="mb-3 text-gray-200" />
            <div className="flex items-stretch mb-3 gap-4 justify-around">
              <div className="grid grid-cols-2 py-2">
                <div className="flex flex-col gap-y-4 text-sm leading-none font-normal text-gray-400">
                  <span>Type d’engagement :</span>
                  <span>Structure d’accueil :</span>
                  <span>Dates :</span>
                  {equivalence.frequency ? <span>Fréquence :</span> : null}
                  <span>Adresse :</span>
                  <span>Code postal :</span>
                  <span>Ville :</span>
                </div>
                <div className="flex flex-col gap-y-4 text-sm leading-none font-medium">
                  <span>{equivalence.type}</span>
                  <span>{equivalence.structureName}</span>
                  <span>
                    Du {formatDateFR(equivalence.startDate)} au {formatDateFR(equivalence.endDate)}
                  </span>
                  {equivalence.frequency ? (
                    <span className="lowercase">
                      {equivalence.frequency.nombre} {equivalence.frequency.duree} {equivalence.frequency.frequence}
                    </span>
                  ) : null}
                  <span>{equivalence.address}</span>
                  <span>{equivalence.zip}</span>
                  <span>{equivalence.city}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center bg-gray-50 rounded-lg gap-4">
                <div className="flex flex-col justify-center items-center gap-2 mx-16">
                  <SimpleFileIcon />
                  <div className="text-sm leading-5 font-bold text-center">
                    Document justificatif <br /> d’engagement
                  </div>
                </div>
                <div className="flex flex-col justify-end items-end px-7">
                  <div className="transition duration-150 flex rounded-full bg-blue-600 p-2 items-center justify-center hover:scale-110 ease-out hover:ease-in cursor-pointer">
                    <Download className=" text-indigo-100 bg-blue-600 " onClick={() => setModalFiles({ isOpen: true })} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center border-[1px] border-gray-200 rounded-lg py-4 px-8">
                <div className="text-base leading-6 font-bold text-gray-900 mb-4">
                  Personne contact au sein <br /> de la structure
                </div>
                <div className={`h-10 w-10 flex justify-center items-center rounded-full bg-gray-100 text-indigo-600 text-base font-semibold mb-3`}>
                  {getInitials(equivalence.contactFullName)}
                </div>
                <div className="text-sm leading-5 font-medium text-gray-900 mb-2">{equivalence.contactFullName}</div>
                <div className="flex items-center mb-4">
                  <div className="text-xs leading-none font-nornal text-fray-700 mr-2 ">{equivalence.contactEmail}</div>
                  <div
                    className="flex items-center justify-center cursor-pointer hover:scale-105"
                    onClick={() => {
                      copyToClipboard(equivalence.contactEmail);
                      setCopied(true);
                    }}>
                    {copied ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
      */}
    </>
  );
}
