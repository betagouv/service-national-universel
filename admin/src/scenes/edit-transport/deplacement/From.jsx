import React, { useEffect, useState } from "react";
import { capture } from "../../../sentry";

import Select from "./components/Select";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import SelectInput from "./components/SelectInput";
import { MdMan } from "react-icons/md";
import YoungLine from "./YoungLine";

const From = ({ allLines, isDirty, selectedMeetingPoint, setSelectedMeetingPoint, selectedLigne, setSelectedLigne, checkedYoungs, setCheckedYoungs, cohort }) => {
  const [meetingPointsOptions, setMeetingPointsOptions] = useState([]);
  const [meetingPoints, setMeetingPoints] = useState([]);
  const urlParams = new URLSearchParams(window.location.search);
  const [youngsFilter, setYoungsFilter] = useState([]);
  const [youngs, setYoungs] = useState([]);

  useEffect(() => {
    setYoungsFilter(
      youngs.filter((e) => {
        return e.meetingPointId === selectedMeetingPoint?._id.toString();
      }),
    );
  }, [youngs]);

  React.useEffect(() => {
    if (!selectedMeetingPoint) return setYoungs([]);
    if (!selectedLigne) return setYoungs([]);
    if (!cohort) return setYoungs([]);
    (async () => {
      try {
        const response = await api.post(`/elasticsearch/young/search`, {
          filters: { cohort: [cohort], ligneId: [selectedLigne?._id.toString()], meetingPointId: [selectedMeetingPoint._id.toString()] },
        });
        setYoungs(response.responses[0]?.hits?.hits?.map((e) => ({ ...e._source, _id: e._id })) || []);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [cohort, selectedMeetingPoint, selectedLigne]);

  React.useEffect(() => {
    try {
      if (!selectedLigne) {
        setSelectedMeetingPoint(null);
        setMeetingPointsOptions([]);
        return;
      }
      const getAvailablePDR = async () => {
        const { data, ok, code } = await api.post(`/edit-transport/meetingPoints`, selectedLigne.meetingPointsIds);
        if (!ok) return toastr.error("error", code);
        setMeetingPointsOptions(data.map((e) => ({ label: e.name, value: e })));
        setMeetingPoints(data);
        if (urlParams.get("pdr_from_id")) {
          const pdr = data.find((e) => e._id === urlParams.get("pdr_from_id"));
          if (pdr) {
            setSelectedMeetingPoint(pdr);
          }
        }
      };
      getAvailablePDR();
    } catch (e) {
      capture(e);
    }
  }, [selectedLigne]);

  return (
    <div className={`flex flex-col w-full h-full items-start ml-3 `}>
      <div className="text-md mb-2 w-full">
        <>
          <p>
            From:
            <span className="text-gray-400 ml-2">{`${meetingPoints.length ? meetingPoints?.[0]?.region : ""}`}</span>
          </p>
          <p>
            To:
            <span className="text-gray-400 ml-2">{`${selectedLigne ? selectedLigne?.region : ""}`}</span>
          </p>
        </>
      </div>
      <div className="text-gray-400">Ligne :</div>
      <div className="flex w-full">
        <SelectInput
          value={selectedLigne?.busId}
          disabled={isDirty}
          options={allLines.map((e) => {
            return { label: e.busId, value: e };
          })}
          onChange={(value) => {
            setSelectedLigne(value);
            setSelectedMeetingPoint(null);
          }}
          placeholder="Choisir une ligne de transport"
          renderOption={(option) => {
            //todo calculate capacity
            const numOfYoung = youngs.filter((e) => {
              return e.ligneId === option.value._id && e.sessionPhase1Id === option.value.sessionId;
            }).length;
            const total = allLines.find((e) => e._id === option.value._id).youngCapacity;
            return (
              <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                <div className="w-3/4" dangerouslySetInnerHTML={{ __html: option.label }} />
                <div className="flex w-1/4 justify-between items-center">
                  <p className="text-gray-400 text-xs">{`${numOfYoung} / ${total}`}</p>
                  <MdMan color={numOfYoung > total ? "#e6000c" : "#00e667"} />
                </div>
              </div>
            );
          }}
        />
      </div>
      <div className="flex flex-col my-3 w-full">
        <div className="text-gray-400">Point de rassemblement :</div>
        <Select
          disabled={isDirty || !selectedLigne}
          options={meetingPointsOptions}
          value={selectedMeetingPoint}
          onChange={(value) => {
            setSelectedMeetingPoint(value);
            setCheckedYoungs([]);
          }}
          placeholder="Choisir un point de rassemblement"
          renderOption={(option) => {
            const numOfYoung = youngs.filter((e) => {
              return e.meetingPointId === option.value._id && e.sessionPhase1Id === selectedLigne.sessionId;
            }).length;
            const total = selectedLigne?.youngCapacity || 0;
            return (
              <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                <div className="w-3/4" dangerouslySetInnerHTML={{ __html: option.label }} />
                <div className="flex w-1/4 justify-between items-center">
                  <p className="text-gray-400 text-xs">{`${numOfYoung} / ${total}`}</p>
                  <MdMan color={numOfYoung > total ? "#e6000c" : "#00e667"} />
                </div>
              </div>
            );
          }}
        />
      </div>
      <div className={`flex flex-col overflow-y-scroll justify-start items-center bg-white rounded shadow-xl w-full max-h-full mt-1 p-3`}>
        <div className="flex w-full gap-3 items-center border-b mb-2 px-1 py-2 bg-white">
          {!isDirty ? (
            <input
              className="accent-snu-purple-800"
              type="checkbox"
              checked={youngsFilter.length > 0 && youngsFilter.every((young) => checkedYoungs.find((e) => e._id === young._id))}
              onChange={() => {
                if (checkedYoungs?.length > 0) setCheckedYoungs([]);
                else setCheckedYoungs(youngsFilter);
              }}
            />
          ) : (
            <></>
          )}
          <p className="text-xs text-gray-400">
            {isDirty ? `${checkedYoungs?.length} volontaire(s) déplacé(s) ` : `${checkedYoungs?.length}/${youngsFilter.length} volontaire(s) sélectioné(s)`}
          </p>
        </div>
        <YoungLine youngs={youngsFilter} checkedYoungs={checkedYoungs} setCheckedYoungs={setCheckedYoungs} />
      </div>
    </div>
  );
};

export default From;
