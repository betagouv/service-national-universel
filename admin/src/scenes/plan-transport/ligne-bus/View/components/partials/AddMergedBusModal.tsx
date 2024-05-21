import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { HiOutlinePlusCircle } from "react-icons/hi";

import { Button, InputText, Modal } from "@snu/ds/admin";
import { ERRORS } from "snu-lib";

import { Bus, RouteResponse } from "@/types";
import API from "@/services/api";

interface Props {
  isOpen: boolean;
  onClose: (bus?: Bus) => void;
  bus: Bus;
}

export default function AddMergedBusModal({ bus, isOpen, onClose }: Props) {
  const [mergedBusId, setMergedBusId] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ mergedBusId }: { mergedBusId: string }): Promise<RouteResponse<Bus>> => {
      const response = await API.post(`/ligne-de-bus/${bus._id}/ligne-fusionnee/`, { mergedBusId });
      if (!response.ok) {
        throw Error(response.code);
      }
      return response;
    },
  });

  const handleSubmit = () => {
    mutate(
      {
        mergedBusId,
      },
      {
        onSuccess: (response) => {
          toastr.success("La ligne fusionnée a bien été ajoutée", "");
          setMergedBusId("");
          onClose(response.data);
        },
        onError: (e: any) => {
          let message = e.code;
          switch (e.code) {
            case ERRORS.NOT_FOUND: {
              message = `Ligne de bus introuvable dans le PDT ${bus.cohort}`;
              break;
            }
            case ERRORS.ALREADY_EXISTS: {
              message = "Ligne de bus déjà fusionnée avec cette ligne";
              break;
            }
          }

          toastr.error("Une erreur est survenue lors de l'ajout de la ligne fusionnée", message);
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      content={
        <div className="flex flex-col items-center text-center gap-6 mb-12">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
              <HiOutlinePlusCircle className="w-6 h-6" />
            </div>
          </div>
          <h1 className="font-bold text-xl">Fusionner une ligne</h1>
          <p className="text-lg">
            Avec quelle ligne souhaitez-vous fusionner la ligne <b>{bus.busId}</b> :
          </p>
          <InputText name="busId" placeholder="Saisir une ligne de bus" value={mergedBusId} onChange={(e) => setMergedBusId(e.target.value)} className="w-full" />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-6">
          <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={() => onClose()} />
          <Button disabled={isPending || mergedBusId.length !== 9} onClick={handleSubmit} title="Confirmer" className="flex-1" />
        </div>
      }
    />
  );
}
