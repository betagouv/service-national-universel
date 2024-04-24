import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import * as FileSaver from "file-saver";
import { ROLES, translate } from "snu-lib";
import dayjs from "@/utils/dayjs.utils";

import { Title } from "../plan-transport/components/commons";
import Select from "../plan-transport/components/Select";
import api from "../../services/api";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import ExportBox from "./components/ExportBox";
import { useSelector } from "react-redux";
import { getCohortSelectOptions } from "@/services/cohort.service";

const exportDateKeys = ["cohesionCenters", "youngsBeforeSession", "youngsAfterSession"];

const DSNJExport = () => {
  const user = useSelector((state) => state.Auth.user);
  const cohortList = useSelector((state) => state.Cohorts);
  const [cohortId, setCohortId] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [cohortOptions, setCohortOptions] = useState([]);
  const [isLDownloadingByKey, setDownloadingByKey] = useState({});
  useDocumentTitle("Export DSNJ");

  useEffect(() => {
    getCohorts();
  }, []);

  const getCohorts = async () => {
    const cohorts = cohortList.map(({ snuId, dateEnd, dsnjExportDates }) => {
      const cohesionCentersAvailableUntil = dsnjExportDates?.cohesionCenters ? new Date(dsnjExportDates.cohesionCenters) : undefined;
      cohesionCentersAvailableUntil?.setMonth(cohesionCentersAvailableUntil.getMonth() + 1);
      const youngsBeforeSessionAvailableUntil = dsnjExportDates?.youngsBeforeSession ? new Date(dsnjExportDates.youngsBeforeSession) : undefined;
      youngsBeforeSessionAvailableUntil?.setMonth(youngsBeforeSessionAvailableUntil.getMonth() + 1);
      const youngsAfterSessionAvailableUntil = dsnjExportDates?.youngsAfterSession ? new Date(dsnjExportDates.youngsAfterSession) : undefined;
      youngsAfterSessionAvailableUntil?.setMonth(youngsAfterSessionAvailableUntil.getMonth() + 1);

      return {
        id: snuId,
        dsnjExportDates: dsnjExportDates || {},
        cohesionCentersAvailableUntil,
        youngsBeforeSessionAvailableUntil,
        youngsAfterSessionAvailableUntil,
      };
    });
    setCohorts(cohorts);
    //@todo: do not use snuId in queries
    const formattedCohortOptions = getCohortSelectOptions(cohortList.map((c) => ({ ...c, name: c.snuId })));
    setCohortOptions(formattedCohortOptions);
    setCohortId(formattedCohortOptions[0].value);
  };

  const updateExportDate = (key) => async (date) => {
    const { ok, code, data: updatedCohort } = await api.put(`/cohort/${cohortId}/export/${key}`, { date: dayjs(date).format("YYYY-MM-DD") });
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
            availableFrom={cohort?.dsnjExportDates?.cohesionCenters ? new Date(cohort?.dsnjExportDates.cohesionCenters) : undefined}
            availableUntil={cohort?.cohesionCentersAvailableUntil}
            onChangeDate={updateExportDate(exportDateKeys[0])}
            onDownload={download(exportDateKeys[0])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[0]]}
          />
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des volontaires affectés et sur liste complémentaire"
            availableFrom={cohort?.dsnjExportDates?.youngsBeforeSession ? new Date(cohort?.dsnjExportDates.youngsBeforeSession) : undefined}
            availableUntil={cohort?.youngsBeforeSessionAvailableUntil}
            onChangeDate={updateExportDate(exportDateKeys[1])}
            onDownload={download(exportDateKeys[1])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[1]]}
          />
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des volontaires après le séjour"
            availableFrom={cohort?.dsnjExportDates?.youngsAfterSession ? new Date(cohort?.dsnjExportDates.youngsAfterSession) : undefined}
            availableUntil={cohort?.youngsAfterSessionAvailableUntil}
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
