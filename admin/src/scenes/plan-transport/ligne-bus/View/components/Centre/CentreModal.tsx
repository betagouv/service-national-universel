import React from "react";
import { Button, Modal } from "@snu/ds/admin";
import XCircleFull from "@/assets/icons/XCircleFull";
import CheckCircleFull from "@/assets/icons/CheckCircleFull";
import { useToggle } from "react-use";
import { LigneBusDto, SENDINBLUE_TEMPLATES } from "snu-lib";
import CentreLabel from "./CentreLabel";
import { TfiReload } from "react-icons/tfi";
import { HiExternalLink } from "react-icons/hi";
import useSessions from "@/scenes/plan-transport/lib/useSessionsByCohort";
import { CentreFormValues } from ".";

interface ConfirmChangesModalProps {
  isOpen: boolean;
  count: number;
  initialData: LigneBusDto;
  formData: { sessionId: string; centerArrivalTime: string; centerDepartureTime: string };
  onConfirm: (data: CentreFormValues, emailing: boolean) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CentreModal({ isOpen, initialData, formData, count, onConfirm, onCancel, isLoading }: ConfirmChangesModalProps) {
  const [isEmailing, toggleEmailing] = useToggle(false);
  const templateId = SENDINBLUE_TEMPLATES.young.PHASE_1_CHANGEMENT_CENTRE;
  const templateIdReferent = SENDINBLUE_TEMPLATES.CLE.PHASE_1_MODIFICATION_LIGNE;
  const isCLE = initialData.cohort.includes("CLE");
  const { data } = useSessions(initialData.cohort);
  const initialSession = data?.find((s) => s._id === initialData.sessionId);
  const newSession = data?.find((s) => s._id === formData.sessionId);

  const handleConfirm = () => {
    onConfirm(formData, isEmailing);
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
                centerDetail={initialSession?.cohesionCenter}
                centerArrivalTime={initialData.centerArrivalTime}
                centerDepartureTime={initialData.centerDepartureTime}
                icon={<XCircleFull className="text-red-500" />}
              />
            </div>

            <div>
              <p className="text-xs font-medium">Nouveau centre</p>
              <CenterCard
                centerDetail={newSession?.cohesionCenter}
                centerArrivalTime={formData.centerArrivalTime!}
                centerDepartureTime={formData.centerDepartureTime!}
                icon={<CheckCircleFull className="text-green-500" />}
              />
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 w-full pt-8">
            <label className="flex items-start space-x-2">
              <input type="checkbox" className="mt-1" checked={isEmailing} onChange={toggleEmailing} />
              <div className="leading-relaxed">
                <p>Envoyer une campagne d’emailing aux volontaires ({count}) et à leurs représentants légaux.</p>
                {isCLE && <p>Les référent de classe, chef d’établissement et coordinateurs seront également prévenus.</p>}
                <div className="mt-2">
                  <a href={`/email-preview/${templateId}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-800 underline underline-offset-2">
                    Visualiser l'aperçu pour les volontaires
                    <HiExternalLink className="inline-block w-4 h-4 ml-1" />
                  </a>
                  <br />
                  {isCLE && (
                    <a href={`/email-preview/${templateIdReferent}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-800 underline underline-offset-2">
                      Visualiser l'aperçu pour les référents CLE
                      <HiExternalLink className="inline-block w-4 h-4 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </label>
          </div>
          <br />
        </div>
      }
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button title="Annuler" type="secondary" onClick={onCancel} className="w-full" />
          <Button title={isLoading ? "Modification en cours" : "Oui, valider"} onClick={handleConfirm} disabled={isLoading} className="w-full" />
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
