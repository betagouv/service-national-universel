import React, { useState } from "react";

import { PlainButton } from "../../plan-transport/components/Buttons";
import Download from "../../../assets/icons/Download";
import Pencil from "../../../assets/icons/Pencil";

import DatePicker from "./DatePicker";

const BoxContent = ({ availableFrom, availableUntil, onChangeDate, onDownload, editable, isLoading }) => {
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const now = new Date();

  const todayPlusOneDay = new Date();
  todayPlusOneDay.setDate(todayPlusOneDay.getDate() + 1);

  if (availableUntil < now) {
    return <DatePicker className="flex-1" value={availableUntil} disabled label="Indisponible depuis le" />;
  }
  if (availableFrom && availableFrom.setHours(0, 0, 0, 0) < now) {
    return (
      <>
        <DatePicker className="flex-1" value={availableUntil} disabled label="Disponible jusqu’au" />
        <PlainButton disabled={isLoading} spinner={isLoading} className="mt-4 w-full" onClick={onDownload}>
          {!isLoading && <Download className="mr-1" />}
          Télécharger
        </PlainButton>
      </>
    );
  }
  return (
    <>
      <DatePicker
        disabled={!editable}
        className="flex-1"
        value={availableFrom}
        onChange={onChangeDate}
        isOpen={isDatePickerOpen}
        setOpen={setDatePickerOpen}
        label="Disponible à partir du"
        minDate={todayPlusOneDay}
      />
      {editable && (
        <button className="mt-2 cursor-pointer self-end rounded-full bg-blue-600 p-2 hover:scale-105" onClick={() => setDatePickerOpen(true)}>
          <Pencil className="h-4 w-4 text-white" />
        </button>
      )}
    </>
  );
};

const ExportBox = ({ title, availableFrom, availableUntil, onChangeDate, onDownload, editable = true, isDownloading = false }) => {
  return (
    <div className="flex flex-1 flex-col rounded-lg bg-white p-6 shadow ">
      <div className="mb-3 text-lg font-medium">{title}</div>
      <BoxContent availableFrom={availableFrom} availableUntil={availableUntil} onChangeDate={onChangeDate} onDownload={onDownload} editable={editable} isLoading={isDownloading} />
    </div>
  );
};

export default ExportBox;
