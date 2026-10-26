import React from "react";
import { useSelector } from "react-redux";
import { MdInfoOutline } from "react-icons/md";

import { LigneBusDto, ROLES } from "snu-lib";

import { AuthState } from "@/redux/auth/reducer";

import Field from "../../../components/Field";
import Iceberg from "../../../components/Icons/Iceberg";
import CentreLabel from "./CentreLabel";

type Props = {
  bus: LigneBusDto;
};

// Le centre de destination de la ligne est en lecture seule : le changement de session et d'horaires a été supprimé.
export default function Centre({ bus }: Props) {
  const user = useSelector((state: AuthState) => state.Auth.user);

  return (
    <div className="w-1/2 rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        <p className="text-lg leading-7 text-gray-900 font-bold">Centre de cohésion</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8">
        <div className="col-span-2">
          <div className="flex flex-col border border-gray-300 rounded-lg py-2 px-2.5">
            {bus.centerDetail ? (
              <CentreLabel centre={bus.centerDetail} showLink={user.role !== ROLES.TRANSPORTER} />
            ) : (
              <p className="text-xs text-gray-400">
                <MdInfoOutline className="inline-block mb-0.5" /> Impossible d'afficher les informations du centre de destination.
              </p>
            )}
          </div>
        </div>
        <Field label="Heure d’arrivée" value={bus.centerArrivalTime} placeholder="hh:mm" readOnly={true} />
        <Field label="Heure de départ" value={bus.centerDepartureTime} placeholder="hh:mm" readOnly={true} />
      </div>

      <div className="mt-8 flex justify-end">
        <Iceberg />
      </div>
    </div>
  );
}
