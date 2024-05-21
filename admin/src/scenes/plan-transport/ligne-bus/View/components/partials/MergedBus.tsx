import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import cx from "classnames";
import { useMutation } from "@tanstack/react-query";

import { HiOutlineEye, HiOutlinePlusCircle, HiOutlineTrash } from "react-icons/hi";

import { Bus, RouteResponse } from "@/types";
import API from "@/services/api";
import AddMergedBusModal from "./AddMergedBusModal";

interface Props {
  bus: Bus;
  readonly?: boolean;
  onBusChange: (bus: Props["bus"]) => void;
}

export default function MergedBus({ bus, readonly, onBusChange }: Props) {
  const [showAddMergeLine, setShowAddMergeLine] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ mergedBusId }: { mergedBusId: string }): Promise<RouteResponse<Bus>> => {
      const response = await API.remove(`/ligne-de-bus/${bus._id}/ligne-fusionnee/${mergedBusId}`);
      if (!response.ok) {
        throw Error(response.code);
      }
      return response;
    },
  });

  const handleDeleteMergedBus = (mergedBusId) => {
    mutate(
      {
        mergedBusId,
      },
      {
        onSuccess: (response) => {
          toastr.success("La ligne fusionnée a bien été supprimée", "");
          onBusChange(response.data);
        },
        onError: (e) => {
          console.log(e);
          toastr.error("Une erreur est survenue lors de la suppression de la ligne fusionnée", e.message);
        },
      },
    );
  };

  const mergedBusDetail = bus.mergedBusDetail?.filter((mb) => mb.busId !== bus.busId) || [];

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
      {mergedBusDetail.map((mb) => (
        <div key={mb.busId} className="flex justify-between border-b-[1px] last:border-b-0 border-gray-200">
          <div className="flex flex-col py-3">
            <div className="text-md font-bold">{mb.busId}</div>
            <div className="text-xs gray-500">{mb.youngSeatsTaken} volontaires</div>
          </div>
          <div className="flex items-center gap-2">
            <Link className="flex justify-center items-center bg-blue-50 rounded-full w-8 h-8" to={`/ligne-de-bus/${mb._id}`}>
              <HiOutlineEye className="text-blue-600 w-4 h-4" />
            </Link>
            {!readonly && (
              <button onClick={() => handleDeleteMergedBus(mb.busId)} disabled={isPending} className="flex justify-center items-center bg-gray-100 rounded-full w-8 h-8">
                <HiOutlineTrash className={cx(" w-4 h-4", { "text-red-600": !isPending, "text-gray-400": isPending })} />
              </button>
            )}
          </div>
        </div>
      ))}
      {!mergedBusDetail.length && <p className="text-gray-400 mt-3">Aucune ligne fusionnée</p>}
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
