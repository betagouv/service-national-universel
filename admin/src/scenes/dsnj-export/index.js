import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import * as FileSaver from "file-saver";
import { ROLES, sessions2023, translate } from "snu-lib";

import { Title } from "../plan-transport/components/commons";
import Select from "../plan-transport/components/Select";
import api from "../../services/api";

import ExportBox from "./components/ExportBox";
import { useSelector } from "react-redux";

const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "numeric" });

const exportDateKeys = ["cohesionCenters", "youngsBeforeSession", "youngsAfterSession"];

const sessionOptions = sessions2023.map(({ id, dateStart, dateEnd }) => {
  return {
    label: `Séjour <b>${dateTimeFormat.formatRange(dateStart, dateEnd)}</b>`,
    value: id,
  };
});

const DSNJExport = () => {
  const [sessionId, setSessionId] = useState(sessionOptions[0].value);
  const [sessions, setSessions] = useState([]);
  const [isLDownloadingByKey, setDownloadingByKey] = useState({});
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    getSessions();
  }, []);

  const getSessions = async () => {
    const { data: sessionsWithExportDates, ok } = await api.get("/session");
    if (!ok) return toastr.error("Impossible de récupérer la date des exports", "");
    const sessionList = sessions2023.map(({ id, dateEnd }) => {
      let dsnjExportDates = {};
      const sessionWithExportDates = sessionsWithExportDates.find((current) => id === current.id);
      if (sessionWithExportDates) {
        dsnjExportDates = sessionWithExportDates.dsnjExportDates || {};
      }

      // export available until 1 month after the session
      dateEnd.setMonth(dateEnd.getMonth() + 1);

      return {
        id,
        dsnjExportDates,
        exportsAvailableUntil: dateEnd,
      };
    });
    setSessions(sessionList);
  };

  const updateExportDate = (key) => async (date) => {
    console.log({ key, date });
    const { ok, code, data: updatedSession } = await api.put(`/session/${sessionId}/export/${key}`, { date });
    if (!ok) return toastr.error("Une erreur est survenue lors de l'enregistrement de la date d'export", translate(code));
    const updatedSessions = sessions.map((currentSession) => {
      if (currentSession.id === updatedSession.id) {
        return { ...currentSession, dsnjExportDates: updatedSession.dsnjExportDates };
      }
      return currentSession;
    });
    setSessions(updatedSessions);
  };

  const download = (key) => async () => {
    try {
      setDownloadingByKey({ ...isLDownloadingByKey, [key]: true });
      const file = await api.get(`/session/${sessionId}/export/${key}`);
      FileSaver.saveAs(new Blob([new Uint8Array(file.data.data)], { type: file.mimeType }), file.fileName);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant le téléchagement", "");
    } finally {
      setDownloadingByKey({ ...isLDownloadingByKey, [key]: false });
    }
  };

  const session = sessions.find((current) => current.id === sessionId);

  return (
    <>
      <div className="flex flex-col w-full p-8 ">
        <div className="py-8 flex items-center justify-between">
          <Title>Données sur les centres et les volontaires (accès DSNJ)</Title>
          <Select options={sessionOptions} value={sessionId} onChange={setSessionId} />
        </div>
        <div className="flex gap-4">
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des centres"
            availableFrom={session?.dsnjExportDates[exportDateKeys[0]] ? new Date(session?.dsnjExportDates[exportDateKeys[0]]) : undefined}
            availableUntil={session?.exportsAvailableUntil}
            onChangeDate={updateExportDate(exportDateKeys[0])}
            onDownload={download(exportDateKeys[0])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[0]]}
          />
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des volontaires affectés et sur liste complémentaire"
            availableFrom={session?.dsnjExportDates[exportDateKeys[1]] ? new Date(session?.dsnjExportDates[exportDateKeys[1]]) : undefined}
            availableUntil={session?.exportsAvailableUntil}
            onChangeDate={updateExportDate(exportDateKeys[1])}
            onDownload={download(exportDateKeys[1])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[1]]}
          />
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des volontaires après le séjour"
            availableFrom={session?.dsnjExportDates[exportDateKeys[2]] ? new Date(session?.dsnjExportDates[exportDateKeys[2]]) : undefined}
            availableUntil={session?.exportsAvailableUntil}
            onChangeDate={updateExportDate(exportDateKeys[2])}
            onDownload={download(exportDateKeys[2])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[2]]}
          />
        </div>
      </div>
    </>
  );
};

export default DSNJExport;
