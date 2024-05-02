import React from "react";
import { useSelector } from "react-redux";
import { HiOutlinePencil } from "react-icons/hi";
import dayjs from "dayjs";

import { ROLES } from "snu-lib";

import { Button } from "@snu/ds/admin";

export default function ExportBox({ title, availableFrom, availableUntil, onClick, onDownload, isDownloading = false }) {
  const user = useSelector((state) => state.Auth.user);
  const now = dayjs().startOf("day");
  const exportAvailableFrom = availableFrom ? dayjs(availableFrom).startOf("day") : null;
  const exportAvailableUntil = dayjs(availableUntil).startOf("day");
  const isExportAvailable = availableFrom
    ? now.isAfter(exportAvailableFrom) || (now.isSame(exportAvailableFrom, "day") && now.isBefore(exportAvailableUntil)) || now.isSame(exportAvailableUntil, "day")
    : false;

  const isBefore = now.isBefore(exportAvailableFrom);
  const isAvailable = now.isAfter(exportAvailableFrom) || (now.isSame(exportAvailableFrom, "day") && now.isBefore(exportAvailableUntil)) || now.isSame(exportAvailableUntil, "day");
  const isExpired = now.isAfter(exportAvailableUntil);

  return (
    <div className="flex flex-1 flex-col rounded-xl bg-white p-6 shadow text-gray-900 h-[20em]">
      <h1 className="flex-grow h-1/3 text-lg leading-7 font-bold">{title}</h1>
      <div className="flex-grow h-1/5">
        {isBefore && (
          <p className="text-sm leading-5 font-normal text-gray-500">
            Disponible à partir du : <span className="text-sm leading-5 font-bold text-gray-900">{exportAvailableFrom.format("YYYY-MM-DD")}</span>
          </p>
        )}
        {isAvailable && (
          <div className="text-sm leading-5 font-normal text-gray-500 flex flex-col gap-2">
            <p>
              Générée le : <span className="text-sm leading-5 font-bold text-gray-900">{exportAvailableFrom.format("YYYY-MM-DD")}</span>
            </p>
            <p>
              Disponible jusqu'au : <span className="text-sm leading-5 font-bold text-gray-900">{exportAvailableUntil.format("YYYY-MM-DD")}</span>
            </p>
          </div>
        )}
        {isExpired && (
          <p className="text-sm leading-5 font-normal text-gray-500">
            Indisponible depuis le : <span className="text-sm leading-5 font-bold text-gray-900">{exportAvailableUntil.format("YYYY-MM-DD")}</span>
          </p>
        )}
      </div>
      <div className="flex-grow h-2/5 mt-3">
        {user.role === ROLES.ADMIN && <Button title="Modifier la date" type="tertiary" leftIcon={<HiOutlinePencil />} className="w-full mb-4 mx-auto" onClick={onClick} />}
        {isExportAvailable ? (
          <Button title="Exporter" loading={isDownloading} className="w-full mx-auto" disabled={isDownloading} onClick={onDownload} />
        ) : (
          <Button title="Bientôt disponible" disabled className="w-full mx-auto" />
        )}
      </div>
    </div>
  );
}
