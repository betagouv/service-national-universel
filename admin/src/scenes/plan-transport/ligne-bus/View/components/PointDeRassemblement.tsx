import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { CohortType, LigneBusDto, PointDeRassemblementType, ROLES } from "snu-lib";

import { AuthState } from "@/redux/auth/reducer";
import Loader from "@/components/Loader";

import Field from "../../components/Field";
import PDRIcon from "../../components/Icons/PDR";
import { Button } from "@snu/ds/admin";

import PointDeRassemblementLabel from "./PointDeRassemblementLabel";

const transportTypeLabels = {
  bus: "Bus",
  train: "Train",
  avion: "Avion",
};

export type PointDeRassemblementDetail = Partial<
  PointDeRassemblementType &
    LigneBusDto & {
      transportType?: string;
      meetingHour?: string;
      busArrivalHour?: string;
      departureHour?: string;
      returnHour?: string;
      meetingPointId?: string;
    }
>;

interface PointDeRassemblementProps {
  bus: LigneBusDto;
  index: number;
  pdr: PointDeRassemblementDetail;
  volume?: { youngsCount: number; meetingPointId: string }[];
  cohort: CohortType;
}

// Le point de rassemblement de la ligne est en lecture seule : le changement de lieu, d'horaires et de type de transport a été supprimé.
export default function PointDeRassemblement({ bus, index, pdr, volume, cohort }: PointDeRassemblementProps) {
  const user = useSelector((state: AuthState) => state.Auth.user);

  if (!volume) {
    return (
      <div className="w-full rounded-xl bg-white p-8">
        <Loader />
      </div>
    );
  }

  const youngsCount = volume.find((v) => v.meetingPointId === pdr._id)?.youngsCount || 0;
  const transportType = pdr.transportType || "bus";

  return (
    <div className="w-full rounded-xl bg-white p-8">
      <div className="relative flex items-start justify-between flex-wrap-reverse gap-y-4">
        <div className="flex items-center gap-4">
          <div className="text-xl leading-6 text-[#242526]">Point de rassemblement</div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-sm">{index}</div>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="flex flex-col border border-gray-300 rounded-lg py-2 px-2.5">
          <div className="flex justify-between flex-row items-center">
            <PointDeRassemblementLabel pdr={pdr} showLink={user.role !== ROLES.TRANSPORTER} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <Field label="Type de transport" value={transportTypeLabels[transportType] || transportType} readOnly={true} />
          <div className="text-xs font-medium leading-4 text-gray-900">Aller</div>
          <div className="flex items-center gap-4">
            <Field label="Heure d’arrivée du transport" placeholder="hh:mm" value={pdr.busArrivalHour || ""} readOnly={true} />
            <Field label="Heure de convocation" placeholder="hh:mm" value={pdr.meetingHour || ""} readOnly={true} />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-1/2 text-xs font-medium leading-4 text-gray-900">Aller</div>
            <div className="w-1/2 text-xs font-medium leading-4 text-gray-900">Retour</div>
          </div>
          <div className="flex items-center gap-4">
            <Field label="Heure de départ" placeholder="hh:mm" value={pdr.departureHour || ""} readOnly={true} />
            <Field label="Heure d’arrivée" placeholder="hh:mm" value={pdr.returnHour || ""} readOnly={true} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="pb-1 text-lg font-medium leading-5 text-gray-900"> </div>
          <Link
            target="_blank"
            to={`/ligne-de-bus/volontaires/point-de-rassemblement/${pdr._id?.toString()}?cohort=${cohort?.name}&ligneId=${bus._id.toString()}`}
            className="w-full">
            <Button type="tertiary" title={`Voir les volontaires (${youngsCount})`} className="w-full max-w-none" />
          </Link>
        </div>
        <div className="mt-8 flex justify-end">
          <PDRIcon />
        </div>
      </div>
    </div>
  );
}
