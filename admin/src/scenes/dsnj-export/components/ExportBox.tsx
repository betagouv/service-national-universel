import React from "react";
import { useSelector } from "react-redux";
import { HiOutlinePencil } from "react-icons/hi";
import dayjs from "dayjs";

import { ROLES } from "snu-lib";
import { Button } from "@snu/ds/admin";

import { AuthState } from "@/redux/auth/reducer";

interface Props {
  title: string;
  availableFrom?: Date;
  availableUntil?: Date;
  isDownloading?: boolean;
  onClick: React.MouseEventHandler;
  onDownload: React.MouseEventHandler;
}

export default function ExportBox({ title, availableFrom, availableUntil, onClick, onDownload, isDownloading = false }: Props) {
  const user = useSelector((state: AuthState) => state.Auth.user);

  const now = dayjs().startOf("day");
  const exportAvailableFrom = availableFrom ? dayjs(availableFrom).startOf("day") : null;
  const exportAvailableUntil = dayjs(availableUntil).startOf("day");

  const isBefore = now.isBefore(exportAvailableFrom);
  const isAvailable = now.isAfter(exportAvailableFrom) || (now.isSame(exportAvailableFrom, "day") && now.isBefore(exportAvailableUntil)) || now.isSame(exportAvailableUntil, "day");
  const isExpired = now.isAfter(exportAvailableUntil);

  return (
    <div className="flex flex-1 flex-col rounded-xl bg-white p-6 shadow text-gray-900 h-[21em]">
      <h1 className="h-20 text-lg leading-7 font-bold">{title}</h1>
      <div className="flex-grow h-1/5">
        {isBefore && (
          <p className="text-sm leading-5 font-normal text-gray-500">
            Disponible à partir du : <span className="text-sm leading-5 font-bold text-gray-900">{exportAvailableFrom?.format("YYYY-MM-DD")}</span>
          </p>
        )}
        {isAvailable && (
          <div className="text-sm leading-5 font-normal text-gray-500 flex flex-col gap-2">
            <p>
              Générée le : <span className="text-sm leading-5 font-bold text-gray-900">{exportAvailableFrom?.format("YYYY-MM-DD")}</span>
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
      <div className="h-20">
        {user.role === ROLES.ADMIN && <Button title="Modifier la date" type="tertiary" leftIcon={<HiOutlinePencil />} className="w-full mb-2 mx-auto" onClick={onClick} />}
        {isAvailable && !isExpired ? (
          <Button title="Exporter" loading={isDownloading} className="w-full mx-auto" disabled={isDownloading} onClick={onDownload} />
        ) : (
          <Button title={isExpired ? "Indisponible" : "Bientôt disponible"} disabled className="w-full mx-auto" />
        )}
      </div>
    </div>
  );
}
