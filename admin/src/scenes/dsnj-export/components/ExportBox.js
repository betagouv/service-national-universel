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
  if (availableFrom < now) {
    return (
      <>
        <DatePicker className="flex-1" value={availableUntil} disabled label="Disponible jusqu’au" />
        <PlainButton disabled={isLoading} spinner={isLoading} className="w-full mt-4" onClick={onDownload}>
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
        <button className="p-2 rounded-full bg-blue-600 cursor-pointer hover:scale-105 self-end mt-2" onClick={() => setDatePickerOpen(true)}>
          <Pencil className="w-4 h-4 text-white" />
        </button>
      )}
    </>
  );
};

const ExportBox = ({ title, availableFrom, availableUntil, onChangeDate, onDownload, editable = true, isDownloading = false }) => {
  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg shadow p-6 ">
      <div className="text-lg font-medium mb-3">{title}</div>
      <BoxContent availableFrom={availableFrom} availableUntil={availableUntil} onChangeDate={onChangeDate} onDownload={onDownload} editable={editable} isLoading={isDownloading} />
    </div>
  );
};

export default ExportBox;
