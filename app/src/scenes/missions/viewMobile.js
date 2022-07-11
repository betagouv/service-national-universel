import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory, useParams } from "react-router-dom";
import DoubleDayTile from "../../components/DoubleDayTile";
import Loader from "../../components/Loader";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";
import {
  formatStringDateTimezoneUTC,
  htmlCleaner,
  translate,
  translateApplication,
  copyToClipboard,
  APPLICATION_STATUS,
  SENDINBLUE_TEMPLATES,
  translateAddFilePhase2,
  COHESION_STAY_END,
} from "../../utils";
import DocumentsPM from "../militaryPreparation/components/DocumentsPM";
import ApplyDoneModal from "./components/ApplyDoneModal";
import ApplyModal from "./components/ApplyModal";
import IconDomain from "./components/IconDomain";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdOutlineContentCopy } from "react-icons/md";
import CheckCircle from "../../assets/icons/CheckCircle";
import XCircle from "../../assets/icons/XCircle";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import { HiPlus } from "react-icons/hi";
import ModalPJ from "./components/ModalPJ";
import FileCard from "../militaryPreparation/components/FileCard";

export default function viewMobile() {
  const [mission, setMission] = useState();
  const [modal, setModal] = useState(null);
  const [disabledAge, setDisabledAge] = useState(false);
  const [disabledIncomplete, setDisabledIncomplete] = useState(false);
  const [disabledPmRefused, setDisabledPmRefused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("mots");
  const [modalDocument, setModalDocument] = useState({ isOpen: false });
  const [openAttachments, setOpenAttachments] = useState(false);
  const history = useHistory();

  const young = useSelector((state) => state.Auth.young);
  const docRef = useRef();
  let { id } = useParams();

  const getMission = async () => {
    if (!id) return setMission(null);
    const { data } = await api.get(`/mission/${id}`);
    return setMission(data);
  };

  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

  useEffect(() => {
    getMission();
  }, []);

  useEffect(() => {
    function getDiffYear(a, b) {
      const from = new Date(a);
      from.setHours(0, 0, 0, 0);
      const to = new Date(b);
      to.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(to - from);
      const res = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
      if (!res || isNaN(res)) return "?";
      return res;
    }

    // si c'est une préparation militaire
    // on vérifie que le vonlontaire aura plus de 16 ans au début de la mission, que son dossier est complet et que son dossier n'est pas refusé
    if (mission?.isMilitaryPreparation === "true") {
      const ageAtStart = getDiffYear(mission.startAt, young.birthdateAt);
      setDisabledAge(ageAtStart < 16);
      setDisabledPmRefused(young.statusMilitaryPreparationFiles === "REFUSED");
      if (!young.militaryPreparationFilesIdentity.length || !young.militaryPreparationFilesAuthorization.length || !young.militaryPreparationFilesCertificate.length) {
        setDisabledIncomplete(true);
      } else {
        setDisabledIncomplete(false);
      }
    }
  }, [mission, young]);

  const getTags = () => {
    const tags = [];
    mission.city && tags.push(mission.city + (mission.zip ? ` - ${mission.zip}` : ""));
    // tags.push(mission.remote ? "À distance" : "En présentiel");
    mission.domains.forEach((d) => tags.push(translate(d)));
    return tags;
  };

  const scrollToBottom = () => {
    if (!docRef.current) return;
    docRef.current.scrollIntoView({
      behavior: "smooth",
    });
  };

  const updateApplication = async (status) => {
    setLoading(true);
    const { ok } = await api.put(`/application`, { _id: mission.application._id, status });
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

  if (!mission) return <Loader />;
  return (
    <div className="bg-white rounded-xl w-full p-3 mb-4">
      {/* BEGIN HEADER */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          {/* icon */}
          <div className="flex items-center">
            <IconDomain domain={mission.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission.domains[0]} />
          </div>

          {/* infos mission */}
          <div className="flex flex-col">
            <div className="space-y-2">
              <div className="text-gray-500 text-xs uppercase">{mission.structureName}</div>
              <div className="text-gray-900 font-bold text-base">{mission.name}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {getTags()?.map((e, i) => (
            <div key={i} className="flex justify-center items-center text-gray-600 border-gray-200 border-[1px] rounded-full p-1 text-xs">
              {e}
            </div>
          ))}
          {mission.isMilitaryPreparation === "true" ? (
            <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">Préparation militaire</div>
          ) : null}
        </div>
        <div className="flex items-center justify-center mt-2">
          {mission.application ? (
            <ApplicationStatus
              application={mission.application}
              tutor={mission?.tutor}
              mission={mission}
              updateApplication={updateApplication}
              loading={loading}
              disabledAge={disabledAge}
              disabledIncomplete={disabledIncomplete}
              disabledPmRefused={disabledPmRefused}
              scrollToBottom={scrollToBottom}
            />
          ) : (
            <ApplyButton
              placesLeft={mission.placesLeft}
              setModal={setModal}
              young={young}
              disabledAge={disabledAge}
              disabledIncomplete={disabledIncomplete}
              disabledPmRefused={disabledPmRefused}
              scrollToBottom={scrollToBottom}
              duration={mission?.duration}
            />
          )}
        </div>
      </div>
      {/* END HEADER */}

      <div className="flex flex-row mt-3 gap-2">
        <TabItem name="mots" setCurrentTab={setCurrentTab} active={currentTab === "mots"}>
          En quelques mots...
        </TabItem>
        <TabItem name="infos" setCurrentTab={setCurrentTab} active={currentTab === "infos"}>
          Infos pratiques
        </TabItem>
      </div>
      <hr className="-mx-10 -translate-y-0.5" />
      {currentTab === "mots" ? (
        <div className="flex flex-col mx-3 my-4">
          <div className="text-base font-bold mb-2">La mission en quelques mots</div>
          <Detail title="Format" content={translate(mission.format)} />
          <Detail title="Objectifs" content={mission.description} />
          <Detail title="Actions" content={mission.actions} />
          <Detail title="Contraintes" content={mission.contraintes} />
          <InfoStructure title="à propos de la structure" structure={mission.structureId} />
        </div>
      ) : (
        <div className="flex flex-col mx-3 my-4">
          <div className="flex items-center justify-between">
            <div className="text-base font-bold mb-2">Informations pratiques</div>
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
        </div>
      )}
      {mission.application ? (
        <>
          <div className="flex items-center justify-center mx-6 my-4">
            {["WAITING_VALIDATION", "WAITING_VERIFICATION"].includes(mission?.application.status) ? (
              <button className="group flex items-center gap-1 border-[1px] px-10 py-2 rounded-lg" onClick={() => updateApplication(APPLICATION_STATUS.CANCEL)} disabled={loading}>
                <IoMdInformationCircleOutline className="h-5 w-5 group-disabled:text-red-300 text-red-400" />
                <div className="text-sm leading-5 font-medium group-disabled:text-gray-400 text-gray-800">Annuler cette candidature</div>
              </button>
            ) : null}
            {["IN_PROGRESS", "VALIDATED"].includes(mission?.application.status) ? (
              <button className="group flex items-center gap-1 border-[1px] px-10 py-2 rounded-lg" onClick={() => updateApplication(APPLICATION_STATUS.ABANDON)} disabled={loading}>
                <IoMdInformationCircleOutline className="h-5 w-5 group-disabled:text-red-300 text-red-400" />
                <div className="text-sm leading-5 font-medium group-disabled:text-gray-400 text-gray-800">Abandonner la mission</div>
              </button>
            ) : null}
          </div>
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
      {mission.application.status === "VALIDATED" && (
        <>
          <hr className="text-gray-100" />
          <div className="mt-8 ml-3">
            <div className="flex justify-between">
              <div className="text-[15px] leading-6 font-semibold">Pièces jointes</div>
              <div className="flex space-x-4 items-center">
                {optionsType.reduce((nmb, option) => nmb + mission.application[option].length, 0) !== 0 && (
                  <div
                    className="group flex items-center rounded-lg text-blue-600 text-center text-sm py-2 px-4 border-blue-600 border-[1px] hover:bg-blue-600 hover:text-white transition duration-100 ease-in-out"
                    onClick={() => setOpenAttachments(!openAttachments)}>
                    {openAttachments ? "Masquer" : "Voir"}
                    <BsChevronDown className={`ml-3 text-blue-600 group-hover:text-white h-5 w-5 ${openAttachments ? "rotate-180" : ""}`} />
                  </div>
                )}
                <div
                  className="text-white bg-blue-600  rounded-full p-2 "
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
              <div className="flex flex-row overflow-x-auto gap-4 my-4 w-full ">
                {optionsType.map(
                  (option, index) =>
                    mission.application[option].length > 0 && (
                      <FileCard
                        key={index}
                        name={translateAddFilePhase2(option)[3].toUpperCase() + translateAddFilePhase2(option).slice(4)}
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
  );
}

const TabItem = ({ name, active, setCurrentTab, children }) => (
  <div
    onClick={() => setCurrentTab(name)}
    className={`px-3 py-4 cursor-pointer text-sm text-coolGray-500  hover:text-blue-600 hover:border-b-[3px] hover:border-blue-600
        ${active && "text-blue-600 font-bold border-b-[3px] border-blue-600"}`}>
    {children}
  </div>
);

const ApplyButton = ({ placesLeft, setModal, disabledAge, disabledIncomplete, disabledPmRefused, scrollToBottom, duration, young }) => {
  const now = new Date();
  if (now < COHESION_STAY_END[young.cohort])
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-red-500 text-xs text-center">Pour candidater, vous devez avoir terminé votre séjour de cohésion</div>
        <div className="flex flex-col items-stretch gap-4">
          <button disabled className="px-12 py-2 rounded-lg text-white bg-blue-600 disabled:bg-blue-600/60 text-sm cursor-pointer">
            Candidater
          </button>
          <HoursAndPlaces duration={duration} placesLeft={placesLeft} />
        </div>
      </div>
    );

  if (disabledAge)
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-red-500 text-xs">Pour candidater, vous devez avoir plus de 16 ans (révolus le 1er jour de la Préparation militaire choisie)</div>
        <div className="flex flex-col items-stretch gap-4">
          <button disabled className="px-12 py-2 rounded-lg text-white bg-blue-600 disabled:bg-blue-600/60 text-sm cursor-pointer">
            Candidater
          </button>
          <HoursAndPlaces duration={duration} placesLeft={placesLeft} />
        </div>
      </div>
    );

  if (disabledPmRefused)
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-red-500 text-xs">Vous n’êtes pas éligible aux préparations militaires. Vous ne pouvez pas candidater</div>
        <div className="flex flex-col items-stretch gap-4">
          <button className="px-12 py-2 rounded-lg text-white bg-blue-600/60  text-sm cursor-pointer">Candidater</button>
          <HoursAndPlaces duration={duration} placesLeft={placesLeft} />
        </div>
      </div>
    );
  if (disabledIncomplete)
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-red-500 text-center text-xs">Pour candidater, veuillez téléverser le dossier d’égibilité présent en bas de page</div>
        <div className="flex flex-col items-stretch gap-4">
          <button className="px-12 py-2 rounded-lg text-white bg-blue-600  text-sm cursor-pointer" onClick={() => scrollToBottom()}>
            Candidater
          </button>
          <HoursAndPlaces duration={duration} placesLeft={placesLeft} />
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-stretch gap-4">
      <button
        className="py-2 rounded-lg text-white bg-blue-600 text-sm cursor-pointer "
        onClick={() => {
          setModal("APPLY");
          plausibleEvent("Phase2/CTA missions - Candidater");
        }}>
        Candidater
      </button>
      <HoursAndPlaces duration={duration} placesLeft={placesLeft} />
    </div>
  );
};

const ApplicationStatus = ({ application, tutor, mission, updateApplication, loading, disabledAge, disabledIncomplete, disabledPmRefused, scrollToBottom }) => {
  const [message, setMessage] = React.useState(null);

  useEffect(() => {
    if (disabledIncomplete) setMessage("Pour candidater, veuillez téléverser le dossier d’égibilité présent en bas de page");
    if (disabledPmRefused) setMessage("Vous n’êtes pas éligible aux préparations militaires. Vous ne pouvez pas candidater");
    if (disabledAge) setMessage("Pour candidater, vous devez avoir plus de 16 ans (révolus le 1er jour de la Préparation militaire choisie)");
  }, [disabledAge, disabledIncomplete, disabledPmRefused]);

  const theme = {
    background: {
      WAITING_VALIDATION: "bg-sky-100",
      WAITING_VERIFICATION: "bg-sky-100",
      WAITING_ACCEPTATION: "bg-orange-500",
      VALIDATED: "bg-[#71C784]",
      DONE: "bg-[#2094FF]",
      REFUSED: "bg-red-500",
      CANCEL: "bg-[#F4F4F4]",
      IN_PROGRESS: "bg-indigo-600",
      ABANDON: "bg-gray-50",
    },
    text: {
      WAITING_VALIDATION: "text-sky-600",
      WAITING_VERIFICATION: "text-sky-600",
      WAITING_ACCEPTATION: "text-white",
      VALIDATED: "text-white",
      DONE: "text-white",
      REFUSED: "text-white",
      CANCEL: "text-[#6B6B6B]",
      IN_PROGRESS: "text-white",
      ABANDON: "text-gray-400",
    },
  };
  if (["WAITING_VALIDATION", "WAITING_VERIFICATION", "REFUSED", "CANCEL"].includes(application.status)) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex items-center gap-6">
          <div className={`text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} px-2 py-[2px] rounded-sm`}>
            {["WAITING_VALIDATION", "WAITING_VERIFICATION"].includes(application.status) ? "Candidature en attente" : translateApplication(application.status)}
          </div>
        </div>
        <HoursAndPlaces duration={mission?.duration} placesLeft={mission.placesLeft} />
      </div>
    );
  }
  if (["IN_PROGRESS", "VALIDATED", "DONE", "ABANDON"].includes(application.status)) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex items-center gap-6">
          <div className={`text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} px-2 py-[2px] rounded-sm`}>
            {translateApplication(application.status)}
          </div>
        </div>
        {tutor ? (
          <div className="border border-gray-200 rounded-lg py-2 px-3 flex gap-6">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-bold">Contacter mon tuteur</div>
              <div className="text-xs text-gray-600">
                {tutor.firstName} {tutor.lastName} - {tutor.email}
              </div>
            </div>
            <MdOutlineContentCopy
              className="text-gray-400 hover:text-blue-600 cursor-pointer h-4 w-4"
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
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="text-xs text-center leading-none font-normal text-gray-500">
          Cette mission vous a été proposée <br /> par votre référent
        </div>
        <div className="flex items-center gap-3">
          {disabledAge || disabledIncomplete || disabledPmRefused ? (
            <button
              className="group flex items-center justify-center rounded-lg px-4 py-2 bg-blue-400"
              onClick={() => disabledIncomplete && !disabledPmRefused && !disabledAge && scrollToBottom()}>
              <CheckCircle className="text-blue-400 mr-2 w-5 h-5 " />
              <span className="text-sm leading-5 font-medium text-white">Accepter</span>
            </button>
          ) : (
            <button
              className="group flex items-center justify-center rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 transition duration-300 ease-in-out disabled:bg-blue-400"
              disabled={loading}
              onClick={() => updateApplication(APPLICATION_STATUS.WAITING_VALIDATION)}>
              <CheckCircle className="text-blue-600 mr-2 w-5 h-5 hover:text-blue-500 group-disabled:text-blue-400" />
              <span className="text-sm leading-5 font-medium text-white">Accepter</span>
            </button>
          )}
          <button
            className="group flex items-center justify-center rounded-lg shadow-ninaButton px-4 py-2 transition duration-300 ease-in-out border-[1px] border-[#fff] hover:border-gray-200 disabled:shadow-none disabled:border-gray-200"
            disabled={loading}
            onClick={() => updateApplication(APPLICATION_STATUS.CANCEL)}>
            <XCircle className="text-red-500 mr-2 w-5 h-5" />
            <span className="text-sm leading-5 font-medium text-black">Décliner</span>
          </button>
        </div>
        {disabledAge || disabledIncomplete || disabledPmRefused ? <div className="text-red-500 text-center text-xs">{message}</div> : null}

        <HoursAndPlaces duration={mission?.duration} placesLeft={mission.placesLeft} />
      </div>
    );
  }
};

const Detail = ({ title, content }) => {
  const [value] = useState((Array.isArray(content) && content) || [content]);
  return content && content.length ? (
    <div className="my-3">
      <div className="text-gray-500 text-xs uppercase">{title}</div>
      {value.map((e, i) => (
        <div key={i} className="text-sm leading-5 font-normal" dangerouslySetInnerHTML={{ __html: htmlCleaner(translate(e)) }} />
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
      if (!ok) toastr.error("Oups, une erreur est survenue lors de la récupération de la structure", translate(code));
      else setValue(data.description);
      return;
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
      <div className="text-gray-500 text-xs uppercase">{title}</div>
      <div className="text-sm leading-5 font-normal">
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

const HoursAndPlaces = ({ duration, placesLeft }) => {
  return (
    <div className={`flex items-center ${duration ? "justify-between" : "justify-center"} gap-6`}>
      {duration ? (
        <div className="flex items-center gap-1">
          <AiOutlineClockCircle className="text-gray-400" />
          <div className="text-xs">{duration} heure(s)</div>
        </div>
      ) : null}
      <div className="text-xs leading-none font-normal text-gray-500">{placesLeft} places disponibles</div>
    </div>
  );
};
