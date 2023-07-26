import React, { useState } from "react";
import Inscription from "./ui/icons/Inscription";
import CustomFilter from "../moderator-ref/subscenes/general/components/CustomFilter";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

export default function KeyNumbers() {
  const [open, setOpen] = useState(false);
  const [notesFromDate, setNotesFromDate] = useState(null);
  const [notesToDate, setNotesToDate] = useState(null);
  const [notesPhase, setNotesPhase] = useState("all");

  return (
    <div className={`flex w-[30%] flex-col rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] ${!open ? "h-[584px]" : "h-fit"}`}>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold leading-5 text-gray-900">Chiffres clés</div>
          <div className=" text-medium rounded-full bg-blue-50 px-2.5 py-0.5 text-sm leading-none text-blue-600">22</div>
        </div>
        <CustomFilter setFromDate={setNotesFromDate} setToDate={setNotesToDate} notesPhase={notesPhase} setNotesPhase={setNotesPhase} />
      </div>
      <div className="flex h-full flex-col justify-between">
        {Array.from(Array(22).keys())
          .slice(0, open ? 22 : 7)
          .map((i) => (
            <div key={`keyNumber` + i} className={`flex items-center gap-4 border-t-[1px] border-gray-200 ${open ? "py-3" : "h-full"}`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                <Inscription />
              </div>
              <div className="text-sm text-gray-900">
                3 abandons de <strong>missions</strong>
              </div>
            </div>
          ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button className="flex items-center gap-1 text-sm text-blue-600" onClick={() => setOpen(!open)}>
          <span>{open ? "Voir moins" : "Voir plus"}</span>
          {open ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
