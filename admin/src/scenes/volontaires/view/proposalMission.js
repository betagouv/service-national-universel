import React, { useState } from "react";
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
    // Ajouter vérif si mission déjà proposée
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
    if (!okMail) {
      toastr.error("Oups, une erreur est survenue lors de l'envoi du mail", codeMail);
      capture(codeMail);
      return;
    }
    toastr.success("Email envoyé !");
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
  return (
    <div className="bg-white shadow-md rounded-xl p-4 my-8">
      <div className="flex gap-6">
        <div className="m-auto">
          <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
        </div>
        <div className="w-full space-y-4">
          <p className="text-xs uppercase">{mission.structureName}</p>
          <div className="flex justify-between items-center">
            <div className="w-1/3 text-lg font-semibold leading-6">{mission.name}</div>
            <table className="text-sm table-auto">
              <tr>
                <td className="text-gray-500 p-1">Du </td>
                <td className="text-gray-700">{formatStringDateTimezoneUTC(mission.startAt)}</td>
              </tr>
              <tr>
                <td className="text-gray-500 p-1">Au </td>
                <td className="text-gray-700">{formatStringDateTimezoneUTC(mission.endAt)}</td>
              </tr>
            </table>
            <p className="text-xs leading-4 font-medium">
              {mission.placesLeft} {mission.placesLeft > 1 ? "places disponibles" : "place disponible"}
            </p>
            <button className="bg-blue-600 px-3 py-2 rounded-md text-sm text-blue-50 hover:brightness-110 active:brightness-125" onClick={onSend}>
              Proposer la mission
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Tag tag={`${mission.city} ${mission.zip}`} />
            {mission.domains && mission.domains.map((tag, index) => <Tag key={index} tag={translate(tag)} />)}
            {mission.isMilitaryPreparation === "true" && <Tag tag="Préparation militaire" />}
          </div>
        </div>
      </div>
    </div>
  );
};

const Tag = ({ tag }) => {
  return <div className="flex text-xs text-gray-600 rounded-full border-gray-200 border-[1px] justify-center items-center px-3 py-1 font-medium ">{tag}</div>;
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
