import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlinePencil } from "react-icons/hi";
import dayjs from "dayjs";

import { Button } from "@snu/ds/admin";

import { PlainButton } from "../../plan-transport/components/Buttons";
import Download from "@/assets/icons/Download";
import Pencil from "@/assets/icons/Pencil";
import Loader from "@/components/Loader";

import DatePicker from "./DatePicker";
import { ROLES } from "snu-lib";

export default function ExportBox({ title, availableFrom, availableUntil, setModalConfirm, onDownload, isDownloading = false }) {
  const user = useSelector((state) => state.Auth.user);
  const now = dayjs();
  const exportAvailableFrom = dayjs(availableFrom);
  const exportAvailableUntil = dayjs(availableUntil);
  const isExportAvailable =
    now.isAfter(exportAvailableFrom) || (now.isSame(exportAvailableFrom, "day") && now.isBefore(exportAvailableUntil)) || now.isSame(exportAvailableUntil, "day");

  const generateText = () => {
    switch (true) {
      case now.isBefore(exportAvailableFrom):
        return (
          <p className="text-sm leading-5 font-normal text-gray-500">
            Disponible à partir du : <span className="text-sm leading-5 font-bold text-gray-900">{exportAvailableFrom.format("YYYY-MM-DD")}</span>
          </p>
        );
      case now.isAfter(exportAvailableFrom) || (now.isSame(exportAvailableFrom, "day") && now.isBefore(exportAvailableUntil)) || now.isSame(exportAvailableUntil, "day"):
        return (
          <div className="text-sm leading-5 font-normal text-gray-500 flex flex-col gap-2">
            <p>
              Générée le : <span className="text-sm leading-5 font-bold text-gray-900">{exportAvailableFrom.format("YYYY-MM-DD")}</span>
            </p>
            <p>
              Disponible jusqu'au : <span className="text-sm leading-5 font-bold text-gray-900">{exportAvailableUntil.format("YYYY-MM-DD")}</span>
            </p>
          </div>
        );
      case now.isAfter(exportAvailableUntil):
        return (
          <p className="text-sm leading-5 font-normal text-gray-500">
            Indisponible depuis le : <span className="text-sm leading-5 font-bold text-gray-900">{exportAvailableUntil.format("YYYY-MM-DD")}</span>
          </p>
        );
    }
  };

  return (
    <div className="flex flex-1 flex-col rounded-lg bg-white p-6 shadow text-gray-900">
      <h1 className="text-lg leading-7 font-bold mb-8">{title}</h1>
      {generateText()}
      {user.role === ROLES.ADMIN && (
        <Button title="Modifier la date" type="tertiary" leftIcon={<HiOutlinePencil />} className="w-full mb-4 mt-6 mx-auto" onClick={() => setModalConfirm(true)} />
      )}
      {isExportAvailable ? (
        <Button title={isDownloading ? <Loader /> : "Exporter"} className="w-full mx-auto" disabled={isDownloading} onClick={onDownload} />
      ) : (
        <Button title="Bientôt disponible" disabled className="w-full mx-auto" />
      )}
    </div>
  );
}

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
        <DatePicker className="flex-2" value={availableFrom} disabled label="Générée le" />
        <DatePicker className="flex-2" value={availableUntil} disabled label="Disponible jusqu’au" />
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
