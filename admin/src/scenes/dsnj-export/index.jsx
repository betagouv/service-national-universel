import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import * as FileSaver from "file-saver";
import { useSelector } from "react-redux";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { HiOutlineChartSquareBar } from "react-icons/hi";

import { ROLES, translate } from "snu-lib";
import dayjs from "@/utils/dayjs.utils";
import api from "@/services/api";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { Select, Page, Header } from "@snu/ds/admin";
import { NewGetCohortSelectOptions } from "@/services/cohort.service";

import ExportBox from "./components/ExportBox";

const exportDateKeys = ["cohesionCenters", "youngsBeforeSession", "youngsAfterSession"];

const DSNJExport = () => {
  const user = useSelector((state) => state.Auth.user);
  const cohortList = useSelector((state) => state.Cohorts);
  const [currentCohort, setCurrentCohort] = useState(cohortList[0]);
  const cohortWithExportDates = addFieldExportAvailableUntil(cohortList);
  const [cohorts, setCohorts] = useState([]);
  const [isLDownloadingByKey, setDownloadingByKey] = useState({});
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);
  const cohortOptions = NewGetCohortSelectOptions(cohortList);
  useDocumentTitle("Export DSNJ");

  function addFieldExportAvailableUntil(cohort) {
    // export available until 1 month after the cohort
    const exportsAvailableUntil = new Date(cohort.dateEnd);
    exportsAvailableUntil.setMonth(exportsAvailableUntil.getMonth() + 1);
    return {
      ...cohort,
      dsnjExportDates: {
        ...cohort.dsnjExportDates,
        exportsAvailableUntil: exportsAvailableUntil.toISOString(),
      },
    };
  }

  const updateExportDate = (key) => async (date) => {
    const { ok, code, data: updatedCohort } = await api.put(`/cohort/${currentCohort._id}/export/${key}`, { date: dayjs(date).format("YYYY-MM-DD") });
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
      const file = await api.get(`/cohort/${currentCohort._id}/export/${key}`);
      FileSaver.saveAs(new Blob([new Uint8Array(file.data.data)], { type: file.mimeType }), file.fileName);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant le téléchagement", "");
    } finally {
      setDownloadingByKey({ ...isLDownloadingByKey, [key]: false });
    }
  };

  return (
    <>
      <Page>
        <Header
          title="Données centres & volontaires (DSNJ)"
          breadcrumb={[{ title: <HiOutlineChartSquareBar size={20} /> }, { title: "Séjours" }, { title: "Export DSNJ" }]}
          actions={
            <>
              {isSelectMenuOpen && <FaMagnifyingGlass size={25} className="text-gray-400 mr-3" />}
              <Select
                options={cohortOptions}
                value={cohortOptions.find((e) => e.value === currentCohort.name)}
                defaultValue={currentCohort.name}
                maxMenuHeight={520}
                className="w-[500px]"
                disabled={user.role === ROLES.HEAD_CENTER}
                onMenuOpen={() => setIsSelectMenuOpen(true)}
                onMenuClose={() => setIsSelectMenuOpen(false)}
                onChange={(e) => {
                  setCurrentCohort(cohortList.find((cohort) => cohort.name === e.value));
                  setIsSelectMenuOpen(false);
                }}
              />
            </>
          }
        />
        <div className="flex gap-4">
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des centres"
            availableFrom={cohortWithExportDates?.dsnjExportDates[exportDateKeys[0]]}
            availableUntil={cohortWithExportDates?.exportsAvailableUntil}
            onChangeDate={updateExportDate(exportDateKeys[0])}
            onDownload={download(exportDateKeys[0])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[0]]}
          />
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des volontaires affectés et sur liste complémentaire"
            availableFrom={cohortWithExportDates?.dsnjExportDates[exportDateKeys[1]]}
            availableUntil={cohortWithExportDates?.exportsAvailableUntil}
            onChangeDate={updateExportDate(exportDateKeys[1])}
            onDownload={download(exportDateKeys[1])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[1]]}
          />
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des volontaires après le séjour"
            availableFrom={cohortWithExportDates?.dsnjExportDates[exportDateKeys[2]]}
            availableUntil={cohortWithExportDates?.exportsAvailableUntil}
            onChangeDate={updateExportDate(exportDateKeys[2])}
            onDownload={download(exportDateKeys[2])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[2]]}
          />
        </div>
      </Page>
    </>
  );
};

export default DSNJExport;
