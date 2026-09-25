import React from "react";

import { LigneBusDto } from "snu-lib";

import Toggle from "@/components/Toggle";

import DatePickerList from "../../components/DatePickerList";
import Field from "../../components/Field";

interface BusTeamProps {
  bus: LigneBusDto;
  title: string;
  idTeam?: string | null;
}

// L'équipe de la ligne est en lecture seule : l'ajout, la modification et la suppression de membres ont été supprimés.
export default function BusTeam({ bus, title, idTeam }: BusTeamProps) {
  const member = idTeam ? bus.team.find((item) => item._id?.toString() === idTeam) : undefined;

  return (
    <div className="w-full rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        <div className="text-lg leading-7 text-gray-900 font-bold">{title}</div>
      </div>
      <div className="my-8 flex">
        <div className="flex w-[45%] flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Field label="Nom" value={member?.lastName} readOnly={true} />
              <Field label="Prénom" value={member?.firstName} readOnly={true} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <DatePickerList
                label="Date de naissance"
                onChange={() => {}}
                // @ts-ignore
                value={member?.birthdate ? new Date(member.birthdate) : null}
                readOnly={true}
              />
              <Field label="Téléphone" value={member?.phone} readOnly={true} />
            </div>
            <Field label="Email" value={member?.mail} readOnly={true} />
          </div>
        </div>
        <div className="flex w-[10%] items-center justify-center">
          <div className="my-2 h-full w-[1px] border-r-[1px] border-gray-300"></div>
        </div>
        <div className="flex w-[45%] flex-col gap-4 ">
          <Field label="Numéro de ligne" value={bus.busId} readOnly={true} />
          <div className="flex items-center gap-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-800 justify-between">
            <div className="font-medium text-gray-800">Concerné par l'aller : </div>
            <Toggle disabled={true} value={member?.forth === true} onChange={() => {}} />
          </div>
          <div className="flex items-center gap-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-800 justify-between">
            <div className="font-medium text-gray-800">Concerné par le retour : </div>
            <Toggle disabled={true} value={member?.back === true} onChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
