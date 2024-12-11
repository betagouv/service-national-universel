import { ClasseService } from "@/services/classeService";
import { Button, Label, Modal } from "@snu/ds/admin";
import React from "react";
import { toastr } from "react-redux-toastr";
import { FunctionalException, translateModifierClasse } from "snu-lib";
import { ReferentModifier } from "./ReferentInfosModifierModal";

interface ReferentInfosConfirmerProps {
  classeId: string;
  previousReferent: ReferentModifier;
  referent: ReferentModifier;
  isOpen: boolean;
  onModalClose: () => void;
  onConfirmer: (referent?: ReferentModifier) => void;
}

export const ReferentInfosConfirmerModal = ({ classeId, previousReferent, referent, isOpen, onModalClose, onConfirmer }: ReferentInfosConfirmerProps) => {
  const handleConfirmer = async (): Promise<void> => {
    try {
      const modifierReferentResponse = await ClasseService.modifierReferentClasse(classeId, referent);
      onConfirmer(modifierReferentResponse);
      toastr.success("Opération réussie", "Le référent a été mis à jour");
    } catch (error) {
      if (error instanceof FunctionalException) {
        toastr.error("Erreur", `${translateModifierClasse(error?.message)} - Erreur : ${error?.correlationId}`);
      }
    }
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onClose={onModalClose}
        className="md:max-w-[800px]"
        header={<h2 className="m-0 text-center text-xl leading-7">Confirmer le changement de référent de classe</h2>}
        content={
          <div className="mt-4 flex">
            <div className="flex flex-col w-full">
              <Label title="Ancien référent de classe" name="previousReferent" />
              <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
                <p>
                  <span className="text-gray-500">Nom : </span>
                  {previousReferent.nom}
                </p>
                <p>
                  <span className="text-gray-500">Prénom : </span>
                  {previousReferent.prenom}
                </p>
                <p>
                  <span className="text-gray-500">Email : </span>
                  {previousReferent.email}
                </p>
              </div>

              <Label title="Nouveau référent de classe" name="currentReferent" />
              <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
                <p>
                  <span className="text-gray-500">Nom : </span>
                  {referent.nom}
                </p>
                <p>
                  <span className="text-gray-500">Prénom : </span>
                  {referent.prenom}
                </p>
                <p>
                  <span className="text-gray-500">Email : </span>
                  {referent.email}
                </p>
              </div>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={onModalClose} />
            <Button title="Confirmer" className="flex-1" onClick={handleConfirmer} />
          </div>
        }
      />
    </div>
  );
};
