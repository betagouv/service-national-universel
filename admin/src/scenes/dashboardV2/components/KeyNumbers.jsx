import React, { useState, useEffect } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { toastr } from "react-redux-toastr";

import { ROLES } from "snu-lib";
import { BadgeNotif } from "@snu/ds/admin";

import API from "@/services/api";
import { capture } from "@/sentry";

import Inscription from "./ui/icons/Inscription";
import CustomFilter from "./CustomFilter";
import Sejour from "./ui/icons/Sejour";
import Engagement from "./ui/icons/Engagement";

export default function KeyNumbers({ role }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [phase, setPhase] = useState("all");
  const [notes, setNotes] = useState(null);

  useEffect(() => {
    if (role === ROLES.RESPONSIBLE || role === ROLES.SUPERVISOR) setPhase("engagement");
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

  useEffect(() => {
    if (startDate && endDate) fetchData();
  }, [startDate, endDate, phase]);

  return (
    <div className={`flex w-[30%] flex-col rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] ${!open ? "h-[584px]" : "h-fit"}`}>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold leading-5 text-gray-900">Chiffres clés</div>
          <BadgeNotif count={notes?.length || 0} />
        </div>
        <CustomFilter setFromDate={setStartDate} setToDate={setEndDate} notesPhase={phase} setNotesPhase={setPhase} role={role} />
      </div>
      <div className="overflow-hidden">{notes?.length ? notes?.map((note) => <Note key={note.id} note={note} />) : <NotePlaceholder />}</div>
      {notes?.length > 6 && (
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

const NotePlaceholder = () => {
  return (
    <div className="flex h-36 w-full items-center justify-center rounded-lg bg-gray-50">
      <div className="text-sm text-center text-gray-400">Aucune notification</div>
    </div>
  );
};
