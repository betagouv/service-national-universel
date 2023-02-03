import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";
import ReactiveListComponent from "../../../components/ReactiveListComponent";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import { APPLICATION_STATUS, SENDINBLUE_TEMPLATES } from "../../../utils";
import { Link } from "react-router-dom";
import YoungHeader from "../../phase0/components/YoungHeader";
import { capture } from "../../../sentry";
import CardMission from "../components/CardMission";

export default function ProposeMission({ young, onSend }) {
  const FILTERS = ["SEARCH"];
  const [searchedValue, setSearchedValue] = useState("");
  const [missionIds, setMissionIds] = useState([]);

  useEffect(() => {
    getApplications().then((applications) => {
      setMissionIds(applications.map((a) => a.missionId));
    });
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/young/${young._id}/application`);
    if (!ok) {
      capture(code);
      return toastr.error("Oups, une erreur est survenue", code);
    }
    return data;
  };

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
    if (!okMail) {
      toastr.error("Oups, une erreur est survenue lors de l'envoi du mail", codeMail);
      capture(codeMail);
      return;
    }
    setMissionIds([...missionIds, mission._id]);
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
              showTopResultStats={false}
              render={({ data }) => data.map((hit, i) => <CardMission key={i} mission={hit} onSend={() => handleProposal(hit)} sent={missionIds.includes(hit._id)} />)}
              className="reactive-result"
            />
          )}
        </ReactiveBase>
      </div>
    </>
  );
}
