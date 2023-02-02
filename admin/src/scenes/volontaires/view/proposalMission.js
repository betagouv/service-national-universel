import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";
import ReactiveListComponent from "../../../components/ReactiveListComponent";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import { APPLICATION_STATUS, formatStringDateTimezoneUTC, getResultLabel, SENDINBLUE_TEMPLATES } from "../../../utils";
import { Link } from "react-router-dom";
import YoungHeader from "../../phase0/components/YoungHeader";
import { capture } from "../../../sentry";
import { translate } from "snu-lib";
import IconDomain from "../../../components/IconDomain";

export default function ProposeMission({ young, onSend }) {
  const FILTERS = ["SEARCH"];
  const [searchedValue, setSearchedValue] = useState("");

  const getDefaultQuery = () => {
    return {
      query: {
        bool: {
          must: [
            {
              script: {
                script: "doc['pendingApplications'].value < doc['placesLeft'].value * 5",
              },
            },
          ],
          filter: [
            {
              range: {
                endAt: {
                  gt: "now",
                },
              },
            },
            { term: { "status.keyword": "VALIDATED" } },
            { term: { "visibility.keyword": "VISIBLE" } },
            {
              range: {
                placesLeft: {
                  gt: 0,
                },
              },
            },
          ],
        },
      },
      track_total_hits: true,
    };
  };

  const handleProposal = async (mission) => {
    const application = {
      status: APPLICATION_STATUS.WAITING_ACCEPTATION,
      youngId: young._id,
      youngFirstName: young.firstName,
      youngLastName: young.lastName,
      youngEmail: young.email,
      youngBirthdateAt: young.birthdateAt,
      youngCity: young.city,
      youngDepartment: young.department,
      youngCohort: young.cohort,
      missionId: mission._id,
      missionName: mission.name,
      missionDepartment: mission.department,
      missionRegion: mission.region,
      structureId: mission.structureId,
      tutorId: mission.tutorId,
      tutorName: mission.tutorName,
    };
    const { ok, code } = await api.post(`/application`, application);
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de la candidature", code);

    //send mail
    const { ok: okMail, code: codeMail } = await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION}`, {
      missionName: mission.name,
      structureName: mission.structureName,
    });
    if (!okMail) return toastr.error("Oups, une erreur est survenue lors de l'envoi du mail", codeMail);
    toastr.success("Email envoyé !");
    return onSend();
  };

  return (
    <>
      <YoungHeader young={young} onChange={onSend} />
      <div className="bg-white rounded-xl shadow-sm m-8 p-8 space-y-8 items-center">
        <div className="grid grid-cols-9 border-b pb-8">
          <div className="w-9 h-9 rounded-full p-2 bg-gray-200 cursor-pointer hover:scale-105">
            <Link to={`/volontaire/${young._id}/phase2`}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.83333 13.3334L2.5 10.0001M2.5 10.0001L5.83333 6.66675M2.5 10.0001L17.5 10.0001"
                  stroke="#374151"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
          <h1 className="text-center text-2xl font-semibold col-span-7">
            Proposer une mission à {young.firstName} {young.lastName}
          </h1>
        </div>
        <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <DataSearch
            showIcon={false}
            placeholder="Rechercher une mission par mots clés..."
            componentId="SEARCH"
            dataField={["name.folded^10", "description", "justifications", "contraintes", "frequence", "period"]}
            fuzziness={1}
            autosuggest={false}
            onValueChange={setSearchedValue}
            queryFormat="and"
            innerClass={{ input: "searchbox" }}
            className="datasearch-searchfield w-1/3 mx-auto"
          />
          {searchedValue && (
            <ReactiveListComponent
              defaultQuery={getDefaultQuery}
              scrollOnChange={false}
              react={{ and: FILTERS }}
              paginationAt="bottom"
              size={3}
              showLoader={true}
              renderResultStats={(e) => {
                return (
                  <div>
                    <BottomResultStats>{getResultLabel(e, 3)}</BottomResultStats>
                  </div>
                );
              }}
              render={({ data }) => data.map((hit, i) => <HitMission key={i} mission={hit} onSend={() => handleProposal(hit)} />)}
            />
          )}
        </ReactiveBase>
      </div>
    </>
  );
}

const HitMission = ({ mission, onSend }) => {
  console.log("🚀 ~ file: proposalMission.js:155 ~ HitMission ~ hit", mission);
  return (
    <div className="bg-white shadow-sm rounded-xl p-4 my-8">
      <div className="flex justify-between">
        <Link className="flex basis-[35%] items-center" to={`/mission/${mission._d}`}>
          {/* icon */}
          <div className="flex items-center mr-4">
            <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
          </div>
          {/* mission info */}
          <div className="flex flex-col flex-1 justify-center">
            <div className="uppercase text-gray-500 font-medium text-[11px] tracking-wider mb-1">{mission.structureName}</div>
            <div className="text-[#242526] font-bold text-base mb-2">{mission.name}</div>
            {/* tags */}
            {mission.domains && (
              <div className=" inline-flex flex-wrap">
                {mission.domains.map((tag, index) => {
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
            {mission.placesLeft <= 0 ? (
              <div className="font-medium text-xs text-gray-700"> {mission.placesLeft} place disponible</div>
            ) : (
              <div className="font-medium text-xs text-gray-700"> {mission.placesLeft} places disponibles</div>
            )}
          </div>
          <div>
            <button className="bg-blue-600 px-3 py-2 rounded-md text-sm text-blue-50 hover:brightness-110 active:brightness-125" onClick={onSend}>
              Proposer la mission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultStats = styled.div`
  color: #242526;
  font-size: 12px;
  padding-left: 25px;
`;

const BottomResultStats = styled(ResultStats)`
  position: absolute;
  top: calc(100% - 50px);
  left: 0;
`;
