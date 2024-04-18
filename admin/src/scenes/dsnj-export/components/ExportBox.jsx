import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlinePencil } from "react-icons/hi";
import dayjs from "dayjs";

import { Button } from "@snu/ds/admin";

import { PlainButton } from "../../plan-transport/components/Buttons";
import Download from "@/assets/icons/Download";
import Pencil from "@/assets/icons/Pencil";

import DatePicker from "./DatePicker";
import { ROLES } from "snu-lib";

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

export default function ExportBox({ title, availableFrom, availableUntil, onChangeDate, onDownload, editable = true, isDownloading = false }) {
  const user = useSelector((state) => state.Auth.user);

  const generateText = () => {
    const now = dayjs();
    const exportAvailableFrom = dayjs(availableFrom);
    const exportAvailableUntil = dayjs(availableUntil);
    console.log("availableFrom", availableFrom);
    console.log("availableUntil", availableUntil);

    switch (true) {
      case now.isBefore(exportAvailableFrom):
        return (
          <p className="text-sm leading-5 font-normal text-gray-500">
            Disponible à partir du : <span className="text-sm leading-5 font-bold text-gray-900">{availableFrom.format("YYYY-MM-DD")}</span>
          </p>
        );
      case now.isAfter(exportAvailableFrom) && now.isBefore(exportAvailableUntil):
        return (
          <p className="text-sm leading-5 font-normal text-gray-500">
            Générée le : <span className="text-sm leading-5 font-bold text-gray-900">{availableFrom.format("YYYY-MM-DD")}</span>
            Disponible jusqu'au : <span className="text-sm leading-5 font-bold text-gray-900">{availableUntil.format("YYYY-MM-DD")}</span>
          </p>
        );
      case now.isAfter(exportAvailableUntil):
        return (
          <p className="text-sm leading-5 font-normal text-gray-500">
            Indisponible depuis le : <span className="text-sm leading-5 font-bold text-gray-900">{availableUntil.format("YYYY-MM-DD")}</span>
          </p>
        );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  };

  return (
    <div className="flex flex-1 flex-col rounded-lg bg-white p-6 shadow text-gray-900">
      <h1 className="text-lg leading-7 font-bold ">{title}</h1>
      {generateText()}
      {user.role === ROLES.ADMIN && <Button title="Modifier la date" type="tertiary" leftIcon={<HiOutlinePencil />} />}
    </div>
  );
}
