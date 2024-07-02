import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import * as FileSaver from "file-saver";
import { useSelector } from "react-redux";
import { HiOutlineHome, HiOutlineCalendar } from "react-icons/hi";
import plausibleEvent from "@/services/plausible";

import { translate } from "snu-lib";
import dayjs from "dayjs";
import api from "@/services/api";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { Page, Header, ModalConfirmation } from "@snu/ds/admin";
import SelectCohort from "@/components/cohorts/SelectCohort";

import ExportBox from "./components/ExportBox";
import DatePicker from "./components/DatePicker";

const exportDateKeys = ["cohesionCenters", "youngsBeforeSession", "youngsAfterSession"];

const DSNJExport = () => {
  const cohortList = useSelector((state) => state.Cohorts);

  const [currentCohort, setCurrentCohort] = useState(cohortList[0]);

  const [isLDownloadingByKey, setDownloadingByKey] = useState({});
  const [isModalConfirmOpenByKey, setIsModalConfirmOpenByKey] = useState({});
  const [isDatePickerOpenByKey, setIsDatePickerOpenByKey] = useState({});
  const [currentKey, setCurrentKey] = useState(exportDateKeys[0]);
  const [newExportDate, setNewExportDate] = useState();

  useDocumentTitle("Export DSNJ");
  const todayPlusOneDay = dayjs().add(1, "day").toDate();
  const threeMonthsAfterCohortDateEnd = dayjs(currentCohort.dateEnd).add(3, "month").toDate();

  const getExportAvailableUntilDate = (date) => {
    if (!date) return null;
    return dayjs(date).add(1, "month").toDate();
  };

  const translateKey = (key) => {
    switch (key) {
      case "cohesionCenters":
        return "centres";
      case "youngsBeforeSession":
        return "volontaires affectés et sur liste complémentaire";
      case "youngsAfterSession":
        return "volontaires après le séjour";
      default:
        return key;
    }
  };

  const generateText = (key, date) => {
    const isNewExport = currentCohort?.dsnjExportDates?.[key] === undefined;
    const translatedKey = translateKey(isNewExport ? key : currentKey);
    const formattedDate = dayjs(isNewExport ? date : newExportDate).format("DD/MM/YYYY");

    return (
      <p className={!isNewExport && "text-red-600 text-left mt-4"}>
        {isNewExport ? (
          <>
            Vous vous apprêtez à rendre disponible à la DSNJ l'export des <span className="font-bold">{translatedKey}</span> le <span className="font-bold">{formattedDate}</span>.
          </>
        ) : (
          <>
            <span className="font-bold">Attention : </span>un nouvel export des <span className="font-bold">{translatedKey}</span> sera généré le{" "}
            <span className="font-bold">{formattedDate}</span> avec les informations mises à jour. L’ancien export ne sera plus téléchargeable par la DSNJ :{" "}
            <span className="underline">pensez à les prévenir qu’ils doivent à nouveau télécharger cet export !</span>
          </>
        )}
      </p>
    );
  };

  const handleUpdateDate = async (key, date) => {
    setIsModalConfirmOpenByKey({ ...isModalConfirmOpenByKey, [key]: false });
    const { ok, code, data: updatedCohort } = await api.put(`/cohort/${currentCohort._id}/export/${key}`, { date: dayjs(date).format("YYYY-MM-DD") });
    if (!ok) return toastr.error("Une erreur est survenue lors de l'enregistrement de la date d'export", translate(code));
    setCurrentCohort(updatedCohort);
  };

  const handleDownload = async (key) => {
    plausibleEvent(`Export/DSNJ - Exporter ${key}`);
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

  const handleChangeDate = (key, date) => {
    setIsModalConfirmOpenByKey({ ...isModalConfirmOpenByKey, [key]: true });
    setNewExportDate(date);
  };
  const handleClick = (key) => {
    setIsDatePickerOpenByKey({ ...isDatePickerOpenByKey, [key]: true });
    setCurrentKey(key);
  };

  return (
    <>
      <Page>
        <Header
          title="Données centres & volontaires (DSNJ)"
          breadcrumb={[{ title: <HiOutlineHome size={20} />, to: "/" }, { title: "Séjours" }, { title: "Export DSNJ" }]}
          actions={
            <SelectCohort
              cohort={currentCohort.name}
              onChange={(cohort) => {
                setCurrentCohort(cohortList.find((c) => c.name === cohort));
              }}
            />
          }
        />
        <div className="flex gap-4">
          <ExportBox
            title="Liste des centres"
            availableFrom={currentCohort?.dsnjExportDates?.[exportDateKeys[0]]}
            availableUntil={getExportAvailableUntilDate(currentCohort?.dsnjExportDates?.[exportDateKeys[0]])}
            onClick={() => handleClick(exportDateKeys[0])}
            onDownload={() => handleDownload(exportDateKeys[0])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[0]]}
          />
          <ExportBox
            title="Liste des volontaires affectés et sur liste complémentaire"
            availableFrom={currentCohort?.dsnjExportDates?.[exportDateKeys[1]]}
            availableUntil={getExportAvailableUntilDate(currentCohort?.dsnjExportDates?.[exportDateKeys[1]])}
            onClick={() => handleClick(exportDateKeys[1])}
            onDownload={() => handleDownload(exportDateKeys[1])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[1]]}
          />
          <ExportBox
            title="Liste des volontaires après le séjour"
            availableFrom={currentCohort?.dsnjExportDates?.[exportDateKeys[2]]}
            availableUntil={getExportAvailableUntilDate(currentCohort?.dsnjExportDates?.[exportDateKeys[2]])}
            onClick={() => handleClick(exportDateKeys[2])}
            onDownload={() => handleDownload(exportDateKeys[2])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[2]]}
          />
        </div>
        <DatePicker
          dateKey={currentKey}
          onChangeDate={(key, date) => handleChangeDate(key, date)}
          isOpen={isDatePickerOpenByKey[currentKey]}
          onClose={() => setIsDatePickerOpenByKey({ ...isDatePickerOpenByKey, [currentKey]: false })}
          minDate={todayPlusOneDay}
          maxDate={threeMonthsAfterCohortDateEnd}
        />
        <ModalConfirmation
          isOpen={!!isModalConfirmOpenByKey[currentKey]}
          onClose={() => {
            setIsModalConfirmOpenByKey({ ...isModalConfirmOpenByKey, [currentKey]: false });
          }}
          className="md:max-w-[700px]"
          icon={
            <div className="bg-gray-100 rounded-full p-2.5">
              <HiOutlineCalendar size={24} />
            </div>
          }
          title="Modification de la date de mise à disponibilité de l’export DSNJ"
          text={generateText(currentKey, newExportDate)}
          actions={[
            { title: "Annuler", isCancel: true },
            { title: "Valider", onClick: () => handleUpdateDate(currentKey, newExportDate) },
          ]}
        />
      </Page>
    </>
  );
};

export default DSNJExport;
