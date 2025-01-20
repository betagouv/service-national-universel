import React from "react";
import { Button, Modal } from "@snu/ds/admin";
import { PointDeRassemblementFormValueChanges } from "./PointDeRassemblement";
import XCircleFull from "@/assets/icons/XCircleFull";
import CheckCircleFull from "@/assets/icons/CheckCircleFull";
import PointDeRassemblementLabel from "./PointDeRassemblementLabel";
import { useToggle } from "react-use";
import { CohortType, SENDINBLUE_TEMPLATES } from "snu-lib";

interface ConfirmChangesModalProps {
  isOpen: boolean;
  cohort: CohortType | null;
  beforeChangeFormData: PointDeRassemblementFormValueChanges;
  afterChangeFormData: PointDeRassemblementFormValueChanges;
  onConfirm: (emailing: boolean) => void;
  onCancel: () => void;
}

export default function ConfirmChangesModal({ isOpen, cohort, beforeChangeFormData, afterChangeFormData, onConfirm, onCancel }: ConfirmChangesModalProps) {
  const [isEmailing, toggleEmailing] = useToggle(false);

  // CHANGE_PDR_BEFORE_DEPARTURE: this default template is used.
  let templateId: string | null = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_DEPARTURE;
  if (!cohort) {
    templateId = null;
  } else if (new Date() < new Date(cohort.dateStart)) {
    templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_DEPARTURE;
  } else if (new Date() < new Date(cohort.dateEnd)) {
    templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_RETURN;
  }

  const handleConfirm = () => {
    onConfirm(isEmailing);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      className="md:max-w-[800px]"
      content={
        <div className="scroll-y-auto overflow-y-auto max-h-[80vh]">
          <div className="flex flex-col items-center text-center gap-6 mb-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50"></div>
            </div>
            <h1 className="font-bold text-xl m-0">Êtes-vous sûr(e) de vouloir changer de point de rassemblement ?</h1>
          </div>
          <div className="flex items-start flex-col w-full gap-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ancien point */}
              <div className="bg-gray-50 p-6 rounded-xl relative">
                <XCircleFull className="w-6 h-6 text-red-500 absolute top-2 left-5" />

                <div className="mt-3">
                  <div className="my-3">
                    <PointDeRassemblementLabel pdr={beforeChangeFormData} showLink={false} />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold mb-2">Aller</span>
                      <div className="space-y-1 text-gray-600">
                        <p>Heure d'arrivée du transport : {beforeChangeFormData.busArrivalHour}</p>
                        <p>Heure de convocation : {beforeChangeFormData.meetingHour}</p>
                        <p>Heure de départ : {beforeChangeFormData.departureHour}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold mb-2">Retour</span>
                      <div className="text-gray-600">
                        <p>Heure d'arrivée : {beforeChangeFormData.returnHour}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nouveau point */}
              <div className="bg-gray-50 p-6 rounded-xl relative">
                <CheckCircleFull className="w-6 h-6 text-green-500 absolute top-2 left-5" />

                <div className="mt-3">
                  <div className="my-3">
                    <PointDeRassemblementLabel pdr={afterChangeFormData} showLink={false} />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold mb-2">Aller</span>
                      <div className="space-y-1 text-gray-600">
                        <p>Heure d'arrivée du transport : {afterChangeFormData.busArrivalHour}</p>
                        <p>Heure de convocation : {afterChangeFormData.meetingHour}</p>
                        <p>Heure de départ : {afterChangeFormData.departureHour}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold mb-2">Retour</span>
                      <div className="text-gray-600">
                        <p>Heure d'arrivée : {afterChangeFormData.returnHour}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 w-full pt-8">
              <label className="flex items-start space-x-2">
                <input type="checkbox" className="mt-1" checked={isEmailing} onChange={toggleEmailing} />
                <div className="flex flex-col items-start">
                  <span>Envoyer une campagne d'emailing aux représentants légaux.</span>
                  {templateId ? (
                    <a href={`/email-preview/${templateId}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-800 underline inline-flex items-center">
                      Visualiser l'aperçu
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : null}
                </div>
              </label>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-6">
          <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={onCancel} />
          <Button title="Oui, valider" onClick={handleConfirm} className="flex-1" />
        </div>
      }
    />
  );
}
