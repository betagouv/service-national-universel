import React from "react";
import { Link } from "react-router-dom";

import { LigneBusDto } from "snu-lib";

import Loader from "@/components/Loader";
import { Button } from "@snu/ds/admin";

import DatePickerList from "../../components/DatePickerList";
import Field from "../../components/Field";
import { DataForCheck } from "../View";
import MergedBus from "./Partials/MergedBus";
import MirrorBus from "./Partials/MirrorBus";

const formatBoolean = (value?: boolean | null) => (value ? "Oui" : "Non");

interface InfoProps {
  bus: LigneBusDto;
  dataForCheck: DataForCheck | null;
  nbYoung?: number;
}

// Les informations générales de la ligne sont en lecture seule : la modification a été supprimée.
export default function Info({ bus, dataForCheck, nbYoung }: InfoProps) {
  if (!dataForCheck)
    return (
      <div className="w-full rounded-xl bg-white p-8">
        <Loader />
      </div>
    );

  return (
    <div className="w-full rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        <div className="text-lg leading-7 text-gray-900 font-bold">Informations générales</div>
      </div>
      <div className="my-8 flex">
        <div className="flex w-[45%] flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div>Identification</div>
              <Field label="Numéro de ligne" value={bus.busId} readOnly={true} />
              <Field label="Code court de route" value={bus.codeCourtDeRoute} readOnly={true} />
            </div>
            <div className="flex flex-col gap-3">
              <div>Capacité</div>
              <div className="flex gap-4">
                <Field label="Totale" value={String(bus.totalCapacity ?? "")} readOnly={true} />
                <Field label="Accompagnateurs" value={String(bus.followerCapacity ?? "")} readOnly={true} />
                <Field label="Volontaires" value={String(bus.youngCapacity ?? "")} readOnly={true} />
              </div>
            </div>
          </div>
          <Link target="_blank" to={`/ligne-de-bus/volontaires/bus/${bus._id.toString()}`} className="w-full">
            <Button type="tertiary" title={`Voir les volontaires (${nbYoung})`} className="w-full max-w-none" />
          </Link>
          {bus.classeId && (
            <Link to={`/classes/${bus.classeId}`} className="w-full">
              <Button type="tertiary" title="Voir la classe" className="w-full max-w-none" />
            </Link>
          )}
          <div className="flex items-center gap-4"></div>
        </div>
        <div className="flex w-[10%] items-center justify-center">
          <div className="my-2 h-full w-[1px] border-r-[1px] border-gray-300"></div>
        </div>
        <div className="flex w-[45%] flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div>Trajets</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <DatePickerList
                  label="Aller"
                  onChange={() => {}}
                  // @ts-ignore
                  value={new Date(bus.departuredDate)}
                  readOnly={true}
                />
                <DatePickerList
                  label="Retour"
                  onChange={() => {}}
                  // @ts-ignore
                  value={new Date(bus.returnDate)}
                  readOnly={true}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Field label="Pause déjeuner aller" value={formatBoolean(bus.lunchBreak)} readOnly={true} />
              <Field label="Pause déjeuner retour" value={formatBoolean(bus.lunchBreakReturn)} readOnly={true} />
            </div>
            <div>
              <Field label="Temps de route" value={String(bus.travelTime ?? "")} readOnly={true} />
            </div>
          </div>
          <MergedBus bus={bus} />
          <MirrorBus bus={bus} />
        </div>
      </div>
    </div>
  );
}
