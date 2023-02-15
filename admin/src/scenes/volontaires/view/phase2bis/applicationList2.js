import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory, NavLink } from "react-router-dom";
import Eye from "../../../../assets/icons/Eye";
import IconDomain from "../../../../components/IconDomain";
import Loader from "../../../../components/Loader";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import ModalConfirm from "../../../../components/modals/ModalConfirm";
import { APPLICATION_STATUS, formatStringDateTimezoneUTC, translate, SENDINBLUE_TEMPLATES } from "../../../../utils";
import { SelectStatusApplicationPhase2 } from "./components/SelectStatusApplicationPhase2";
import Tag from "../../../../components/Tag";
import ReactTooltip from "react-tooltip";

export default function ApplicationList({ young, onChangeApplication }) {
  const [applications, setApplications] = useState(null);
  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

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
    data.sort((a, b) => (parseInt(a.priority) > parseInt(b.priority) ? 1 : parseInt(b.priority) > parseInt(a.priority) ? -1 : 0));
    return setApplications(data);
  };

  if (!applications) return <Loader />;
  if (!applications.length) return <div className="italic text-center m-8">Aucune candidature n&apos;est liée à ce volontaire.</div>;
  return (
    <div className="px-12 pt-6 pb-12 space-y-8">
      {applications.map((hit, i) => (
        <Hit key={hit._id} young={young} hit={hit} index={i} onChangeApplication={onChangeApplication} optionsType={optionsType} />
      ))}
    </div>
  );
}

const Hit = ({ hit, index, young, onChangeApplication }) => {
  const [mission, setMission] = useState();
  const [contract, setContract] = useState();
  const numberOfFiles = hit?.contractAvenantFiles.length + hit?.justificatifsFiles.length + hit?.feedBackExperienceFiles.length + hit?.othersFiles.length;
  const history = useHistory();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  useEffect(() => {
    (async () => {
      if (!hit.missionId) return;
      const { ok, data, code } = await api.get(`/mission/${hit.missionId}`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setMission(data);
      if (!hit.contractId) return;
      const { ok: okContract, data: dataContract, code: codeContract } = await api.get(`/contract/${hit.contractId}`);
      if (!okContract) {
        capture(codeContract);
        return toastr.error("Oups, une erreur est survenue", codeContract);
      }
      setContract(dataContract);
    })();
  }, []);

  if (!mission) return null;
  return (
    <div className="bg-white shadow-ninaButton rounded-xl p-3 flex gap-6">
      {/* icon */}
      <div className="pl-2 my-auto">
        <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
      </div>

      <div className="flex-1 grid grid-rows-4">
        <div className="flex items-center justify-between uppercase text-gray-500 font-medium text-xs tracking-wider">
          <p className="">{mission.structureName}</p>
          {/* Choix*/}
          <p className="">{hit.status === APPLICATION_STATUS.WAITING_ACCEPTATION ? "Mission proposée au volontaire" : `Choix ${index + 1}`}</p>
        </div>

        <div className="row-span-2 flex justify-between items-center">
          <div className="w-1/2 overflow-hidden">
            <Link to={`/mission/${hit.missionId}`} className="text-lg font-semibold leading-6 my-auto text-gray-900">
              {mission.name}
            </Link>
          </div>

          {/* date */}
          <div className="w-1/6 text-xs font-medium space-y-1">
            <div>
              <span className="text-gray-500">Du </span>
              <span className="text-gray-700">{formatStringDateTimezoneUTC(mission.startAt)}</span>
            </div>
            <div>
              <span className="text-gray-500">Au </span>
              <span className="text-gray-700">{formatStringDateTimezoneUTC(mission.endAt)}</span>
            </div>
          </div>

          {/* places disponibles */}
          <div className="w-1/6 flex justify-between">
            {["VALIDATED", "IN_PROGRESS", "DONE"].includes(hit.status) ? (
              <div className="flex flex-col">
                {contract?.invitationSent === "true" ? (
                  <div className="font-medium text-xs text-gray-700 ">Contrat {hit.contractStatus === "VALIDATED" ? "signé" : "envoyé"}</div>
                ) : (
                  <div className="flex flex-row items-center">
                    <div className="w-[8px] h-[8px] rounded-full bg-orange-500" />
                    <div className="font-medium text-xs text-gray-700 ml-1">Contrat en brouillon</div>
                  </div>
                )}
                {numberOfFiles >= 1 && (
                  <div className="flex flex-row items-center mt-1">
                    <div className="w-[8px] h-[8px] rounded-full bg-orange-500" />
                    <div className="font-medium text-xs text-gray-700 ml-1">
                      {numberOfFiles} pièce{numberOfFiles > 1 ? "s" : ""} jointe{numberOfFiles > 1 ? "s" : ""}
                    </div>
                  </div>
                )}
              </div>
            ) : mission.placesLeft <= 1 ? (
              <div className="font-medium text-xs text-gray-700"> {mission.placesLeft} place disponible</div>
            ) : (
              <div className="font-medium text-xs text-gray-700"> {mission.placesLeft} places disponibles</div>
            )}
            <div>
              <NavLink
                to={`/volontaire/${young._id.toString()}/phase2/application/${hit._id.toString()}`}
                className="flex justify-center items-center h-8 w-8 bg-gray-100 !text-gray-600 rounded-full hover:scale-105 cursor-pointer border-[1px] border-gray-100 hover:border-gray-300"
                data-tip=""
                data-for="tooltip-application">
                <Eye width={16} height={16} />
              </NavLink>
              <ReactTooltip id="tooltip-application" type="light" place="top" effect="solid" className="shadow-xl custom-tooltip-radius" tooltipRadius="6">
                <div className="text-xs">Voir la candidature</div>
              </ReactTooltip>
            </div>
          </div>

          {/* statut */}
          <div className="w-1/6 flex" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1" />
            <SelectStatusApplicationPhase2
              hit={hit}
              callback={(status) => {
                if (status === "VALIDATED") {
                  history.push(`/volontaire/${young._id}/phase2/application/${hit._id}/contrat`);
                }
                onChangeApplication && onChangeApplication();
              }}
              dropdownClassName="right-3"
            />
            {hit.status === "WAITING_VALIDATION" && (
              <div className="absolute right-6">
                <div
                  className="text-blue-600 text-xs cursor-pointer underline mt-1"
                  onClick={async () => {
                    setModal({
                      isOpen: true,
                      title: "Renvoyer un mail",
                      message: "Souhaitez-vous renvoyer un mail à la structure ?",
                      onConfirm: async () => {
                        try {
                          const responseNotification = await api.post(`/application/${hit._id}/notify/${SENDINBLUE_TEMPLATES.referent.RELANCE_APPLICATION}`);
                          if (!responseNotification?.ok) return toastr.error(translate(responseNotification?.code), "Une erreur s'est produite avec le service de notification.");
                          toastr.success("L'email a bien été envoyé");
                        } catch (e) {
                          toastr.error("Une erreur est survenue lors de l'envoi du mail", e.message);
                        }
                      },
                    });
                  }}>
                  Relancer la structure
                </div>
                <ModalConfirm
                  isOpen={modal?.isOpen}
                  title={modal?.title}
                  message={modal?.message}
                  onCancel={() => setModal({ isOpen: false, onConfirm: null })}
                  onConfirm={() => {
                    modal?.onConfirm();
                    setModal({ isOpen: false, onConfirm: null });
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* tags */}
        <div className="h-8 flex items-center gap-2">
          <Tag tag={`${mission.city} ${mission.zip}`} />
          {mission.domains && mission.domains.map((tag, index) => <Tag key={index} tag={translate(tag)} />)}
          {mission.isMilitaryPreparation === "true" && <Tag tag="Préparation militaire" />}
        </div>
      </div>
    </div>
  );
};
