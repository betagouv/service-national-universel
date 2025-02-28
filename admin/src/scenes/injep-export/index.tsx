import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import * as FileSaver from "file-saver";
import { useDispatch, useSelector } from "react-redux";
import { HiOutlineCalendar } from "react-icons/hi";
import plausibleEvent from "@/services/plausible";
import cx from "classnames";

import { translate } from "snu-lib";
import dayjs from "dayjs";
import api from "@/services/api";
import { COHORTS_ACTIONS } from "@/redux/cohorts/actions";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { Page, Header, ModalConfirmation } from "@snu/ds/admin";
import SelectCohort from "@/components/cohorts/SelectCohort";

import ExportBox from "./components/ExportBox";
import DatePicker from "./components/DatePicker";
import { CohortState } from "@/redux/cohorts/reducer";

const exportDateKeys = ["youngsBeforeSession", "youngsAfterSession"];

const INJEPExport = () => {
  const dispatch = useDispatch();
  const cohortList = useSelector((state: CohortState) => state.Cohorts);

  const [currentCohort, setCurrentCohort] = useState<any>(cohortList?.[0]);

  const [isLDownloadingByKey, setDownloadingByKey] = useState({});
  const [isModalConfirmOpenByKey, setIsModalConfirmOpenByKey] = useState({});
  const [isDatePickerOpenByKey, setIsDatePickerOpenByKey] = useState({});
  const [currentKey, setCurrentKey] = useState(exportDateKeys[0]);
  const [newExportDate, setNewExportDate] = useState();

  useDocumentTitle("Export INJEP");
  const todayPlusOneDay = dayjs().add(1, "day").toDate();
  const oneMonthAfterCohortDateEnd = dayjs(currentCohort.dateEnd).add(1, "month").toDate();

  const getExportAvailableUntilDate = (date) => {
    if (!date) return null;
    return dayjs(date).add(1, "month").toDate();
  };

  const translateKey = (key) => {
    switch (key) {
      case "youngsBeforeSession":
        return "volontaires affectés et sur liste complémentaire";
      case "youngsAfterSession":
        return "volontaires après le séjour";
      default:
        return key;
    }
  };

  const generateText = (key, date) => {
    const isNewExport = currentCohort?.injepExportDates?.[key] === undefined;
    const translatedKey = translateKey(isNewExport ? key : currentKey);
    const formattedDate = dayjs(isNewExport ? date : newExportDate).format("DD/MM/YYYY");

    return (
      <p className={cx({ "text-red-600 text-left mt-4": !isNewExport })}>
        {isNewExport ? (
          <>
            Vous vous apprêtez à rendre disponible à l'INJEP l'export des <span className="font-bold">{translatedKey}</span> le <span className="font-bold">{formattedDate}</span>.
          </>
        ) : (
          <>
            <span className="font-bold">Attention : </span>un nouvel export des <span className="font-bold">{translatedKey}</span> sera généré le{" "}
            <span className="font-bold">{formattedDate}</span> avec les informations mises à jour. L’ancien export ne sera plus téléchargeable par l'INJEP :{" "}
            <span className="underline">pensez à les prévenir qu’ils doivent à nouveau télécharger cet export !</span>
          </>
        )}
      </p>
    );
  };

  const handleUpdateDate = async (key, date) => {
    setIsModalConfirmOpenByKey({ ...isModalConfirmOpenByKey, [key]: false });
    const { ok, code, data: updatedCohort } = await api.put(`/cohort/${currentCohort._id}/export-injep/${key}`, { date: dayjs(date).format("YYYY-MM-DD") });
    if (!ok) return toastr.error("Une erreur est survenue lors de l'enregistrement de la date d'export", translate(code));
    dispatch({ type: COHORTS_ACTIONS.UPDATE_COHORT, payload: updatedCohort });
    setCurrentCohort(updatedCohort);
  };

  const handleDownload = async (key) => {
    plausibleEvent(`Export/INJEP - Exporter ${key}`);
    try {
      setDownloadingByKey({ ...isLDownloadingByKey, [key]: true });
      const file = await api.get(`/cohort/${currentCohort._id}/export-injep/${key}`);
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
          title="Données centres & volontaires (INJEP)"
          breadcrumb={[{ title: "Séjours" }, { title: "Export INJEP" }]}
          // @ts-ignore
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
            title="Liste des volontaires au début du séjour (J+2)"
            availableFrom={currentCohort?.injepExportDates?.[exportDateKeys[0]]}
            // @ts-ignore
            availableUntil={getExportAvailableUntilDate(currentCohort?.injepExportDates?.[exportDateKeys[0]])}
            onClick={() => handleClick(exportDateKeys[0])}
            onDownload={() => handleDownload(exportDateKeys[0])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[0]]}
          />
          <ExportBox
            title="Liste des volontaires après le séjour (J+6)"
            availableFrom={currentCohort?.injepExportDates?.[exportDateKeys[1]]}
            // @ts-ignore
            availableUntil={getExportAvailableUntilDate(currentCohort?.injepExportDates?.[exportDateKeys[1]])}
            onClick={() => handleClick(exportDateKeys[1])}
            onDownload={() => handleDownload(exportDateKeys[1])}
            isDownloading={!!isLDownloadingByKey[exportDateKeys[1]]}
          />
        </div>
        <DatePicker
          dateKey={currentKey}
          onChangeDate={(key, date) => handleChangeDate(key, date)}
          isOpen={isDatePickerOpenByKey[currentKey]}
          onClose={() => setIsDatePickerOpenByKey({ ...isDatePickerOpenByKey, [currentKey]: false })}
          // @ts-ignore
          minDate={todayPlusOneDay}
          // @ts-ignore
          maxDate={oneMonthAfterCohortDateEnd}
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
          title="Modification de la date de mise à disponibilité de l’export INJEP"
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

export default INJEPExport;
