import React, { useState } from "react";
import { HiX, HiCheck } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import SelectTable from "./components/SelectTable";
import TooltipAddress from "./components/TooltipAddress";
import { IoLocationOutline, IoTrashBin, IoArrowRedoOutline } from "react-icons/io5";
import { environment } from "../../../config";

const transportTypeList = [
  { label: "bus", value: "bus" },
  { label: "train", value: "train" },
  { label: "avion", value: "avion" },
];

export default function LignesToPoint({ ligne, setDirtyMeetingPointIds, cohort, youngs }) {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMeetingPoints = async () => {
    try {
      if (!ligne) return;
      setLoading(true);
      const response = await api.get(`/ligne-de-bus/${ligne._id}/ligne-to-points`);
      setLoading(false);
      setValues(response.data.sort((a, b) => a.departureHour.replace(":", "") - b.departureHour.replace(":", "")));
    } catch (e) {
      setLoading(false);
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des points de rassemblement");
    }
  };

  React.useEffect(() => {
    getMeetingPoints();
    return () => setValues([]);
  }, [ligne]);

  if (loading) return <div className="text-xs text-gray-400 animate-pulse">Chargement...</div>;

  return values.map((mp) => (
    <LigneToPoint
      key={mp._id}
      meetingPoint={mp}
      ligneId={ligne._id}
      setDirtyMeetingPointIds={setDirtyMeetingPointIds}
      ligne={ligne}
      cohort={cohort}
      getMeetingPoints={getMeetingPoints}
      youngs={youngs?.filter((y) => y.meetingPointId === mp.meetingPointId)}
    />
  ));
}

const LigneToPoint = ({ meetingPoint, ligneId, setDirtyMeetingPointIds, ligne, cohort, getMeetingPoints, youngs }) => {
  const [defaultMeetingPoint, setDefaultMeetingPoint] = useState();
  const [tempMeetingPoint, setTempMeetingPoint] = useState(meetingPoint);
  const [isDirty, setIsDirty] = useState(false);

  React.useEffect(() => {
    setDefaultMeetingPoint(meetingPoint);
    setTempMeetingPoint(meetingPoint);
  }, [meetingPoint]);

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
    if (environment === "production") return toastr.error("Cette fonctionnalité est désactivée en production.");
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
        getMeetingPoints();
      } else toastr.error("Oups, une erreur est survenue lors de la modifications du points de rendez-vous.");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modifications du points de rendez-vous.");
    }
  };

  // todo: delete ligne to point
  const deleteLigneToPoint = async () => {
    if (environment === "production") return toastr.error("Cette fonctionnalité est désactivée en production.");
    try {
      if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le point de rendez-vous ?\nPDR: ${tempMeetingPoint.meetingPoint.name.replace(/PDR\s*-/, "")}\nligne: ${ligne.busId}`))
        return;
      const response = await api.remove(`/ligne-to-point/${tempMeetingPoint._id}`);
      if (response.ok) {
        toastr.success("Le point de rencontre a été ajouté à la ligne.");
      } else toastr.error("Oups, une erreur est survenue lors de l'ajout du point de rencontre à la ligne.");
      getMeetingPoints();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout du point de rencontre à la ligne.");
    }
  };

  // display young in this meeting point, for this line, for this cohort
  return (
    <>
      <tr
        className={`cursor-default [&>td]:h-10 [&>td]:p-1 divide-x border-b-[1px] border-gray-300 divide-gray-300 py-6 px-4 text-snu-purple-800 ${
          isDirty ? "bg-snu-purple-100" : "hover:bg-gray-50"
        }`}>
        <td>
          <div className="h-full flex items-center justify-center group hover:bg-red-50 cursor-pointer" onClick={() => deleteLigneToPoint()}>
            <IoTrashBin className="text-gray-300 group-hover:text-red-400" />
          </div>
        </td>
        <td>
          <div className="flex items-center gap-1">
            <a className="ml-6 cursor-pointer hover:underline" href={`/point-de-rassemblement/${tempMeetingPoint.meetingPointId.toString()}`} target="_blank" rel="noreferrer">
              {tempMeetingPoint.meetingPoint.name.replace(/PDR\s*-/, "")}
            </a>
            <TooltipAddress meetingPt={tempMeetingPoint.meetingPoint}>
              <IoLocationOutline />
            </TooltipAddress>
          </div>
        </td>
        <td>
          <div className="flex h-full w-full justify-around items-center">
            {!youngs ? (
              <div>loading...</div>
            ) : (
              <>
                <div className="flex-1">{youngs?.length}</div>
                <a
                  className="flex w-fit cursor-pointer flex-row items-center justify-center gap-2 self-end rounded border-[1px] border-gray-300 p-2 text-gray-900"
                  href={`/edit-transport/deplacement?cohort=${cohort}&pdr_from_id=${tempMeetingPoint.meetingPointId}&ligne_from_id=${ligne._id.toString()}`}
                  target="_blank"
                  rel="noreferrer">
                  <IoArrowRedoOutline className="text-blue-500" /> Déplacer
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
              className={`w-full h-full ${!/^\d{2}:\d{2}$/.test(tempMeetingPoint.meetingHour) ? "bg-red-100" : "bg-transparent"}`}
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
              className={`w-full h-full ${!/^\d{2}:\d{2}$/.test(tempMeetingPoint.busArrivalHour) ? "bg-red-100" : "bg-transparent"}`}
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
              className={`w-full h-full ${!/^\d{2}:\d{2}$/.test(tempMeetingPoint.departureHour) ? "bg-red-100" : "bg-transparent"}`}
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
              className={`w-full h-full ${!/^\d{2}:\d{2}$/.test(tempMeetingPoint.returnHour) ? "bg-red-100" : "bg-transparent"}`}
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
};
