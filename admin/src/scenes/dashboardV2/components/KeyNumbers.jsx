import React, { useState, useEffect } from "react";
import Inscription from "./ui/icons/Inscription";
import CustomFilter from "../moderator-ref/subscenes/general/components/CustomFilter";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { capture } from "../../../sentry";
import API from "../../../services/api";
import Sejour from "./ui/icons/Sejour";
import Engagement from "./ui/icons/Engagement";
import { toastr } from "react-redux-toastr";
import { ROLES } from "snu-lib";

export default function KeyNumbers({ role }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [phase, setPhase] = useState("all");
  const [notes, setNotes] = useState(null);

  useEffect(() => {
    if (role === ROLES.HEAD_CENTER) setPhase("sejour");
  }, []);

  async function fetchData() {
    try {
      const res = await API.post("/elasticsearch/dashboard/general/key-numbers", { startDate, endDate, phase });
      if (!res.ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des chiffres clés", res.error);
      }
      setNotes(res.data);
    } catch (e) {
      capture(e);
    }
  }

  React.useEffect(() => {
    if (startDate && endDate) fetchData();
  }, [startDate, endDate, phase]);

  return (
    <div className={`flex w-[30%] flex-col rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] ${!open ? "h-[584px]" : "h-fit"}`}>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold leading-5 text-gray-900">Chiffres clés</div>
          <div className=" text-medium rounded-full bg-blue-50 px-2.5 py-0.5 text-sm leading-none text-blue-600">{notes?.length || 0}</div>
        </div>
        <CustomFilter setFromDate={setStartDate} setToDate={setEndDate} notesPhase={phase} setNotesPhase={setPhase} role={role} />
      </div>
      {!notes?.length ? (
        <div className={`flex flex-col my-auto gap-4 rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] h-[584px]"}`}>
          <div className="text-slate-300 py-8 m-auto text-center animate-pulse text-xl">Chargement des chiffres clés</div>
        </div>
      ) : (
        <div className="overflow-hidden">
          {notes?.map((note) => (
            <Note key={note.id} note={note} />
          ))}
        </div>
      )}
      {notes?.length > 7 && (
        <div className="mt-auto p-2 flex justify-center">
          <button className="flex items-center gap-1 text-sm text-blue-600" onClick={() => setOpen(!open)}>
            <span>{open ? "Voir moins" : "Voir plus"}</span>
            {open ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
          </button>
        </div>
      )}
    </div>
  );
}

function Note({ note }) {
  const icons = {
    action: <Engagement />,
    where: <Sejour />,
    other: <Inscription />,
  };

  return (
    <div className="flex items-center gap-4 border-t-[1px] border-gray-200 py-3">
      <div className="flex flex-none h-8 w-8 items-center justify-center rounded-lg bg-gray-100">{icons[note.icon]}</div>
      <p className="text-sm text-gray-900">
        {note.value} {note.label}
      </p>
    </div>
  );
}
