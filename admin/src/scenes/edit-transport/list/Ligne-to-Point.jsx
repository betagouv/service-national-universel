import React, { useState } from "react";
import { HiX, HiCheck } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import SelectTable from "./components/SelectTable";
import TooltipAddress from "./components/TooltipAddress";
import { IoLocationOutline, IoTrashBin, IoArrowRedoOutline } from "react-icons/io5";

const transportTypeList = [
  { label: "bus", value: "bus" },
  { label: "train", value: "train" },
  { label: "avion", value: "avion" },
];

export default function LigneToPoint({ meetingPointId, ligneId, setDirtyMeetingPointIds, ligne, cohort }) {
  const [defaultMeetingPoint, setDefaultMeetingPoint] = useState();
  const [tempMeetingPoint, setTempMeetingPoint] = useState();
  const [isDirty, setIsDirty] = useState(false);
  const [dataForCheck, setDataForCheck] = useState([]);

  React.useEffect(() => {
    const getMeetingPoint = async () => {
      try {
        if (!meetingPointId) return;
        const { ok, data } = await api.get(`/ligne-to-point/meeting-point/${meetingPointId}`);
        if (ok) {
          setTempMeetingPoint(data);
          setDefaultMeetingPoint(data);
        } else toastr.error("Oups, une erreur est survenue lors de la recuperation du points de rendez-vous.");
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue lors de la recuperation du points de rendez-vous.");
      }
    };
    getMeetingPoint();
  }, []);

  React.useEffect(() => {
    getDataForCheck();
  }, []);

  const getDataForCheck = async () => {
    try {
      const { ok, code, data: reponseCheck } = await api.get(`/ligne-de-bus/${ligneId}/data-for-check`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du bus", translate(code));
      }
      setDataForCheck(reponseCheck);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus");
    }
  };

  if (!tempMeetingPoint) return <div className="text-xs text-gray-400 animate-pulse">Chargement...</div>;

  const handleChange = ({ path, value }) => {
    setIsDirty(true);
    setDirtyMeetingPointIds((prev) => [...new Set(prev.concat(tempMeetingPoint.meetingPointId))]);
    setTempMeetingPoint((prev) => ({ ...prev, [path]: value }));
  };

  const cancel = () => {
    setTempMeetingPoint(defaultMeetingPoint);
    setIsDirty(false);
    setDirtyMeetingPointIds((prev) => prev.filter((e) => e !== tempMeetingPoint.meetingPointId));
  };

  const save = async (data) => {
    toastr.info("Sauvegarde en cours...");
    try {
      const { ok } = await api.put(`/ligne-de-bus/${ligneId}/pointDeRassemblement`, {
        transportType: data.transportType,
        meetingHour: data.meetingHour,
        busArrivalHour: data.busArrivalHour,
        departureHour: data.departureHour,
        returnHour: data.returnHour,
        meetingPointId: data.meetingPointId,
        newMeetingPointId: data.meetingPointId,
      });
      if (ok) {
        setIsDirty(false);
        setDirtyMeetingPointIds((prev) => prev.filter((e) => e !== tempMeetingPoint.meetingPointId));
        toastr.success("Le points de rendez-vous a été modifié.");
      } else toastr.error("Oups, une erreur est survenue lors de la modifications du points de rendez-vous.");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modifications du points de rendez-vous.");
    }
  };

  // todo: delete ligne to point
  const deleteLigneToPoint = async () => {
    try {
      if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le point de rendez-vous ?\nPDR: ${tempMeetingPoint.meetingPoint.name.replace(/PDR\s*-/, "")}\nligne: ${ligne.busId}`))
        return;
      const response = await api.remove(`/ligne-de-bus/${ligne._id}/point-de-rassemblement/${tempMeetingPoint.meetingPointId}`);
      if (response.ok) {
        toastr.success("Le point de rencontre a été ajouté à la ligne.");
      } else toastr.error("Oups, une erreur est survenue lors de l'ajout du point de rencontre à la ligne.");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout du point de rencontre à la ligne.");
    }
  };

  // display young in this meeting point, for this line, for this cohort
  return (
    <>
      <tr
        className={`cursor-default [&>td]:h-10 [&>td]:p-1 divide-x border-b-[1px] border-gray-300 divide-gray-300 py-6 px-4 text-snu-purple-800 ${isDirty ? "bg-snu-purple-100" : "hover:bg-gray-50"
          }`}>
        <td>
          <div className="h-full flex items-center justify-center group hover:bg-red-50 cursor-pointer" onClick={() => deleteLigneToPoint()}>
            <IoTrashBin className="text-gray-300 group-hover:text-red-400" />
          </div>
        </td>
        <td>
          <div className="flex items-center gap-1">
            <a className="ml-6 cursor-pointer hover:underline" href={`/point-de-rassemblement/${tempMeetingPoint.meetingPointId.toString()}`}>
              {tempMeetingPoint.meetingPoint.name.replace(/PDR\s*-/, "")}
            </a>
            <TooltipAddress meetingPt={tempMeetingPoint.meetingPoint} handleChange={handleChange}>
              <IoLocationOutline />
            </TooltipAddress>
          </div>
        </td>
        <td>
          <div className="flex h-full w-full justify-around items-center">
            {!dataForCheck ? (
              <div>loading...</div>
            ) : (
              <>
                <div className="flex-1">{(dataForCheck?.meetingPoints || []).find((v) => v.meetingPointId === tempMeetingPoint.meetingPointId)?.youngsCount || 0}</div>
                <a
                  className="h-full flex flex-1 items-center gap-1 p-1 border-[1px] border-gray-100 hover:border-gray-400 hover:text-snu-purple-800"
                  href={`/edit-transport/deplacement?cohort=${cohort}&ligne_to_point_id_from=${tempMeetingPoint._id.toString()}`}
                  target="_blank"
                  rel="noreferrer">
                  <IoArrowRedoOutline /> Déplacer
                </a>
              </>
            )}
          </div>
        </td>
        <td>
          <SelectTable
            options={transportTypeList}
            value={tempMeetingPoint.transportType}
            onChange={(value) => {
              handleChange({ path: "transportType", value });
            }}
          />
        </td>
        <td>
          <div className="h-full">
            <input
              placeholder="hh:mm"
              className="h-full bg-transparent"
              type="text"
              value={tempMeetingPoint.meetingHour}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => handleChange({ path: "meetingHour", value: event.target.value })}
            />
            {!/^\d{2}:\d{2}$/.test(tempMeetingPoint.meetingHour) ? <div className="text-red-600 text-xs">format incorrect: hh:mm</div> : null}
          </div>
        </td>
        <td>
          <div className="h-full">
            <input
              placeholder="hh:mm"
              className="h-full bg-transparent"
              type="text"
              value={tempMeetingPoint.busArrivalHour}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => handleChange({ path: "busArrivalHour", value: event.target.value })}
            />
            {!/^\d{2}:\d{2}$/.test(tempMeetingPoint.busArrivalHour) ? <div className="text-red-600 text-xs">format incorrect: hh:mm</div> : null}
          </div>
        </td>
        <td>
          <div className="h-full">
            <input
              placeholder="hh:mm"
              className="h-full bg-transparent"
              type="text"
              value={tempMeetingPoint.departureHour}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => handleChange({ path: "departureHour", value: event.target.value })}
            />
            {!/^\d{2}:\d{2}$/.test(tempMeetingPoint.departureHour) ? <div className="text-red-600 text-xs">format incorrect: hh:mm</div> : null}
          </div>
        </td>
        <td>
          <div className="h-full">
            <input
              placeholder="hh:mm"
              className="h-full bg-transparent"
              type="text"
              value={tempMeetingPoint.returnHour}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => handleChange({ path: "returnHour", value: event.target.value })}
            />
            {!/^\d{2}:\d{2}$/.test(tempMeetingPoint.returnHour) ? <div className="text-red-600 text-xs">format incorrect: hh:mm</div> : null}
          </div>
        </td>
      </tr>
      {isDirty ? (
        <tr>
          <td colSpan="8" className="border-[2px] border-gray-200">
            <div className="w-full flex justify-between">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-1 p-1">
                  <button
                    className="bg-white text-gray-700 h-8 flex items-center justify-center border border-gray-700 px-2"
                    onClick={(event) => {
                      event.stopPropagation();
                      cancel();
                    }}>
                    <HiX /> Annuler
                  </button>
                  <button
                    className="bg-snu-purple-800 text-white h-8 flex items-center justify-center px-2"
                    onClick={(event) => {
                      event.stopPropagation();
                      save(tempMeetingPoint);
                    }}>
                    <HiCheck /> Enregistrer
                  </button>
                </div>
              ))}
            </div>
          </td>
        </tr>
      ) : (
        <></>
      )}
    </>
  );
}
