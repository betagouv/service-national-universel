import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import cx from "classnames";
import { useMutation } from "@tanstack/react-query";

import { HiOutlineTrash } from "react-icons/hi";

import { Bus, RouteResponse } from "@/types";
import API from "@/services/api";
import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  onBusChange: (bus: Bus) => void;
  bus: Bus;
  mergedBus: Pick<Bus, "_id" | "busId" | "totalCapacity" | "youngCapacity" | "youngSeatsTaken">;
}

export default function DeleteMergedBusButton({ bus, mergedBus, onBusChange }: Props) {
  const [showConfirmation, setShowConfirmation] = useState(false);

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
  return (
    <>
      <ModalConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        icon={<HiOutlineTrash size={48} className="text-gray-300" />}
        title="Êtes-vous sûr de vouloir supprimer cette ligne fusionnée ?"
        text={mergedBus.busId}
        actions={[
          { title: "Fermer", isCancel: true, onClick: () => setShowConfirmation(false) },
          { title: "Supprimer", isDestructive: true, onClick: () => handleDeleteMergedBus(mergedBus?.busId) },
        ]}
      />
      <button onClick={() => setShowConfirmation(true)} disabled={isPending} className="flex justify-center items-center bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8">
        <HiOutlineTrash className={cx(" w-4 h-4", { "text-red-600": !isPending, "text-gray-400": isPending })} />
      </button>
    </>
  );
}
