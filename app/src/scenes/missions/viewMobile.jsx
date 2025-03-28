import React, { useEffect, useRef, useState } from "react";
import { AiFillClockCircle, AiOutlineClockCircle } from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import { HiChevronDown, HiOutlineMail, HiPlus } from "react-icons/hi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdOutlineContentCopy } from "react-icons/md";
import useAuth from "@/services/useAuth";
import { toastr } from "react-redux-toastr";
import { useHistory, useParams } from "react-router-dom";
import AcceptButton from "./components/AcceptButton";
import DeclineButton from "./components/DeclineButton";
import ChevronDown from "../../assets/icons/ChevronDown";
import Download from "../../assets/icons/Download";
import rubberStampNotValided from "../../assets/rubberStampNotValided.svg";
import rubberStampValided from "../../assets/rubberStampValided.svg";
import DoubleDayTile from "../../components/DoubleDayTile";
import Loader from "../../components/Loader";
import ModalConfirm from "../../components/modals/ModalConfirm";
import { capture } from "../../sentry";
import api from "../../services/api";
import { APPLICATION_STATUS, copyToClipboard, formatStringDateTimezoneUTC, SENDINBLUE_TEMPLATES, translate, translateAddFilePhase2WithoutPreposition } from "../../utils";
import downloadPDF from "../../utils/download-pdf";
import DocumentsPM from "../militaryPreparation/components/DocumentsPM";
import FileCard from "../militaryPreparation/components/FileCard";
import ApplyDoneModal from "./components/ApplyDoneModal";
import ApplyModal from "./components/ApplyModal";
import ApplyButton from "./components/ApplyButton";
import IconDomain from "./components/IconDomain";
import ModalPJ from "./components/ModalPJ";
import House from "./components/HouseIcon";
import { htmlCleaner } from "snu-lib";
import plausibleEvent from "@/services/plausible";
import { apiEngagement } from "./utils";
import ApplicationStatusBadge from "../phase2/components/ApplicationStatusBadge";
import useUpdateMPStatus from "../militaryPreparation/lib/useUpdateMPStatus";

export default function ViewMobile() {
  const [mission, setMission] = useState();
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("mots");
  const [contract, setContract] = useState(null);
  const [openPeopleContract, setOpenPeopleContract] = useState(false);
  const [modalDocument, setModalDocument] = useState({ isOpen: false });
  const [openAttachments, setOpenAttachments] = useState(false);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, onConfirm: null });

  const history = useHistory();

  const { young } = useAuth();
  const docRef = useRef();
  let { id } = useParams();

  const getMission = async () => {
    if (!id) return setMission(null);
    const { data } = await api.get(`/mission/${id}`);
    if (data?.apiEngagementId && (!data.application || data.application?.status === APPLICATION_STATUS.WAITING_ACCEPTATION)) {
      await apiEngagement(data.apiEngagementId);
    }
    return setMission(data);
  };

  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

  useEffect(() => {
    getMission();
    return localStorage.removeItem("jva_mission_click_id");
  }, []);

  useEffect(() => {
    const getContract = async () => {
      if (mission?.application?.contractId) {
        const { ok, data, code } = await api.get(`/contract/${mission.application.contractId}`);
        if (!ok) {
          capture(new Error(code));
          return toastr.error("Oups, une erreur est survenue", code);
        }
        setContract(data);
      }
    };
    getContract();
  }, [mission?.application]);

  const getTags = () => {
    const tags = [];
    mission.city && tags.push(mission.city + (mission.zip ? ` - ${mission.zip}` : ""));
    // tags.push(mission.remote ? "À distance" : "En présentiel");
    mission.domains.forEach((d) => tags.push(translate(d)));
    return tags;
  };

  const handleClick = (mission) => {
    if (mission.isMilitaryPreparation === "true") {
      plausibleEvent("Phase 2/CTA - PM - Candidater");
    } else {
      plausibleEvent("Phase2/CTA missions - Candidater");
    }
    setModal("APPLY");
  };

  const updateApplication = async (status) => {
    setLoading(true);
    const { ok } = await api.put(`/application`, { _id: mission.application._id, status, ...(APPLICATION_STATUS.ABANDON === status ? { missionDuration: "0" } : {}) });
    if (!ok) toastr.error("Une erreur s'est produite lors de la mise à jour de  votre candidature");
    let template;
    if (status === APPLICATION_STATUS.ABANDON) template = SENDINBLUE_TEMPLATES.referent.ABANDON_APPLICATION;
    if (status === APPLICATION_STATUS.WAITING_VALIDATION) template = SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION;
    if (status === APPLICATION_STATUS.CANCEL) template = [SENDINBLUE_TEMPLATES.young.CANCEL_APPLICATION, SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION];
    if (template && !Array.isArray(template)) await api.post(`/application/${mission.application._id}/notify/${template}`);
    if (template && Array.isArray(template)) template.map(async (temp) => await api.post(`/application/${mission.application._id}/notify/${temp}`));
    setLoading(false);
    history.go(0);
  };

  const contractHasAllValidation = (contract, young) => {
    const isYoungAdult = contract.isYoungAdult === "true";
    return (
      contract.projectManagerStatus === "VALIDATED" &&
      contract.structureManagerStatus === "VALIDATED" &&
      ((isYoungAdult && contract.youngContractStatus === "VALIDATED") ||
        (!isYoungAdult && contract.parent1Status === "VALIDATED" && (!young.parent2Email || contract.parent2Status === "VALIDATED")))
    );
  };

  if (!mission) return <Loader />;
  return (
    <div className="flex">
      <div className="mb-4 w-full rounded-xl bg-white p-3">
        {/* BEGIN HEADER */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {/* icon */}
            <div className="flex items-center">
              <IconDomain domain={mission.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission.domains[0]} />
            </div>

            {/* infos mission */}
            <div className="flex flex-col">
              <div className="space-y-2">
                <div className="text-xs uppercase text-gray-500">{mission.structureName}</div>
                <div className="text-base font-bold text-gray-900">{mission.name}</div>
              </div>
            </div>
          </div>
          <div className="flex  flex-wrap space-x-2">
            {getTags()?.map((e, i) => (
              <div key={i} className="flex items-center justify-center rounded-full border-[1px] border-gray-200 p-1 text-xs text-gray-600">
                {e}
              </div>
            ))}
            {mission?.isMilitaryPreparation === "true" ? (
              <div className="flex items-center justify-center rounded-full border-[1px] border-gray-200 bg-blue-900 px-4 py-1 text-xs text-white">Préparation militaire</div>
            ) : null}
          </div>
          <div className="mt-2 flex items-center justify-center">
            {mission.application ? (
              <ApplicationStatus
                mission={mission}
                updateApplication={updateApplication}
                loading={loading}
                setLoading={setLoading}
                contract={contract}
                contractHasAllValidation={contractHasAllValidation}
              />
            ) : (
              <ApplyButton mission={mission} onClick={() => handleClick(mission)} />
            )}
          </div>
        </div>
        {/* END HEADER */}
        {contract && !contractHasAllValidation(contract, young) && (
          <div className="rounded-lg bg-gray-50  p-3">
            <div className="flex">
              <div
                className={`px-2 py-1 text-xs font-normal ${
                  contract?.invitationSent ? "bg-sky-100 text-sky-500" : "bg-gray-200 text-gray-600"
                } flex items-center space-x-1 rounded-sm`}>
                {contract?.invitationSent && <AiFillClockCircle className="text-sky-500" />}
                <div>Contrat {contract?.invitationSent ? "envoyé" : "en brouillon"}</div>
              </div>
            </div>
            <div
              className="flex justify-between"
              onClick={() => {
                setOpenPeopleContract(!openPeopleContract);
              }}>
              <div className="text-lg font-bold">Contrat d&apos;engagement en mission d&apos;intérêt général</div>
              {contract?.invitationSent && <HiChevronDown />}
            </div>
            {openPeopleContract && (
              <>
                <div className="mt-1 text-sm ">Ce contrat doit être validé par vos représentant(s) légal(aux), votre tuteur de mission et le référent départemental.</div>
                {contract?.invitationSent && (
                  <div className="my-4 flex flex-col space-y-3">
                    <StatusContractPeople
                      value={contract?.projectManagerStatus}
                      description="Représentant de l’État"
                      firstName={contract?.projectManagerFirstName}
                      lastName={contract?.projectManagerLastName}
                    />
                    <StatusContractPeople
                      value={contract?.structureManagerStatus}
                      description="Représentant de la structure"
                      firstName={contract?.structureManagerFirstName}
                      lastName={contract?.structureManagerLastName}
                    />
                    {contract?.isYoungAdult === "true" ? (
                      <StatusContractPeople
                        value={contract?.youngContractStatus}
                        description="Volontaire"
                        firstName={contract?.youngFirstName}
                        lastName={contract?.youngLastName}
                      />
                    ) : (
                      <>
                        <StatusContractPeople
                          value={contract?.parent1Status}
                          description="Représentant légal 1"
                          firstName={contract?.parent1FirstName}
                          lastName={contract?.parent1LastName}
                        />
                        {contract?.parent2Email && (
                          <StatusContractPeople
                            value={contract?.parent2Status}
                            description="Représentant légal 2"
                            firstName={contract?.parent2FirstName}
                            lastName={contract?.parent2LastName}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-row gap-2">
          <TabItem name="mots" setCurrentTab={setCurrentTab} active={currentTab === "mots"}>
            En quelques mots...
          </TabItem>
          <TabItem name="infos" setCurrentTab={setCurrentTab} active={currentTab === "infos"}>
            Infos pratiques
          </TabItem>
        </div>
        <hr className="-mx-10 -translate-y-0.5" />
        {currentTab === "mots" ? (
          <div className="mx-3 my-4 flex flex-col">
            <div className="mb-2 text-base font-bold">La mission en quelques mots</div>
            <Detail title="Format" content={translate(mission.format)} />
            <Detail title="Objectifs" content={mission.description} />
            <Detail title="Actions" content={mission.actions} />
            <Detail title="Contraintes" content={mission.contraintes} />
            <InfoStructure title="à propos de la structure" structure={mission.structureId} />
          </div>
        ) : (
          <div className="mx-3 my-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="mb-2 text-base font-bold">Informations pratiques</div>
              <DoubleDayTile date1={mission.startAt} date2={mission.endAt} />
            </div>
            <Detail
              title="Date"
              content={
                mission.startAt && mission.endAt ? `Du ${formatStringDateTimezoneUTC(mission.startAt)} au ${formatStringDateTimezoneUTC(mission.endAt)}` : "Aucune date renseignée"
              }
            />

            <Detail title="Fréquence" content={mission.frequence} />
            {mission.duration ? <Detail title="Durée estimée" content={`${mission.duration} heure(s)`} /> : null}
            <Detail title="Période pour réaliser la mission" content={mission.period} />
            <Detail title="Lieu" content={[mission.address, mission.zip, mission.city, mission.department]} />
            {mission?.hebergement === "true" && (
              <div className="rounded-lg bg-white px-3 pt-3 shadow-sm">
                {mission.hebergementPayant === "true" ? (
                  <div>
                    <div className="flex flex-row justify-between">
                      <div className="text-sm font-bold">Hébergement payant proposé</div>
                      <div className="rounded-full bg-yellow-100 p-1.5">
                        <House color="#D97706" />
                      </div>
                    </div>
                    <div className="text-xs">
                      Un hébergement est proposé par la structure d&apos;accueil pour cette mission. Les frais de cet hébergement sont à la charge du volontaire.
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-row justify-between">
                      <div className="text-sm font-bold">Hébergement gratuit proposé</div>
                      <div className="rounded-full bg-green-50 p-1.5">
                        <House color="#059669" />
                      </div>
                    </div>
                    <div className="text-xs">
                      Un hébergement est proposé par la structure d&apos;accueil pour cette mission. Les frais de cet hébergement ne sont pas à la charge du volontaire.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {mission.application ? (
          <>
            <div className="mx-6 my-4 flex items-center justify-center">
              {["WAITING_VALIDATION", "WAITING_VERIFICATION"].includes(mission?.application.status) ? (
                <button
                  className="group flex items-center gap-1 rounded-lg border-[1px] px-10 py-2"
                  disabled={loading}
                  onClick={() =>
                    setCancelModal({
                      isOpen: true,
                      onConfirm: () => updateApplication(APPLICATION_STATUS.CANCEL),
                      title: "Êtes-vous sûr ?",
                      message: "Vous vous apprêtez à annuler votre candidature. Cette action est irréversible, souhaitez-vous confirmer cette action ?",
                    })
                  }>
                  <IoMdInformationCircleOutline className="h-5 w-5 text-red-400 group-disabled:text-red-300" />
                  <div className="text-sm font-medium leading-5 text-gray-800 group-disabled:text-gray-400">Annuler cette candidature</div>
                </button>
              ) : null}
              {["IN_PROGRESS", "VALIDATED"].includes(mission?.application.status) ? (
                <button
                  className="group flex items-center gap-1 rounded-lg border-[1px] px-10 py-2"
                  disabled={loading}
                  onClick={() =>
                    setCancelModal({
                      isOpen: true,
                      onConfirm: () => updateApplication(APPLICATION_STATUS.ABANDON),
                      title: "Êtes-vous sûr ?",
                      message: "Vous vous apprêtez à abandonner cette mission. Cette action est irréversible, souhaitez-vous confirmer cette action ?",
                    })
                  }>
                  <IoMdInformationCircleOutline className="h-5 w-5 text-red-400 group-disabled:text-red-300" />
                  <div className="text-sm font-medium leading-5 text-gray-800 group-disabled:text-gray-400">Abandonner la mission</div>
                </button>
              ) : null}
            </div>
            <ModalConfirm
              isOpen={cancelModal?.isOpen}
              title={cancelModal?.title}
              message={cancelModal?.message}
              onCancel={() => setCancelModal({ isOpen: false, onConfirm: null })}
              onConfirm={async () => {
                await cancelModal?.onConfirm();
                setCancelModal({ isOpen: false, onConfirm: null });
              }}
            />
          </>
        ) : null}
        {mission.isMilitaryPreparation === "true" ? (
          <>
            <hr className="text-gray-100" />
            <div className="mx-3 my-4">
              <DocumentsPM docRef={docRef} />
            </div>
          </>
        ) : null}
        {mission?.application?.status === "VALIDATED" && (
          <>
            <hr className="text-gray-100" />
            <div className="mt-8 ml-3">
              <div className="flex justify-between">
                <div className="text-[15px] font-semibold leading-6">Pièces jointes</div>
                <div className="flex items-center space-x-4">
                  {optionsType.reduce((nmb, option) => nmb + mission.application[option].length, 0) !== 0 && (
                    <div
                      className="group flex items-center rounded-lg border-[1px] border-blue-600 py-2 px-4 text-center text-sm text-blue-600 transition duration-100 ease-in-out hover:bg-blue-600 hover:text-white"
                      onClick={() => setOpenAttachments(!openAttachments)}>
                      {openAttachments ? "Masquer" : "Voir"}
                      <BsChevronDown className={`ml-3 h-5 w-5 text-blue-600 group-hover:text-white ${openAttachments ? "rotate-180" : ""}`} />
                    </div>
                  )}
                  <div
                    className="rounded-full bg-blue-600  p-2 text-white "
                    onClick={() => {
                      setModalDocument({
                        isOpen: true,
                        stepOne: true,
                      });
                    }}>
                    <HiPlus />
                  </div>
                </div>
              </div>
              {openAttachments && (
                <div className="my-4 flex w-full flex-row gap-4 overflow-x-auto ">
                  {optionsType.map(
                    (option, index) =>
                      mission.application[option].length > 0 && (
                        <FileCard
                          key={index}
                          name={translateAddFilePhase2WithoutPreposition(option)}
                          icon="reglement"
                          filled={mission.application[option].length}
                          color="text-blue-600 bg-white"
                          status="Modifier"
                          onClick={() =>
                            setModalDocument({
                              isOpen: true,
                              name: option,
                              stepOne: false,
                            })
                          }
                        />
                      ),
                  )}
                </div>
              )}
              <ModalPJ
                isOpen={modalDocument?.isOpen}
                name={modalDocument?.name}
                young={young}
                application={mission.application}
                optionsType={optionsType}
                onCancel={async () => {
                  setModalDocument({ isOpen: false });
                  await getMission();
                }}
                onSend={async (type, multipleDocument) => {
                  try {
                    const responseNotification = await api.post(`/application/${mission.application._id}/notify/${SENDINBLUE_TEMPLATES.ATTACHEMENT_PHASE_2_APPLICATION}`, {
                      type,
                      multipleDocument,
                    });
                    if (!responseNotification?.ok) return toastr.error(translate(responseNotification?.code), "Une erreur s'est produite avec le service de notification.");
                    toastr.success("L'email a bien été envoyé");
                  } catch (e) {
                    toastr.error("Une erreur est survenue lors de l'envoi du mail", e.message);
                  }
                }}
                onSave={async () => {
                  setModalDocument({ isOpen: false });
                  await getMission();
                }}
                typeChose={modalDocument?.stepOne}
              />
            </div>
          </>
        )}
        {modal === "APPLY" && (
          <ApplyModal
            value={mission}
            onChange={() => setModal(null)}
            onSend={async () => {
              await getMission();
              setModal("DONE");
            }}
          />
        )}
        {modal === "DONE" && <ApplyDoneModal young={young} value={mission} onChange={() => setModal(null)} />}
      </div>
    </div>
  );
}

const TabItem = ({ name, active, setCurrentTab, children }) => (
  <div
    onClick={() => setCurrentTab(name)}
    className={`cursor-pointer px-3 py-4 text-sm text-coolGray-500  hover:border-b-[3px] hover:border-blue-600 hover:text-blue-600
        ${active && "border-b-[3px] border-blue-600 font-bold text-blue-600"}`}>
    {children}
  </div>
);

const ApplicationStatus = ({ mission, updateApplication, loading, setLoading, contract, contractHasAllValidation }) => {
  const { young } = useAuth();
  const tutor = mission?.tutor;
  const application = mission?.application;
  const MPMutation = useUpdateMPStatus();

  const refContractButton = React.useRef();

  const [openContractButton, setOpenContractButton] = useState();

  const viewContract = async (contractId) => {
    await downloadPDF({
      url: `/contract/${contractId}/download`,
      fileName: `${young.firstName} ${young.lastName} - contrat ${contractId}.pdf`,
    });
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refContractButton.current && !refContractButton.current.contains(event.target)) {
        setOpenContractButton(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  if (["WAITING_VALIDATION", "WAITING_VERIFICATION", "REFUSED", "CANCEL"].includes(application.status)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-6">
          <ApplicationStatusBadge status={application.status} />
        </div>
        <HoursAndPlaces duration={mission?.duration} placesLeft={mission.placesLeft} hebergement={mission.hebergement} hebergementPayant={mission.hebergementPayant} />
      </div>
    );
  }
  if (["IN_PROGRESS", "VALIDATED", "DONE", "ABANDON"].includes(application.status)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="align-items flex justify-between gap-6">
          <ApplicationStatusBadge status={application.status} />
          {contract && contractHasAllValidation(contract, young) && (
            <div className="relative" ref={refContractButton}>
              <button
                disabled={loading}
                className="flex w-full items-center justify-between gap-3 rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 disabled:cursor-wait disabled:opacity-50"
                onClick={() => setOpenContractButton((e) => !e)}>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-xs font-medium leading-4 text-white">Contrat d&apos;engagement</span>
                </div>
                <ChevronDown className="font-medium text-white" />
              </button>
              {/* display options */}
              <div
                className={`${
                  openContractButton ? "block" : "hidden"
                }  absolute right-0 top-[40px] z-50 !min-w-full overflow-hidden rounded-lg bg-white shadow transition lg:!min-w-3/4`}>
                <button
                  key="download"
                  onClick={() => {
                    setLoading(true);
                    viewContract(contract._id);
                    setOpenContractButton(false);
                    setLoading(false);
                  }}>
                  <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5">
                    <Download className="h-4 w-4 text-gray-400" />
                    <div>Télécharger</div>
                  </div>
                </button>
                <SendContractByMail young={young} contractId={contract._id} missionName={contract.missionName} />
              </div>
            </div>
          )}
        </div>
        {tutor ? (
          <div className="mb-4 flex gap-6 rounded-lg border border-gray-200 py-2 px-3">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-bold">Contacter mon tuteur</div>
              <div className="text-xs text-gray-600">
                {tutor.firstName} {tutor.lastName} - {tutor.email}
              </div>
            </div>
            <MdOutlineContentCopy
              className="h-4 w-4 cursor-pointer text-gray-400 hover:text-blue-600"
              onClick={() => {
                copyToClipboard(tutor.email);
                toastr.info("L'email de votre tuteur a été copié dans le presse-papier");
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (["WAITING_ACCEPTATION"].includes(application.status)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-center text-xs font-normal leading-none text-gray-500">
          Cette mission vous a été proposée <br /> par votre référent
        </div>
        <div className="flex items-center gap-2">
          <AcceptButton mission={mission} updateApplication={updateApplication} loading={loading} />
          <DeclineButton updateApplication={updateApplication} loading={loading} />
        </div>
        {!mission.canApply ? <div className="text-center text-xs text-red-500">{mission.message}</div> : null}

        <HoursAndPlaces duration={mission?.duration} placesLeft={mission.placesLeft} hebergement={mission.hebergement} hebergementPayant={mission.hebergementPayant} />
      </div>
    );
  }
};

const Detail = ({ title, content }) => {
  const [value] = useState((Array.isArray(content) && content) || [content]);
  return content && content.length ? (
    <div className="my-3">
      <div className="text-xs uppercase text-gray-500">{title}</div>
      {value.map((e, i) => (
        <div key={i} className="text-sm font-normal leading-5" dangerouslySetInnerHTML={{ __html: htmlCleaner(translate(e)) }} />
      ))}
    </div>
  ) : (
    <div />
  );
};

const InfoStructure = ({ title, structure }) => {
  const [value, setValue] = useState();
  const [expandNote, setExpandNote] = useState(false);
  useEffect(() => {
    (async () => {
      const { ok, data, code } = await api.get(`/structure/${structure}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la structure", translate(code));
      } else {
        setValue(data.description);
      }
    })();
  }, []);
  if (!value) return <div />;

  const preview = value.substring(0, 200);
  const rest = value.substring(200);

  const toggleNote = () => {
    setExpandNote(!expandNote);
  };

  return value ? (
    <div className="my-3">
      <div className="text-xs uppercase text-gray-500">{title}</div>
      <div className="text-sm font-normal leading-5">
        {rest ? (
          <div className="my-2">
            <div dangerouslySetInnerHTML={{ __html: preview + (expandNote ? rest : " ...") + " " }} />
            <div className="see-more" onClick={toggleNote}>
              {expandNote ? "  VOIR MOINS" : "  VOIR PLUS"}
            </div>
          </div>
        ) : (
          preview
        )}
      </div>
    </div>
  ) : (
    <div />
  );
};

const HoursAndPlaces = ({ duration, placesLeft, hebergement, hebergementPayant }) => {
  return (
    <div className={`flex items-center ${duration ? "justify-between" : "justify-center"} gap-6`}>
      {duration ? (
        <div className="flex items-center gap-1">
          {hebergement === "true" && (
            <>
              {hebergementPayant === "true" ? (
                <div className="rounded-full bg-yellow-100 p-1.5">
                  <House color="#D97706" />
                </div>
              ) : (
                <div className="rounded-full bg-green-50 p-1.5">
                  <House color="#059669" />
                </div>
              )}
            </>
          )}
          <AiOutlineClockCircle className="ml-2 text-gray-400" />
          <div className="text-xs">{duration} heure(s)</div>
        </div>
      ) : null}
      <div className="text-xs font-normal leading-none text-gray-500">{placesLeft} places restantes</div>
    </div>
  );
};

const StatusContractPeople = ({ value, description, firstName, lastName }) => (
  <div className="flex justify-between">
    <div className="flex items-center">
      <div className="mr-2">
        {value === "VALIDATED" ? <img src={rubberStampValided} alt="rubberStampValided" /> : <img src={rubberStampNotValided} alt="rubberStampNotValided" />}
      </div>
      <div>
        <div className="flex space-x-2 font-semibold">
          <div>{firstName}</div>
          <div>{lastName?.toUpperCase()}</div>
        </div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </div>
    {value === "VALIDATED" ? "" : <div className="w-1/4 border-l-2 border-gray-500 px-1 text-center text-xs text-gray-500">En attente de signature</div>}
  </div>
);

const SendContractByMail = ({ young, contractId, missionName }) => {
  const [modalMail, setModalMail] = useState({ isOpen: false, onConfirm: null });

  const onConfirm = async () => {
    try {
      const { ok, code } = await api.post(`/young/${young._id}/documents/contract/2/send-email?contract_id=${contractId}`, {
        fileName: `contrat ${young.firstName} ${young.lastName} - ${missionName}.pdf`,
      });
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      toastr.error("Erreur lors de l'envoi du document : ", e.message);
    }
  };

  return (
    <>
      <div
        className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5"
        onClick={() =>
          setModalMail({
            isOpen: true,
            onConfirm,
            title: "Envoi du document par mail",
            message: `Vous allez recevoir le document par mail à l'adresse ${young.email}.`,
          })
        }>
        <HiOutlineMail className="h-4 w-4 text-gray-400" />
        <div className="text-sm text-gray-800">Envoyer par mail</div>
      </div>
      <ModalConfirm
        isOpen={modalMail?.isOpen}
        title={modalMail?.title}
        message={modalMail?.message}
        onCancel={() => setModalMail({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modalMail?.onConfirm();
          setModalMail({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
};
