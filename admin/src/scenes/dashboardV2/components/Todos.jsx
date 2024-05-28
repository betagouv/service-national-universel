import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiChevronDown, HiChevronRight, HiChevronUp } from "react-icons/hi";

import { ROLES } from "snu-lib";
import { BadgeNotif } from "@snu/ds/admin";

import api from "@/services/api";

import getNoteData from "./todos.constants";
import Engagement from "./ui/icons/Engagement";
import Inscription from "./ui/icons/Inscription";
import Sejour from "./ui/icons/Sejour";

// Adding Todos to a user role dashboard
// 1. Import <Todos /> in the dashboard/general component
// 2. Create a new key in DASHBOARD_TODOS_FUNCTIONS in snu-lib
// 3. Create the request in the backend (see api/src/services/dashboard/todo-*.service.js)
// 4. Assign the request to every role necessary in the backend (see api/src/services/dashboard/todo.service.js)
// 5. Add a new entry in getNoteData() (see ./todos.constants.js)
// 6. Verify the columns to assign per role (see below line ~67)

export default function Todos({ user }) {
  const [fullNote, setFullNote] = useState(false);
  const [stats, setStats] = useState({});
  const cohorts = useSelector((state) => state.Cohorts);
  const cohortsNotFinished = cohorts.filter((c) => new Date(c.dateEnd) > Date.now())?.map((e) => e.name);
  const sessionPhase1 = useSelector((state) => state.Auth.sessionPhase1);
  const sessionId = sessionPhase1?._id;
  const centerId = sessionPhase1?.cohesionCenterId;

  const updateStats = async () => {
    const response = await api.post("/elasticsearch/dashboard/general/todo");
    const filteredStats = {};
    if (response.data) {
      // Remove empty values
      Object.entries(response.data).forEach(([key, value]) => {
        const filteredValue = {};
        Object.entries(value).forEach(([subKey, item]) => {
          if (item !== 0 && (!Array.isArray(item) || item.length > 0)) {
            filteredValue[subKey] = item;
          }
        });
        filteredStats[key] = filteredValue;
      });
    }

    setStats(filteredStats);
  };

  useEffect(() => {
    updateStats();
  }, []);

  function shouldShow(parent, key, index = null) {
    if (fullNote) return true;
    const entries = Object.entries(parent);
    for (let i = 0, limit = 0; i < entries.length && limit < 3; i++) {
      if (Array.isArray(entries[i][1])) {
        for (let j = 0; j < entries[i][1].length && limit < 3; j++) {
          if (entries[i][0] === key && index === j) return true;
          limit++;
        }
      } else {
        if (entries[i][0] === key) return true;
        limit++;
      }
    }
    return false;
  }

  function total(parent) {
    if (!parent) return 0;
    const entries = Object.entries(parent);
    let limit = 0;
    for (let i = 0; i < entries.length; i++) {
      if (Array.isArray(entries[i][1])) {
        for (let j = 0; j < entries[i][1].length; j++) limit++;
      } else limit++;
    }
    return limit;
  }

  if (Object.entries(stats || {}).length === 0)
    return (
      <div
        className={`flex ${
          user.role !== ROLES.HEAD_CENTER ? "w-[70%]" : "w-full"
        } flex-col gap-4 rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] h-[584px]"}`}>
        <div className="text-slate-300 py-8 m-auto text-center animate-pulse text-xl">Chargement des actualités</div>
      </div>
    );

  const totalInscription = total(stats.inscription);
  const totalSejour = total(stats.sejour);
  const totalEngagement = total(stats.engagement);

  // Multi column pattern
  const columnInscription = { icon: <Inscription />, title: "Inscriptions", total: totalInscription, data: stats.inscription };
  const columnSejour = { icon: <Sejour />, title: "Séjours", total: totalSejour, data: stats.sejour };
  const columnEngagement = { icon: <Engagement />, title: "Engagement", total: totalEngagement, data: stats.engagement };

  // Single column pattern
  const columnTodo1 = { title: "À faire", total: totalInscription + totalSejour + totalEngagement, data: {} };
  const columnTodo2 = { data: {} };
  const columnTodo3 = { data: {} };

  let shouldShowMore = false;

  const columns = [];

  switch (user.role) {
    case ROLES.HEAD_CENTER:
      Object.entries({ ...columnInscription.data, ...columnSejour.data }).forEach(([key, value], index) => {
        if (index % 3 === 0) columnTodo1.data[key] = value;
        if (index % 3 === 1) columnTodo2.data[key] = value;
        if (index % 3 === 2) columnTodo3.data[key] = value;
      });
      columns.push(columnTodo1, { ...columnTodo2, total: total(columnTodo1.data) }, { ...columnTodo3, total: total(columnTodo1.data) });
      shouldShowMore = totalInscription + totalSejour + totalEngagement > 9;
      break;
    case ROLES.SUPERVISOR:
    case ROLES.RESPONSIBLE:
      Object.entries({ ...columnEngagement.data }).forEach(([key, value], index) => {
        if (index % 3 === 0) columnTodo1.data[key] = value;
        if (index % 3 === 1) columnTodo2.data[key] = value;
        if (index % 3 === 2) columnTodo3.data[key] = value;
      });
      columns.push(columnTodo1, { ...columnTodo2, total: total(columnTodo1.data) }, { ...columnTodo3, total: total(columnTodo1.data) });
      break;
    default:
      columns.push(columnInscription, columnSejour, columnEngagement);
      shouldShowMore = totalInscription > 3 || totalSejour > 3 || totalEngagement > 3;
      break;
  }

  if (columns.every((item) => item.total === 0)) return <NotePlaceholder />;

  return (
    <div
      className={`flex ${user.role !== ROLES.HEAD_CENTER ? "w-[70%]" : "w-full"} flex-col gap-4 rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] ${
        !fullNote ? "h-[584px]" : "h-fit"
      }`}>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {column.icon}
              {column.title ? (
                <>
                  <div className="text-sm font-bold leading-5 text-gray-900">{column.title}</div>
                  <BadgeNotif count={column.total} />
                </>
              ) : (
                <div className="text-sm font-bold leading-5 text-gray-900">&nbsp;</div>
              )}
            </div>
            {!column.total ? (
              <NotePlaceholder />
            ) : (
              Object.keys(column.data || {}).map((key) => {
                // Some todo in (Inscription, Sejour, Engagement) are arrays (ex: WAITING_VALIDATION_BY_COHORT)
                // So we need to map on it
                // { count: number, cohort: string }[]
                if (Array.isArray(column.data[key])) {
                  return column.data[key].map((item, index) => {
                    if (!shouldShow(column.data, key, index)) return null;
                    const note = getNoteData(key, user);
                    if (!note) return null;
                    return (
                      <NoteContainer
                        key={key + index + item?.cohort + item?.department}
                        title={note.title}
                        number={item.count}
                        content={note.content.replace("$1", item[note.args?.[0]] ?? "").replace("$2", item[note.args?.[1]] ?? "")}
                        link={note.link
                          ?.replace("$cohortsNotFinished", cohortsNotFinished?.join("~"))
                          .replace("$1", item[note.args?.[0]] ?? "")
                          .replace("$2", item[note.args?.[1]] ?? "")
                          .replace("$centerId", centerId ?? "")
                          .replace("$sessionId", sessionId ?? "")}
                        btnLabel={note.btnLabel}
                      />
                    );
                  });
                }
                // Other todo are not arrays so we can display the number directly
                if (!shouldShow(column.data, key)) return null;
                const note = getNoteData(key, user);
                if (!note) return null;
                return (
                  <NoteContainer
                    key={key}
                    title={note.title}
                    number={column.data[key]}
                    content={note.content}
                    link={note.link
                      ?.replace("$cohortsNotFinished", cohortsNotFinished?.join("~"))
                      .replace("$centerId", centerId ?? "")
                      .replace("$sessionId", sessionId ?? "")}
                    btnLabel={note.btnLabel}
                  />
                );
              })
            )}
          </div>
        ))}
      </div>
      {shouldShowMore && (
        <div className="flex justify-center">
          <button className="flex items-center gap-1 text-sm text-blue-600" onClick={() => setFullNote(!fullNote)}>
            <span>{fullNote ? "Voir moins" : "Voir plus"}</span>
            {fullNote ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
          </button>
        </div>
      )}
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

const NoteContainer = ({ title, number, content, btnLabel, link }) => {
  return (
    <div className="flex h-36 w-full flex-col justify-between rounded-lg bg-blue-50 py-3.5 px-3">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold leading-5 text-gray-900">{title}</span>
        <p className="text-xs font-normal leading-4 text-gray-900">
          <span className="font-bold text-blue-600">{Number(number) >= 1000 ? "1000+" : number} </span>
          {content}
        </p>
      </div>
      {link && (
        <div className="flex justify-end">
          <Link className="flex items-center gap-2 rounded-full bg-blue-600 py-1 pr-2 pl-3 text-xs font-medium text-white" to={link}>
            <span>{btnLabel}</span>
            <HiChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
