import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";
import ReactiveListComponent from "../../../components/ReactiveListComponent";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import { APPLICATION_STATUS, formatStringDateTimezoneUTC, getResultLabel, SENDINBLUE_TEMPLATES } from "../../../utils";
import { Link } from "react-router-dom";
import Loadingbutton from "../../../components/buttons/LoadingButton";
import plausibleEvent from "../../../services/plausible";
import YoungHeader from "../../phase0/components/YoungHeader";

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
        <div className="grid grid-cols-3 border-b pb-8">
          <div className="w-9 rounded-full p-2 bg-gray-200 cursor-pointer hover:scale-105">
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
          <h1 className="text-center text-2xl font-semibold">
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
              render={({ data }) => (
                <table>
                  <tbody>
                    {data.map((hit, i) => (
                      <HitMission key={i} hit={hit} onSend={() => handleProposal(hit)} />
                    ))}
                  </tbody>
                </table>
              )}
            />
          )}
        </ReactiveBase>
      </div>
    </>
  );
}

const HitMission = ({ hit, onSend }) => {
  const [sending, setSending] = useState(false);
  let mounted = useRef(false);
  useEffect(() => {
    mounted && setSending(false);
    return () => (mounted = false);
  }, [hit]);
  return (
    <tr>
      <td>
        <div to={`/mission/${hit._id}`}>
          <div>
            <h2>{hit.name}</h2>
            <p>
              {hit.structureName} {`• ${hit.city} (${hit.department})`}
            </p>
          </div>
        </div>
      </td>
      <td>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDateTimezoneUTC(hit.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDateTimezoneUTC(hit.endAt)}
        </div>
      </td>
      <td>
        {hit.placesTotal <= 1 ? `${hit.placesTotal} place` : `${hit.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {hit.placesTaken} / {hit.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <Loadingbutton
          onClick={() => {
            plausibleEvent("Volontaires/profil/phase2 CTA - Proposer mission existante");
            setSending(true);
            onSend();
          }}
          loading={sending}>
          Proposer cette mission
        </Loadingbutton>
      </td>
    </tr>
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
