import React from "react";
import { Button, Modal } from "@snu/ds/admin";
import XCircleFull from "@/assets/icons/XCircleFull";
import CheckCircleFull from "@/assets/icons/CheckCircleFull";
import { useToggle } from "react-use";
import { LigneBusDto } from "snu-lib";
import CentreLabel from "./CentreLabel";
import { TfiReload } from "react-icons/tfi";
import { HiExternalLink } from "react-icons/hi";

interface ConfirmChangesModalProps {
  isOpen: boolean;
  count: number;
  initialData: LigneBusDto;
  formData: Partial<LigneBusDto>;
  onConfirm: (emailing: boolean) => void;
  onCancel: () => void;
}

export default function CentreModal({ isOpen, initialData, formData, count, onConfirm, onCancel }: ConfirmChangesModalProps) {
  const [isEmailing, toggleEmailing] = useToggle(false);
  const templateId = "2276";

  const handleConfirm = () => {
    onConfirm(isEmailing);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      className="max-w-3xl"
      content={
        <div className="scroll-y-auto overflow-y-auto">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
              <TfiReload className="w-5 h-5 text-gray-800" />
            </div>
            <h1 className="font-medium text-xl max-w-sm">Êtes-vous sûr(e) de vouloir changer de centre de cohésion&nbsp;?</h1>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium">Ancien centre</p>
              <CenterCard
                centerDetail={initialData.centerDetail!}
                centerArrivalTime={initialData.centerArrivalTime}
                centerDepartureTime={initialData.centerDepartureTime}
                icon={<XCircleFull className="text-red-500" />}
              />
            </div>

            <div>
              <p className="text-xs font-medium">Nouveau centre</p>
              <CenterCard
                centerDetail={formData.centerDetail!}
                centerArrivalTime={formData.centerArrivalTime!}
                centerDepartureTime={formData.centerDepartureTime!}
                icon={<CheckCircleFull className="text-green-500" />}
              />
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 w-full pt-8">
            <label className="flex items-start space-x-2">
              <input type="checkbox" className="mt-1" checked={isEmailing} onChange={toggleEmailing} />
              <div>
                <p>Envoyer une campagne d’emailing aux volontaires ({count}) et à leurs représentants légaux.</p>
                <a href={`/email-preview/${templateId}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-800 underline underline-offset-2">
                  Visualiser l'aperçu
                  <HiExternalLink className="inline-block w-4 h-4 ml-1" />
                </a>
              </div>
            </label>
          </div>
          <br />
        </div>
      }
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button title="Annuler" type="secondary" onClick={onCancel} className="w-full" />
          <Button title="Oui, valider" onClick={handleConfirm} className="w-full" />
        </div>
      }
    />
  );
}

function CenterCard({ centerDetail, centerArrivalTime, centerDepartureTime, icon }) {
  return (
    <div className="mt-2 bg-gray-50 p-3 rounded-xl">
      <div className="mb-2">{icon}</div>
      <CentreLabel centre={centerDetail} showLink={false} />
      <div className="mt-2 font-light text-xs text-gray-500">
        <p>Heure d'arrivée : {centerArrivalTime}</p>
        <p>Heure de départ : {centerDepartureTime}</p>
      </div>
    </div>
  );
}
