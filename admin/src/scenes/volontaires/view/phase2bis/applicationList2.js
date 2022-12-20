import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory, NavLink } from "react-router-dom";
import Eye from "../../../../assets/icons/Eye";
import IconDomain from "../../../../components/IconDomain";
import Loader from "../../../../components/Loader";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import { APPLICATION_STATUS, formatStringDateTimezoneUTC, translate } from "../../../../utils";
import { SelectStatusApplicationPhase2 } from "./components/SelectStatusApplicationPhase2";
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
  return (
    <div className="p-1">
      {/* Mission card */}
      <div className="mx-14 ">
        {applications.map((hit, i) => (
          <Hit key={hit._id} young={young} hit={hit} index={i} onChangeApplication={onChangeApplication} optionsType={optionsType} />
        ))}

        {applications.length ? null : <div className="italic text-center m-8">Aucune candidature n&apos;est liée à ce volontaire.</div>}
      </div>
    </div>
  );
}

const Hit = ({ hit, index, young, onChangeApplication }) => {
  const [mission, setMission] = useState();
  const [tags, setTags] = useState();
  const [contract, setContract] = useState();
  const numberOfFiles = hit?.contractAvenantFiles.length + hit?.justificatifsFiles.length + hit?.feedBackExperienceFiles.length + hit?.othersFiles.length;
  const history = useHistory();
  useEffect(() => {
    (async () => {
      if (!hit.missionId) return;
      const { ok, data, code } = await api.get(`/mission/${hit.missionId}`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setMission(data);
      const t = [];
      data?.city && t.push(data?.city + (data?.zip ? ` - ${data?.zip}` : ""));
      (data?.domains || []).forEach((d) => t.push(translate(d)));
      setTags(t);
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
    <div className="relative w-full  bg-white shadow-nina rounded-xl p-4 border-[1px] border-white hover:border-gray-200 shadow-ninaButton mb-4">
      {/* Choix*/}
      <div className="text-gray-500 font-medium uppercase text-xs flex justify-end tracking-wider mb-2">
        {hit.status === APPLICATION_STATUS.WAITING_ACCEPTATION ? "Mission proposée au volontaire" : `Choix ${index + 1}`}
      </div>
      <div className="flex justify-between">
        <Link className="flex basis-[35%] items-center" to={`/mission/${hit.missionId}`}>
          {/* icon */}
          <div className="flex items-center mr-4">
            <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
          </div>
          {/* mission info */}
          <div className="flex flex-col flex-1 justify-center">
            <div className="uppercase text-gray-500 font-medium text-[11px] tracking-wider mb-1">{mission.structureName}</div>
            <div className="text-[#242526] font-bold text-base mb-2">{mission.name}</div>
            {/* tags */}
            {tags && (
              <div className=" inline-flex flex-wrap">
                {tags.map((tag, index) => {
                  return (
                    <div
                      key={index}
                      className=" flex text-[11px] text-gray-600 rounded-full border-gray-200 border-[1px] justify-center items-center mb-2 mt-1 mr-1 px-3  py-0.5 font-medium ">
                      {tag}
                    </div>
                  );
                })}
                {mission.isMilitaryPreparation === "true" ? (
                  <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full text-[11px] mb-2 mr-1 px-3 py-0.5 font-medium">
                    Préparation militaire
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </Link>
        <div className="flex basis-[65%] justify-between items-center">
          {/* date */}
          <div className="flex flex-col basis-[30%] justify-center">
            <div>
              <span className="text-gray-500 mr-1 text-xs">Du</span>
              <span className="text-[#242526] text-xs">{formatStringDateTimezoneUTC(mission.startAt)}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs mr-1">Au</span>
              <span className="text-[#242526] text-xs">{formatStringDateTimezoneUTC(mission.endAt)}</span>
            </div>
          </div>

          {/* places disponibles */}
          <div className="flex basis-[25%]">
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
            ) : (
              <>
                {mission.placesLeft <= 1 ? (
                  <div className="font-medium text-xs text-gray-700"> {mission.placesLeft} place disponible</div>
                ) : (
                  <div className="font-medium text-xs text-gray-700"> {mission.placesLeft} places disponibles</div>
                )}
              </>
            )}
          </div>
          <div>
            <NavLink
              to={`/volontaire/${young._id.toString()}/phase2/application/${hit._id.toString()}`}
              className="flex justify-center items-center h-8 w-8 bg-gray-100 !text-gray-600 rounded-full hover:scale-105 cursor-pointer border-[1px] border-gray-100 hover:border-gray-300">
              <Eye width={16} height={16} />
            </NavLink>
          </div>
          <div className="flex basis-[35%] justify-end">
            {/* statut */}
            <div onClick={(e) => e.stopPropagation()}>
              <div>
                <SelectStatusApplicationPhase2
                  hit={hit}
                  callback={(status) => {
                    if (status === "VALIDATED") {
                      history.push(`/volontaire/${young._id}/phase2/application/${hit._id}/contrat`);
                    }
                    onChangeApplication && onChangeApplication();
                  }}
                />
              </div>
            </div>
          </div>
          {/* end statut */}
        </div>
      </div>
    </div>
  );
};
