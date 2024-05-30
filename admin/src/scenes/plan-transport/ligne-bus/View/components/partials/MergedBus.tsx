import React, { useState } from "react";
import { Link } from "react-router-dom";

import { HiOutlineEye, HiOutlinePlusCircle } from "react-icons/hi";

import { BusDto } from "snu-lib/src/dto";

import AddMergedBusModal from "./AddMergedBusModal";
import DeleteMergedBusButton from "./DeleteMergedBusButton";

interface Props {
  bus: BusDto;
  readonly?: boolean;
  onBusChange: (bus: Props["bus"]) => void;
}

export default function MergedBus({ bus, readonly, onBusChange }: Props) {
  const [showAddMergeLine, setShowAddMergeLine] = useState(false);

  const mergedBusDetails = bus.mergedBusDetails?.filter((mb) => mb.busId !== bus.busId) || [];

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div>Lignes fusionnées</div>
        {!readonly && (
          <button disabled={!bus} onClick={() => setShowAddMergeLine(true)} className="flex items-center gap-2 text-blue-600">
            <HiOutlinePlusCircle className="w-4 h-4" />
            <div>Ajouter une ligne</div>
          </button>
        )}
      </div>
      {mergedBusDetails.map((mb) => (
        <div key={mb.busId} className="flex justify-between border-b-[1px] last:border-b-0 border-gray-200">
          <div className="flex flex-col py-3">
            <div className="text-md font-bold">{mb.busId}</div>
            <div className="text-xs gray-500">{mb.youngSeatsTaken} volontaires</div>
          </div>
          <div className="flex items-center gap-2">
            <Link className="flex justify-center items-center bg-blue-50 hover:bg-blue-200 rounded-full w-8 h-8" to={`/ligne-de-bus/${mb._id}`}>
              <HiOutlineEye className="text-blue-600 w-4 h-4" />
            </Link>
            {!readonly && <DeleteMergedBusButton bus={bus} onBusChange={onBusChange} mergedBus={mb} />}
          </div>
        </div>
      ))}
      {!mergedBusDetails.length && <p className="text-gray-400 mt-3">Aucune ligne fusionnée</p>}
      <AddMergedBusModal
        bus={bus}
        isOpen={showAddMergeLine}
        onClose={(bus) => {
          if (bus) onBusChange(bus);
          setShowAddMergeLine(false);
        }}
      />
    </div>
  );
}
