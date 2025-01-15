import { PersonCircle } from "@/assets/icons/PersonCircle";
import { Button, Modal } from "@snu/ds/admin";
import React from "react";
import { ReferentModifier } from "./ReferentInfosModifierModal";

interface ReferentInfosConfirmerProps {
  previousReferent: ReferentModifier;
  referent: ReferentModifier;
  isOpen: boolean;
  isPending: boolean;
  onModalClose: () => void;
  onConfirmer: () => void;
}

export const ReferentInfosConfirmerModal = ({ previousReferent, referent, isOpen, isPending, onModalClose, onConfirmer }: ReferentInfosConfirmerProps) => {
  return (
    <div>
      <Modal
        isOpen={isOpen}
        onClose={onModalClose}
        className="md:max-w-[700px]"
        header={
          <div className="flex flex-col items-center">
            <PersonCircle className="mb-4" />
            <h2 className="m-0 text-center text-xl leading-7">Modifier le référent de classe</h2>
          </div>
        }
        content={
          <div className="p-2 mt-0">
            <div className="flex flex-col w-full">
              <h2 className="text-base font-bolt mt-0">Ancien référent de classe</h2>
              <div className="flex flex-col gap-1 py-[10px]">
                <p className="flex place-content-between">
                  <span className="text-gray-500">Nom </span>
                  {previousReferent.nom}
                </p>
                <p className="flex place-content-between">
                  <span className="text-gray-500">Prénom </span>
                  {previousReferent.prenom}
                </p>
                <p className="flex place-content-between">
                  <span className="text-gray-500">Email </span>
                  {previousReferent.email}
                </p>
              </div>
              <h2 className="text-base font-bolt mt-0">Nouveau référent de classe</h2>
              <div className="mb-2 flex flex-col gap-1 py-[10px]">
                <p className="flex place-content-between">
                  <span className="text-gray-500">Nom </span>
                  {referent.nom}
                </p>
                <p className="flex place-content-between">
                  <span className="text-gray-500">Prénom </span>
                  {referent.prenom}
                </p>
                <p className="flex place-content-between">
                  <span className="text-gray-500">Email </span>
                  {referent.email}
                </p>
              </div>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={onModalClose} />
            <Button loading={isPending} title="Confirmer" className="flex-1" onClick={onConfirmer} />
          </div>
        }
      />
    </div>
  );
};
