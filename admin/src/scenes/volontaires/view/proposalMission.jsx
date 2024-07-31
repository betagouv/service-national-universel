import React, { useCallback, useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { canApplyToPhase2 } from "snu-lib";
import { ResultTable } from "../../../components/filters-system-v2";
import { buildQuery } from "../../../components/filters-system-v2/components/filters/utils";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { debounce } from "../../../utils";
import { APPLICATION_STATUS, SENDINBLUE_TEMPLATES } from "snu-lib";
import YoungHeader from "../../phase0/components/YoungHeader";
import CardMission from "../components/CardMission";
import { useSelector } from "react-redux";

export default function ProposeMission({ young, onSend }) {
  const cohortList = useSelector((state) => state.Cohorts);
  const [missionIds, setMissionIds] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({ page: 0 });
  const [data, setData] = useState([]);
  const [size, setSize] = useState(10);

  const cohort = cohortList.find((c) => c.name === young.cohort);

  useEffect(() => {
    getApplications().then((applications) => {
      setMissionIds(applications.map((a) => a.missionId));
    });
    updateOnParamChange(selectedFilters, paramData);
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/young/${young._id}/application`);
    if (!ok) {
      capture(new Error(code));
      return toastr.error("Oups, une erreur est survenue", code);
    }
    return data;
  };

  const updateOnParamChange = useCallback(
    debounce(async (selectedFilters, paramData) => {
      buildQuery("/elasticsearch/mission/propose/search", selectedFilters, paramData?.page, [], paramData?.sort).then((res) => {
        if (!res) return;
        const newParamData = {
          count: res.count,
        };
        if (paramData.count !== res.count) newParamData.page = 0;
        setParamData((paramData) => ({ ...paramData, ...newParamData }));
        setData(res.data);
      });
    }, 250),
    [],
  );

  useEffect(() => {
    updateOnParamChange(selectedFilters, paramData);
  }, [selectedFilters, paramData.page]);

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
      <div className="m-8 items-center space-y-8 rounded-xl bg-white p-8 shadow-sm">
        <div className="grid grid-cols-9 border-b pb-8">
          <div className="h-9 w-9 cursor-pointer rounded-full bg-gray-200 p-2 hover:scale-105">
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
          <h1 className="col-span-7 text-center text-2xl font-semibold">
            Proposer une mission à {young.firstName} {young.lastName}
          </h1>
        </div>
        {canApplyToPhase2(young, cohort) ? (
          <>
            <div className="h-[38px] w-1/3 mx-auto overflow-hidden rounded-md border-[1px] border-gray-300 px-2.5">
              <input
                name={"searchbar"}
                placeholder="Rechercher une mission par mots clés..."
                value={selectedFilters?.searchbar?.filter[0] || ""}
                onChange={(e) => {
                  setSelectedFilters({ ...selectedFilters, [e.target.name]: { filter: [e.target.value] } });
                }}
                className={`h-full w-full text-xs text-gray-600`}
              />
            </div>
            <ResultTable
              paramData={paramData}
              setParamData={setParamData}
              currentEntryOnPage={data?.length}
              size={size}
              setSize={setSize}
              render={data.map((hit, i) => (
                <CardMission key={i} mission={hit} onSend={() => handleProposal(hit)} sent={missionIds.includes(hit._id)} />
              ))}
            />
          </>
        ) : (
          <p className="text-center ">Ce volontaire n&apos;est pas éligible à la phase 2.</p>
        )}
      </div>
    </>
  );
}
