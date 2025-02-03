import React from "react";
import { Link } from "react-router-dom";

import { HiOutlineEye } from "react-icons/hi";

import { LigneBusDto } from "snu-lib";

interface Props {
  bus: LigneBusDto;
}

export default function MirrorBus({ bus }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div>Ligne miroir</div>
      </div>
      {bus.mirrorBusDetails && (
        <div key={bus.mirrorBusDetails.busId} className="flex justify-between border-b-[1px] last:border-b-0 border-gray-200">
          <div className="flex flex-col py-3">
            <div className="text-md font-bold">{bus.mirrorBusDetails.busId}</div>
            <div className="text-xs text-gray-500">{bus.mirrorBusDetails.youngSeatsTaken} volontaires</div>
          </div>
          <div className="flex items-center gap-2">
            <Link className="flex justify-center items-center bg-blue-50 hover:bg-blue-200 rounded-full w-8 h-8" to={`/ligne-de-bus/${bus.mirrorBusDetails._id}`}>
              <HiOutlineEye className="text-blue-600 w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
      {!bus.mirrorBusDetails && <p className="text-gray-400 mt-3">Aucune ligne miroir</p>}
    </div>
  );
}
