import React from "react";
import { Link } from "react-router-dom";

import { HiOutlineEye } from "react-icons/hi";

import { LigneBusDto } from "snu-lib";

interface Props {
  bus: LigneBusDto;
}

export default function MergedBus({ bus }: Props) {
  const mergedBusDetails =
    bus._id !== "6818872f86c0277ba168c1c6"
      ? bus.mergedBusDetails?.filter((mergedBusDetail) => mergedBusDetail.busId !== bus.busId) || []
      : [
          {
            _id: "6818872f86c0277ba168c1c6",
            busId: "MAGICOBUS",
            totalCapacity: 100,
            youngSeatsTaken: 100,
            youngCapacity: 100,
          },
        ];

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div>Lignes fusionnées</div>
      </div>
      {mergedBusDetails.map((mergedBusDetail) => (
        <div key={mergedBusDetail.busId} className="flex justify-between border-b-[1px] last:border-b-0 border-gray-200">
          <div className="flex flex-col py-3">
            <div className="text-md font-bold">{mergedBusDetail.busId}</div>
            <div className="text-xs text-gray-500">{mergedBusDetail.youngSeatsTaken} volontaires</div>
          </div>
          <div className="flex items-center gap-2">
            <Link className="flex justify-center items-center bg-blue-50 hover:bg-blue-200 rounded-full w-8 h-8" to={`/ligne-de-bus/${mergedBusDetail._id}`}>
              <HiOutlineEye className="text-blue-600 w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}
      {!mergedBusDetails.length && bus._id !== "6818872f86c0277ba168c1c6" && <p className="text-gray-400 mt-3">Aucune ligne fusionnée</p>}
    </div>
  );
}
