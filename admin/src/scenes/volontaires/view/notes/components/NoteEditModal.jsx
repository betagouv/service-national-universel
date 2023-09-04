import { Modal } from "reactstrap";

import React from "react";
import { PlainButton, BorderButton } from "../../../../plan-transport/components/Buttons";
import danger from "../../../../../assets/danger.svg";
import Field from "@/components/ui/forms/Field";

import { phaseOptions, getPhaseLabel } from "../utils";

const NoteEditModal = ({ isOpen, onClose, isLoading, onSave, note, updateNote }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <div className="flex w-[512px] flex-col items-center p-6">
        <div className="mb-4 text-xl font-medium">Ajouter une note interne</div>
        <Field
          name="phase"
          value={note.phase}
          onChange={(value, key) => updateNote(key, value)}
          className="mb-4 w-[100%]"
          label="Ma note concerne..."
          type="select"
          options={phaseOptions}
          transformer={getPhaseLabel}
        />
        <Field
          name="note"
          value={note.note}
          onChange={(value, key) => updateNote(key, value)}
          className="mb-4 w-[100%]"
          label="Rédigez votre note ici."
          type="textarea"
          maxLength={500}
        />
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
        <div className="flex w-[100%] justify-between">
          <BorderButton className="mr-2 grow" onClick={onClose}>
            Retour
          </BorderButton>
          <PlainButton className="ml-2 grow" onClick={() => onSave(note)} spinner={isLoading} disabled={isLoading || note.length === 0}>
            Enregistrer
          </PlainButton>
        </div>
      </div>
    </Modal>
  );
};

export default NoteEditModal;
