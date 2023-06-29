import React, { useState } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { HiX, HiCheck } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale("fr", fr);

import { capture } from "../../../sentry";
import api from "../../../services/api";
import SelectTable from "./components/SelectTable";
import TooltipCapacity from "./components/TooltipCapacity";
import TooltipCenter from "./components/TooltipCenter";
import { IoCaretDown, IoCaretForward, IoOpenOutline } from "react-icons/io5";
import PointDeRassemblement from "./components/PointDeRassemblement";
import LignesToPoint from "./Lignes-to-Point";
import { useHistory } from "react-router-dom";

export default function LigneDeBus({ hit, cohort }) {
  const [tempLine, setTempLine] = useState(hit);
  const [isDirty, setIsDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const [dirtyMeetingPointIds, setDirtyMeetingPointIds] = useState([]);
  const history = useHistory();

  const handleOpen = () => {
    if (dirtyMeetingPointIds.length > 0) return toastr.warning(`${dirtyMeetingPointIds.length} PDR non enregistré(s).\nEnregistrez ou Annulez avant de refermer la ligne.`);
    setOpen((o) => !o);
  };

  const handleChange = ({ path, value }) => {
    setIsDirty(true);
    setTempLine((prev) => ({ ...prev, [path]: value }));
  };

  const cancel = () => {
    setTempLine(hit);
    setIsDirty(false);
  };

  const save = async (data) => {
    toastr.info("Sauvegarde en cours...");
    try {
      const promises = [
        api.put(`/ligne-de-bus/${hit._id}/info`, {
          busId: data.busId,
          departuredDate: data.departuredDate,
          returnDate: data.returnDate,
          youngCapacity: data.youngCapacity,
          followerCapacity: data.followerCapacity,
          totalCapacity: data.totalCapacity,
          travelTime: data.travelTime,
          lunchBreak: data.lunchBreak,
          lunchBreakReturn: data.lunchBreakReturn,
        }),
        api.put(`/ligne-de-bus/${hit._id}/centre`, {
          centerDepartureTime: data.centerDepartureTime,
          centerArrivalTime: data.centerArrivalTime,
        }),
      ];
      const responses = await Promise.all(promises);

      if (responses.every((response) => response.ok)) {
        setIsDirty(false);
        // TODO : make it cleaner
        setTempLine({ ...responses[0].data, centerDepartureTime: responses[1].data?.centerDepartureTime, centerArrivalTime: responses[1].data?.centerArrivalTime });
        toastr.success("La ligne a été modifiée.");
      } else toastr.error(`Oups, une erreur est survenue lors de la modification de la ligne ${hit.name}.`);
    } catch (e) {
      capture(e);
      toastr.error(`Oups, une erreur est survenue lors de la modification de la ligne ${hit.name}.`);
    }
  };

  const addLigneToPoint = async ({ ligneDeBus, meetingPoint }) => {
    try {
      const response = await api.post(`/ligne-de-bus/${ligneDeBus._id}/point-de-rassemblement/${meetingPoint._id}`);
      if (response.ok) {
        setTempLine(response.data.ligne);
        toastr.success("Le point de rencontre a été ajouté à la ligne.");
        
      } else toastr.error("Oups, une erreur est survenue lors de l'ajout du point de rencontre à la ligne.");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout du point de rencontre à la ligne.");
    }
  };

  return (
    <>
      <tr
        className={`[&>td]:h-10 [&>td]:p-1 divide-x divide-y divide-gray-300 even:bg-gray-100 odd:bg-white cursor-pointer  ${open ? "bg-gray-200" : ""} ${
          isDirty ? "!bg-snu-purple-100" : "hover:bg-blue-50"
        }`}
        onClick={handleOpen}>
        <td className="px-1">
          <div className="px-3">{open ? <IoCaretDown /> : <IoCaretForward />}</div>
        </td>
        <td>
          <div className="h-full flex items-center gap-1">
            <div className="w-full h-full text-sm font-medium flex items-center gap-1">
              <input
                className="h-full bg-transparent"
                type="text"
                placeholder="Ligne de bus"
                value={tempLine.busId}
                onClick={(e) => e.stopPropagation()}
                onChange={(event) => {
                  handleChange({ path: "busId", value: event.target.value });
                }}
              />
              <a className="group text-sm font-medium " href={`/ligne-de-bus/${hit._id.toString()}`} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer">
                <IoOpenOutline className="text-gray-500 group-hover:text-blue-600" />
              </a>
            </div>
          </div>
        </td>
        <td>
          <div className="flex flex-col flex-1 text-center opacity-75">{tempLine.meetingPointsIds.length}</div>
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <DatePicker
            locale="fr"
            selected={new Date(tempLine.departuredDate)}
            onChange={(value) => {
              handleChange({ path: "departuredDate", value });
            }}
            placeholderText={"jj/mm/aaaa"}
            className="w-full h-full bg-[transparent]"
            dateFormat="dd/MM/yyyy"
          />
        </td>
        <td>
          <div className="text-sm flex-1 whitespace-nowrap opacity-75">{hit.lignesToPoint[0]?.meetingPoint?.department}</div>
        </td>
        <td>
          <div className="text-sm flex-1 whitespace-nowrap opacity-75">{hit.center.department}</div>
        </td>
        <td>
          <div className="h-full">
            <input
              placeholder="hh:mm"
              className={`w-full h-full ${!/^\d{2}:\d{2}$/.test(tempLine.centerArrivalTime) ? "bg-red-100" : "bg-transparent"}`}
              type="text"
              value={tempLine.centerArrivalTime}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => handleChange({ path: "centerArrivalTime", value: event.target.value })}
            />
            {!/^\d{2}:\d{2}$/.test(tempLine.centerArrivalTime) ? <div className="text-red-600 text-xs">format incorrect: hh:mm</div> : null}
          </div>
        </td>
        <td className="px-1">
          <div className="flex-1">
            <div className="flex gap-2">
              <TooltipCenter key={hit.center._id} name={hit.center.name} region={hit.center.region} department={hit.center.department}>
                <div className="flex items-center justify-center gap-2 px-2 py-1 text-sm font-normal">
                  {hit.center.code2022 || hit.center.name}
                  <a className="group text-sm font-medium " href={`/centre/${hit.center._id.toString()}`} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer">
                    <IoOpenOutline className="text-gray-500 group-hover:text-blue-600" />
                  </a>
                </div>
              </TooltipCenter>
            </div>
          </div>
        </td>
        <td className="px-1" onClick={(e) => e.stopPropagation()}>
          <DatePicker
            locale="fr"
            selected={new Date(tempLine.returnDate)}
            onChange={(value) => {
              handleChange({ path: "returnDate", value });
            }}
            placeholderText={"jj/mm/aaaa"}
            className="w-full bg-[transparent]"
            dateFormat="dd/MM/yyyy"
          />
        </td>
        <td>
          <div className="h-full">
            <input
              placeholder="hh:mm"
              className={`w-full h-full ${!/^\d{2}:\d{2}$/.test(tempLine.centerDepartureTime) ? "bg-red-100" : "bg-transparent"}`}
              type="text"
              value={tempLine.centerDepartureTime}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => handleChange({ path: "centerDepartureTime", value: event.target.value })}
            />
            {!/^\d{2}:\d{2}$/.test(tempLine.centerDepartureTime) ? <div className="text-red-600 text-xs">format incorrect: hh:mm</div> : null}
          </div>
        </td>
        <td>
          <div className="h-full w-full">
            <TooltipCapacity youngCapacity={hit.youngCapacity} youngSeatsTaken={hit.youngSeatsTaken} followerCapacity={hit.followerCapacity}>
              <div className="opacity-75">{hit.youngSeatsTaken}</div>
            </TooltipCapacity>
          </div>
        </td>
        <td>
          <input
            className="h-full bg-transparent"
            type="number"
            placeholder="Cap. volontaire"
            value={tempLine.youngCapacity}
            onClick={(e) => e.stopPropagation()}
            onChange={(event) => {
              handleChange({ path: "youngCapacity", value: event.target.value });
            }}
          />
        </td>
        <td>
          <input
            className="h-full bg-transparent"
            type="number"
            placeholder="Cap. acc"
            value={tempLine.followerCapacity}
            onClick={(e) => e.stopPropagation()}
            onChange={(event) => {
              handleChange({ path: "followerCapacity", value: event.target.value });
            }}
          />
        </td>
        <td>
          <input
            className="h-full bg-transparent"
            type="number"
            placeholder="Cap. acc"
            value={tempLine.totalCapacity}
            onClick={(e) => e.stopPropagation()}
            onChange={(event) => {
              handleChange({ path: "totalCapacity", value: event.target.value });
            }}
          />
        </td>
        <td>
          <input
            className="h-full bg-transparent"
            type="text"
            placeholder="Temps de route"
            value={tempLine.travelTime}
            onClick={(e) => e.stopPropagation()}
            onChange={(event) => {
              handleChange({ path: "travelTime", value: event.target.value });
            }}
          />
        </td>
        <td>
          <SelectTable
            options={[
              { label: "Oui", value: true },
              { label: "Non", value: false },
            ]}
            value={tempLine.lunchBreak}
            onClick={(e) => e.stopPropagation()}
            onChange={(value) => {
              handleChange({ path: "lunchBreak", value });
            }}
          />
        </td>
        <td>
          <SelectTable
            options={[
              { label: "Oui", value: true },
              { label: "Non", value: false },
            ]}
            value={tempLine.lunchBreakReturn}
            onClick={(e) => e.stopPropagation()}
            onChange={(value) => {
              handleChange({ path: "lunchBreakReturn", value });
            }}
          />
        </td>
      </tr>
      {isDirty ? (
        <tr>
          <td colSpan="17" className="border-[2px] border-gray-200">
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
                      save(tempLine);
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
      {open ? (
        tempLine.meetingPointsIds.length ? (
          <tr>
            <td colSpan="17" className="border-[2px] border-gray-200">
              <table className="w-full table-fixed">
                <thead className="w-full py-3 px-4 text-xs uppercase text-gray-400">
                  <tr className="border-b-[1px] border-gray-300 divide-x divide-gray-300 w-full text-xs uppercase text-gray-400 ">
                    <th className="w-[54px]"></th>
                    <th className="px-1 py-3 whitespace-nowrap font-normal">
                      <span className="ml-6">Nom</span>
                    </th>
                    <th className="px-1 py-3 whitespace-nowrap font-normal">Volontaires</th>
                    <th className="px-1 py-3 whitespace-nowrap font-normal">Type de transport</th>
                    <th className="px-1 py-3 whitespace-nowrap font-normal">
                      <BsArrowRight className="text-blue-700" />
                      Heure de convocation
                    </th>
                    <th className="px-1 py-3 whitespace-nowrap font-normal">
                      <BsArrowRight className="text-blue-700" />
                      Heure d’arrivée du transport
                    </th>
                    <th className="px-1 py-3 whitespace-nowrap font-normal">
                      <BsArrowRight className="text-blue-700" />
                      Heure de depart
                    </th>
                    <th className="px-1 py-3 whitespace-nowrap font-normal">
                      <BsArrowLeft className="text-red-700" />
                      Heure d'arrivée
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <LignesToPoint ligne={tempLine} setDirtyMeetingPointIds={setDirtyMeetingPointIds} cohort={cohort} />
                  <tr>
                    <td />
                    <td colSpan="2">
                      <div className="w-full flex justify-between">
                        <PointDeRassemblement ligne={tempLine} onChange={(value) => addLigneToPoint({ ligneDeBus: tempLine, meetingPoint: value })} />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        ) : (
          <tr>
            <p className="flex items-center justify-center py-3 text-snu-purple-800">Aucun points de rencontres</p>
          </tr>
        )
      ) : (
        <></>
      )}
    </>
  );
}
