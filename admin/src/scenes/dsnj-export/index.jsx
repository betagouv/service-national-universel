import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import * as FileSaver from "file-saver";
import { useSelector } from "react-redux";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { HiOutlineChartSquareBar, HiOutlineCalendar } from "react-icons/hi";

import { ROLES, translate } from "snu-lib";
import dayjs from "dayjs";
import api from "@/services/api";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { Select, Page, Header, ModalConfirmation } from "@snu/ds/admin";
import { NewGetCohortSelectOptions } from "@/services/cohort.service";

import ExportBox from "./components/ExportBox";

const exportDateKeys = ["cohesionCenters", "youngsBeforeSession", "youngsAfterSession"];

const DSNJExport = () => {
  const user = useSelector((state) => state.Auth.user);
  const cohortList = useSelector((state) => state.Cohorts);
  const [currentCohort, setCurrentCohort] = useState(cohortList[0]);
  const cohortAddField = addFieldExportAvailableUntil(currentCohort);
  const [cohorts, setCohorts] = useState([]);
  const [isLDownloadingByKey, setDownloadingByKey] = useState({});
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);
  const cohortOptions = NewGetCohortSelectOptions(cohortList);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  useDocumentTitle("Export DSNJ");

  console.log(currentCohort);

  function addFieldExportAvailableUntil(cohort) {
    // export available until 1 month after the cohort
    const exportsAvailableUntil = dayjs(cohort.dateEnd).add(1, "month").toISOString();
    return {
      ...cohort,
      dsnjExportDates: {
        ...cohort.dsnjExportDates,
        exportsAvailableUntil: exportsAvailableUntil,
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

  const handleDownload = (key) => async () => {
    console.log("test");
    /*     try {
      setDownloadingByKey({ ...isLDownloadingByKey, [key]: true });
      const file = await api.get(`/cohort/${currentCohort._id}/export/${key}`);
      FileSaver.saveAs(new Blob([new Uint8Array(file.data.data)], { type: file.mimeType }), file.fileName);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant le téléchagement", "");
    } finally {
      setDownloadingByKey({ ...isLDownloadingByKey, [key]: false });
    } */
  };

  const handleConfirm = () => {
    setIsModalConfirmOpen(false);
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
                closeMenuOnSelect={true}
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
            availableFrom={cohortAddField?.dsnjExportDates[exportDateKeys[0]]}
            availableUntil={cohortAddField?.dsnjExportDates?.exportsAvailableUntil}
            setModalConfirm={setIsModalConfirmOpen}
            onChangeDate={updateExportDate(exportDateKeys[0])}
            onDownload={handleDownload(exportDateKeys[0])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[0]]}
          />
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des volontaires affectés et sur liste complémentaire"
            availableFrom={cohortAddField?.dsnjExportDates[exportDateKeys[1]]}
            availableUntil={cohortAddField?.dsnjExportDates?.exportsAvailableUntil}
            setModalConfirm={setIsModalConfirmOpen}
            onChangeDate={updateExportDate(exportDateKeys[1])}
            onDownload={handleDownload(exportDateKeys[1])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[1]]}
          />
          <ExportBox
            editable={user.role === ROLES.ADMIN}
            title="Liste des volontaires après le séjour"
            availableFrom={cohortAddField?.dsnjExportDates[exportDateKeys[2]]}
            availableUntil={cohortAddField?.dsnjExportDates?.exportsAvailableUntil}
            setModalConfirm={setIsModalConfirmOpen}
            onChangeDate={updateExportDate(exportDateKeys[2])}
            onDownload={handleDownload(exportDateKeys[2])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[2]]}
          />
        </div>
        <ModalConfirmation
          isOpen={isModalConfirmOpen}
          onClose={() => {
            setIsModalConfirmOpen(false);
          }}
          className="md:max-w-[700px]"
          icon={
            <div className="bg-gray-100 rounded-full p-2.5">
              <HiOutlineCalendar size={24} />
            </div>
          }
          title="Modification de la date de mise à disponibilité de l’export DSNJ"
          text={
            <p className="text-red-600 text-left mt-4">
              <span className="font-bold">Attention : </span>un nouvel export sera généré le <span className="font-bold">12/06/2024</span> avec les informations mises à jour.
              L’ancien export ne sera plus téléchargeable par la DSNJ : <span className="underline">pensez à les prévenir qu’ils doivent à nouveau télécharger cet export !</span>
            </p>
          }
          actions={[
            { title: "Annuler", isCancel: true },
            { title: "Valider", onclick: () => handleConfirm() },
          ]}
        />
      </Page>
    </>
  );
};

export default DSNJExport;
