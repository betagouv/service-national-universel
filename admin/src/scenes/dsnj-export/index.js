import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import * as FileSaver from "file-saver";
import { ROLES, sessions2023, translate } from "snu-lib";
import dayjs from "dayjs";

import { Title } from "../plan-transport/components/commons";
import Select from "../plan-transport/components/Select";
import api from "../../services/api";

import ExportBox from "./components/ExportBox";
import { useSelector } from "react-redux";

const exportDateKeys = ["cohesionCenters", "youngsBeforeSession", "youngsAfterSession"];

const cohortOptions = sessions2023.map(({ id, dateStart, dateEnd }) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formatter = new Intl.DateTimeFormat("fr-FR", options);
  const formattedStart = formatter.format(dateStart);
  const formattedEnd = formatter.format(dateEnd);

  const formattedRange = `${formattedStart} - ${formattedEnd}`;

  return {
    label: `Séjour <b>${formattedRange}</b>`,
    value: id,
  };
});

const DSNJExport = () => {
  const [cohortId, setCohortId] = useState(cohortOptions[0].value);
  const [cohorts, setCohorts] = useState([]);
  const [isLDownloadingByKey, setDownloadingByKey] = useState({});
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    getCohorts();
  }, []);

  const getCohorts = async () => {
    const { data: cohortsWithExportDates, ok } = await api.get("/cohort");
    if (!ok) return toastr.error("Impossible de récupérer la date des exports", "");
    const cohortList = sessions2023.map(({ id, dateEnd }) => {
      let dsnjExportDates = {};
      const sessionWithExportDates = cohortsWithExportDates.find((current) => id === current.snuId);
      if (sessionWithExportDates) {
        dsnjExportDates = sessionWithExportDates.dsnjExportDates || {};
      }

      // export available until 1 month after the cohort
      const exportsAvailableUntil = new Date(dateEnd.getTime());
      exportsAvailableUntil.setMonth(exportsAvailableUntil.getMonth() + 1);

      return {
        id,
        dsnjExportDates,
        exportsAvailableUntil,
      };
    });
    setCohorts(cohortList);
  };

  const updateExportDate = (key) => async (date) => {
    const { ok, code, data: updatedCohort } = await api.put(`/cohort/${cohortId}/export/${key}`, { date: dayjs(date).locale("fr").format("YYYY-MM-DD") });
    if (!ok) return toastr.error("Une erreur est survenue lors de l'enregistrement de la date d'export", translate(code));
    const updatedCohorts = cohorts.map((currentCohort) => {
      if (currentCohort.id === updatedCohort.snuId) {
        return { ...currentCohort, dsnjExportDates: updatedCohort.dsnjExportDates };
      }
      return currentCohort;
    });
    setCohorts(updatedCohorts);
  };

  const download = (key) => async () => {
    try {
      setDownloadingByKey({ ...isLDownloadingByKey, [key]: true });
      const file = await api.get(`/cohort/${cohortId}/export/${key}`);
      FileSaver.saveAs(new Blob([new Uint8Array(file.data.data)], { type: file.mimeType }), file.fileName);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant le téléchagement", "");
    } finally {
      setDownloadingByKey({ ...isLDownloadingByKey, [key]: false });
    }
  };

  const cohort = cohorts.find((current) => current.id === cohortId);

  return (
    <>
      <div className="flex w-full flex-col p-8 ">
        <div className="flex items-center justify-between py-8">
          <Title>Données sur les centres et les volontaires (accès DSNJ)</Title>
          <Select options={cohortOptions} value={cohortId} onChange={setCohortId} />
        </div>
        <div className="flex gap-4">
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des centres"
            availableFrom={cohort?.dsnjExportDates[exportDateKeys[0]] ? new Date(cohort?.dsnjExportDates[exportDateKeys[0]]) : undefined}
            availableUntil={cohort?.exportsAvailableUntil}
            onChangeDate={updateExportDate(exportDateKeys[0])}
            onDownload={download(exportDateKeys[0])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[0]]}
          />
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des volontaires affectés et sur liste complémentaire"
            availableFrom={cohort?.dsnjExportDates[exportDateKeys[1]] ? new Date(cohort?.dsnjExportDates[exportDateKeys[1]]) : undefined}
            availableUntil={cohort?.exportsAvailableUntil}
            onChangeDate={updateExportDate(exportDateKeys[1])}
            onDownload={download(exportDateKeys[1])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[1]]}
          />
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des volontaires après le séjour"
            availableFrom={cohort?.dsnjExportDates[exportDateKeys[2]] ? new Date(cohort?.dsnjExportDates[exportDateKeys[2]]) : undefined}
            availableUntil={cohort?.exportsAvailableUntil}
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
