import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory, useParams } from "react-router-dom";
import DoubleDayTile from "../../components/DoubleDayTile";
import Loader from "../../components/Loader";
import WithTooltip from "../../components/WithTooltip";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { formatStringDateTimezoneUTC, htmlCleaner, translate, translateApplication, copyToClipboard, APPLICATION_STATUS, SENDINBLUE_TEMPLATES } from "../../utils";
import DocumentsPM from "../militaryPreparation/components/DocumentsPM";
import ApplyDoneModal from "./components/ApplyDoneModal";
import ApplyModal from "./components/ApplyModal";
import IconDomain from "./components/IconDomain";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdOutlineContentCopy } from "react-icons/md";
import CheckCircle from "../../assets/icons/CheckCircle";
import XCircle from "../../assets/icons/XCircle";
import { AiOutlineClockCircle } from "react-icons/ai";

export default function viewDesktop() {
  const [mission, setMission] = useState();
  const [modal, setModal] = useState(null);
  const [disabledAge, setDisabledAge] = useState(false);
  const [disabledIncomplete, setDisabledIncomplete] = useState(false);
  const [disabledPmRefused, setDisabledPmRefused] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const young = useSelector((state) => state.Auth.young);
  const docRef = useRef();
  let { id } = useParams();

  const getMission = async () => {
    if (!id) return setMission(null);
    const { data } = await api.get(`/mission/${id}`);
    return setMission(data);
  };

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
    <div className="bg-white mx-4 pb-12 my-4 rounded-xl w-full">
      {/* BEGIN HEADER */}
      <div className="flex flex-col lg:flex-row justify-between py-8 px-12 border-b-[1px] border-gray-100 gap-4">
        <div className="flex gap-4">
          {/* icon */}
          <div className="flex items-center">
            <IconDomain domain={mission.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission.domains[0]} />
          </div>

          {/* infos mission */}
          <div className="flex flex-col">
            <div className="">
              <div className="text-gray-500 text-xs uppercase">{mission.structureName}</div>
              <div className="text-gray-900 font-bold text-base">{mission.name}</div>
              <div className="flex gap-2 flex-wrap">
                {getTags()?.map((e, i) => (
                  <div key={i} className="flex justify-center items-center text-gray-600 border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">
                    {e}
                  </div>
                ))}
                {mission.isMilitaryPreparation === "true" ? (
                  <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">Préparation militaire</div>
                ) : null}
                {mission?.duration ? (
                  <div className="flex items-center gap-1 ml-2">
                    <AiOutlineClockCircle className="text-gray-400" />
                    <div className="text-xs">{mission.duration} heure(s)</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center mt-3 lg:!mt-0">
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
              disabledAge={disabledAge}
              disabledIncomplete={disabledIncomplete}
              disabledPmRefused={disabledPmRefused}
              scrollToBottom={scrollToBottom}
            />
          )}
        </div>
      </div>
      {/* END HEADER */}

      <div className="flex flex-col lg:flex-row my-8 ">
        <div className="flex flex-col w-full lg:w-1/2 px-12">
          <div className="text-lg font-bold mb-2">La mission en quelques mots</div>
          <Detail title="Format" content={translate(mission.format)} />
          <Detail title="Objectifs" content={mission.description} />
          <Detail title="Actions" content={mission.actions} />
          <Detail title="Contraintes" content={mission.contraintes} />
          <InfoStructure title="à propos de la structure" structure={mission.structureId} />
        </div>
        <div className="flex flex-col w-full lg:w-1/2 px-12 lg:border-l-[1px] lg:border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold mb-2">Informations pratiques</div>
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
      </div>

      {mission.isMilitaryPreparation === "true" ? (
        <>
          <hr className="text-gray-100" />
          <div className="mx-8 mt-8">
            <DocumentsPM docRef={docRef} />
          </div>
        </>
      ) : null}
      {modal === "APPLY" && (
        <ApplyModal
          value={mission}
          onChange={() => setModal(null)}
          onCancel={() => setModal(null)}
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

const ApplyButton = ({ placesLeft, setModal, disabledAge, disabledIncomplete, disabledPmRefused, scrollToBottom }) => {
  if (disabledAge)
    return (
      <div className="flex flex-col items-center gap-2">
        <WithTooltip tooltipText="Pour candidater, vous devez avoir plus de 16 ans (révolus le 1er jour de la Préparation militaire choisie)">
          <button disabled className="px-12 py-2 rounded-lg text-white bg-blue-600 disabled:bg-blue-600/60 text-sm cursor-pointer">
            Candidater
          </button>
        </WithTooltip>
        <div className="text-xs leading-none font-normal text-gray-500">{placesLeft} places disponibles</div>
      </div>
    );

  if (disabledPmRefused)
    return (
      <div className="flex flex-col items-center gap-2">
        <WithTooltip tooltipText="Vous n’êtes pas éligible aux préparations militaires. Vous ne pouvez pas candidater">
          <button className="px-12 py-2 rounded-lg text-white bg-blue-600/60  text-sm cursor-pointer">Candidater</button>
        </WithTooltip>
        <div className="text-xs leading-none font-normal text-gray-500">{placesLeft} places disponibles</div>
      </div>
    );
  if (disabledIncomplete)
    return (
      <div className="flex flex-col items-center gap-2">
        <WithTooltip tooltipText="Pour candidater, veuillez téléverser le dossier d’éligibilité présent en bas de page">
          <button className="px-12 py-2 rounded-lg text-white bg-blue-600  text-sm cursor-pointer" onClick={() => scrollToBottom()}>
            Candidater
          </button>
        </WithTooltip>
        <div className="text-xs leading-none font-normal text-gray-500">{placesLeft} places disponibles</div>
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className="px-12 py-2 rounded-lg text-white bg-blue-600 text-sm cursor-pointer "
        onClick={() => {
          setModal("APPLY");
          plausibleEvent("Phase2/CTA missions - Candidater");
        }}>
        Candidater
      </button>
      <div className="text-xs leading-none font-normal text-gray-500">{placesLeft} places disponibles</div>
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
      <div className="flex flex-col justify-center items-center lg:items-end gap-4">
        <div className="flex items-center gap-6">
          {["WAITING_VALIDATION", "WAITING_VERIFICATION"].includes(application.status) ? (
            <div
              className={`group flex items-center gap-1 ${loading ? "hover:scale-100 cursor-wait" : "cursor-pointer hover:scale-105"}`}
              onClick={() => !loading && updateApplication(APPLICATION_STATUS.CANCEL)}>
              <IoMdInformationCircleOutline className={`h-4 w-4 ${loading ? "text-gray-400" : "text-gray-700"}`} />
              <div className={`text-xs leading-none font-normal underline ${loading ? "text-gray-400" : "text-gray-700"}`}>Annuler cette candidature</div>
            </div>
          ) : null}
          <div className={`text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} px-2 py-[2px] rounded-sm`}>
            {["WAITING_VALIDATION", "WAITING_VERIFICATION"].includes(application.status) ? "Candidature en attente" : translateApplication(application.status)}
          </div>
        </div>
        <div className="text-xs leading-none font-normal text-gray-500">
          Places disponibles : {mission.placesLeft}/{mission.placesTotal}{" "}
        </div>
      </div>
    );
  }
  if (["IN_PROGRESS", "VALIDATED", "DONE", "ABANDON"].includes(application.status)) {
    return (
      <div className="flex flex-col justify-center items-center lg:items-end gap-4">
        <div className="flex items-center gap-6">
          {["IN_PROGRESS", "VALIDATED"].includes(application.status) ? (
            <div
              className={`group flex items-center gap-1 ${loading ? "hover:scale-100 cursor-wait" : "cursor-pointer hover:scale-105"}`}
              onClick={() => !loading && updateApplication(APPLICATION_STATUS.ABANDON)}>
              <IoMdInformationCircleOutline className={`h-4 w-4 ${loading ? "text-gray-400" : "text-gray-700"}`} />
              <div className={`text-xs leading-none font-normal underline ${loading ? "text-gray-400" : "text-gray-700"}`}>Abandonner la mission</div>
            </div>
          ) : null}
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
            <WithTooltip tooltipText={message}>
              <button
                className="group flex items-center justify-center rounded-lg px-4 py-2 bg-blue-400"
                onClick={() => disabledIncomplete && !disabledPmRefused && !disabledAge && scrollToBottom()}>
                <CheckCircle className="text-blue-400 mr-2 w-5 h-5" />
                <span className="text-sm leading-5 font-medium text-white">Accepter</span>
              </button>
            </WithTooltip>
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
        <div className="text-xs leading-none font-normal text-gray-500">
          Places disponibles : {mission.placesTotal - mission.placesLeft}/{mission.placesTotal}
        </div>
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
