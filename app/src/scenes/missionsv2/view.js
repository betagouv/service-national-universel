import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import DomainThumb from "../../components/DomainThumb";
import DoubleDayTile from "../../components/DoubleDayTile";
import Loader from "../../components/Loader";
import WithTooltip from "../../components/WithTooltip";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { formatStringDateTimezoneUTC, htmlCleaner, translate } from "../../utils";
import DocumentsPM from "../militaryPreparationV2/components/DocumentsPM";
import ApplyDoneModal from "./components/ApplyDoneModal";
import ApplyModal from "./components/ApplyModal";

export default function View(props) {
  const [mission, setMission] = useState();
  const [modal, setModal] = useState(null);
  const [disabledAge, setDisabledAge] = useState(false);
  const [disabledIncomplete, setDisabledIncomplete] = useState(false);
  const young = useSelector((state) => state.Auth.young);
  const docRef = useRef();
  const getMission = async () => {
    const id = props.match && props.match.params && props.match.params.id;
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
    // on vérifie que le vonlontaire aura plus de 16 ans au début de la mission
    if (mission?.isMilitaryPreparation === "true") {
      const ageAtStart = getDiffYear(mission.startAt, young.birthdateAt);
      setDisabledAge(ageAtStart < 16);
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

  if (mission === undefined) return <Loader />;

  return (
    <div className="bg-white mx-4 pb-12 my-4 rounded-xl">
      {/* BEGIN HEADER */}
      <div className="flex justify-between p-8 border-b-[1px] border-gray-100">
        <div className="flex">
          {/* icon */}
          <div className="flex items-center">
            <DomainThumb domain={mission.domains[0]} size="3rem" />
          </div>

          {/* infos mission */}
          <div className="flex flex-col">
            <div className="space-y-2">
              <div className="text-gray-500 text-xs uppercase">{mission.structureName}</div>
              <div className="text-gray-900 font-bold text-base">{mission.name}</div>
              <div className="flex space-x-2">
                {getTags()?.map((e, i) => (
                  <div key={i} className="flex justify-center items-center text-gray-600 border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">
                    {e}
                  </div>
                ))}
                {mission.isMilitaryPreparation === "true" ? (
                  <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">Préparation militaire</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-xs text-gray-700">
            <ApplyButton
              applied={mission.application}
              placesLeft={mission.placesLeft}
              setModal={setModal}
              disabledAge={disabledAge}
              disabledIncomplete={disabledIncomplete}
              scrollToBottom={scrollToBottom}
            />
          </div>
        </div>
      </div>
      {/* END HEADER */}

      <div className="flex m-8">
        <div className="flex flex-col w-1/2 pl-12">
          <div className="text-lg font-bold mb-2">La mission en quelques mots</div>
          <Detail title="Format" content={translate(mission.format)} />
          <Detail title="Objectifs" content={mission.description} />
          <Detail title="Actions" content={mission.actions} />
          <Detail title="Contraintes" content={mission.contraintes} />
          <InfoStructure title="à propos de la structure" structure={mission.structureId} />
        </div>
        <div className="flex flex-col w-1/2 pl-12 border-l-[1px] border-gray-100">
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
      <hr className="text-gray-100" />
      {mission.isMilitaryPreparation === "true" ? (
        <div className="mx-8 mt-8">
          <DocumentsPM docRef={docRef} showFolder={!["VALIDATED"].includes(young.statusMilitaryPreparationFiles)} />
        </div>
      ) : null}
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

const ApplyButton = ({ applied, placesLeft, setModal, disabledAge, disabledIncomplete, scrollToBottom }) => {
  if (applied)
    return (
      <div className="flex flex-col items-center">
        <Link to="/candidature">
          <div className="px-12 py-2 rounded-lg text-white bg-blue-600 text-sm cursor-pointer">Voir&nbsp;la&nbsp;candidature</div>
        </Link>
      </div>
    );

  if (disabledAge)
    return (
      <div className="flex flex-col items-center">
        <WithTooltip tooltipText="Pour candidater, vous devez avoir plus de 16 ans (révolus le 1er jour de la Préparation militaire choisie)">
          <button disabled className="px-12 py-2 rounded-lg text-white bg-blue-600 disabled:bg-blue-600/60 text-sm cursor-pointer">
            Candidater
          </button>
        </WithTooltip>
        <div className="text-xs leading-none font-normal text-gray-500">{placesLeft} places disponibles</div>
      </div>
    );
  if (disabledIncomplete)
    return (
      <div className="flex flex-col items-center">
        <WithTooltip tooltipText="Pour candidater, veuillez téléverser le dossier d’égibilité présent en bas de page">
          <button className="px-12 py-2 rounded-lg text-white bg-blue-600  text-sm cursor-pointer" onClick={() => scrollToBottom()}>
            Candidater
          </button>
        </WithTooltip>
        <div className="text-xs leading-none font-normal text-gray-500">{placesLeft} places disponibles</div>
      </div>
    );

  return (
    <div className="flex flex-col items-center space-y-4">
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
