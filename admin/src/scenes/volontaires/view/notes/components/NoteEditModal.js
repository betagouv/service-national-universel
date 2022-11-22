import { Modal } from "reactstrap";

import React from "react";
import { PlainButton, BorderButton } from "../../../../plan-transport/components/Buttons";
import danger from "../../../../../assets/danger.svg";
import Field from "../../../../phase0/components/Field";

import { phaseOptions, getPhaseLabel } from "../utils";

const NoteEditModal = ({ isOpen, onClose, isLoading, onSave, note, updateNote }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <div className="p-6 flex flex-col items-center w-[512px]">
        <div className="text-xl font-medium mb-4">Ajouter une note interne</div>
        <Field
          value={note.phase}
          onChange={updateNote("phase")}
          className="w-[100%] mb-4"
          label="Ma note concerne..."
          mode="edition"
          type="select"
          options={phaseOptions}
          transformer={getPhaseLabel}
        />
        <Field value={note.note} onChange={updateNote("note")} className="w-[100%] mb-4" label="Rédigez votre note ici." mode="edition" type="textarea" maxLength={500} />
        <div className="mb-4 text-[13px]">
          <div className="flex">
            <img src={danger} alt="icon danger" />
            <div className="ml-1">
              Veuillez n’inclure aucune <span className="font-bold">information relative à des données sensibles (santé, religion, etc.).</span>{" "}
              <a
                className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline"
                href="https://www.cnil.fr/fr/definition/donnee-sensible"
                target="_blank"
                rel="noreferrer">
                Plus d’informations
              </a>
            </div>
          </div>
        </div>
        <div className="flex justify-between w-[100%]">
          <BorderButton className="grow mr-2" onClick={onClose}>
            Retour
          </BorderButton>
          <PlainButton className="grow ml-2" onClick={() => onSave(note)} spinner={isLoading} disabled={isLoading || note.length === 0}>
            Enregistrer
          </PlainButton>
        </div>
      </div>
    </Modal>
  );
};

export default NoteEditModal;
