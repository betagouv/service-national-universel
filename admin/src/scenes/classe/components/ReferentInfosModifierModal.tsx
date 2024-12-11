import { PersonCircle } from "@/assets/icons/PersonCircle";
import { ReferentService } from "@/services/referentService";
import { debouncePromise } from "@/utils";
import { Button, InputText, Modal, Select } from "@snu/ds/admin";
import React, { useState } from "react";
import { ROLES } from "snu-lib";

interface ReferentInfosModifierProps {
  referent: ReferentModifier;
  isOpen: boolean;
  onModalClose: () => void;
  onValider(referent: ReferentModifier): void;
}

export type ReferentModifier = {
  id?: string;
  nom?: string;
  prenom?: string;
  email: string;
};

type SelectOption = {
  value: string;
  label: string;
};

export const ReferentInfosModifierModal = ({ referent: currentReferent, isOpen, onModalClose: handleModalClose, onValider }: ReferentInfosModifierProps) => {
  const [editedReferent, setEditedReferent] = useState<ReferentModifier>(currentReferent);
  const [errors, setErrors] = useState<Omit<ReferentModifier, "id"> | undefined>();

  const handleSelectChange = (referent: (SelectOption & ReferentModifier) | undefined) => {
    if (referent) {
      setEditedReferent({ nom: referent?.nom, prenom: referent?.prenom, email: referent?.value });
    }
  };

  const handleReferentsClasseSearch = debouncePromise(async (searchTerm: string): Promise<any> => {
    if (searchTerm?.length < 2) {
      return [];
    }
    const referents = await ReferentService.getByRole({ role: ROLES.REFERENT_CLASSE, search: searchTerm });
    return (
      referents?.map((referent) => ({
        value: referent.email?.toString() || "",
        label: `${referent.email?.toString()} - ${referent.nom} ${referent.prenom}`,
        nom: referent.nom,
        prenom: referent.prenom,
      })) || []
    );
  }, 500);

  const validateForm = () => {
    const newErrors = {} as Omit<ReferentModifier, "id">;
    if (!editedReferent.nom) {
      newErrors.nom = "Le nom est obligatoire";
    }
    if (!editedReferent.prenom) {
      newErrors.prenom = "Le prénom est obligatoire";
    }
    if (!editedReferent.email) {
      newErrors.email = "L'email est obligatoire";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleValiderClick = () => {
    if (validateForm()) {
      onValider(editedReferent);
    }
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        className="md:max-w-[700px]"
        header={
          <div className="flex flex-col items-center">
            <PersonCircle className="mb-4" />
            <h2 className="m-0 text-center text-xl leading-7">Modifier le référent de classe</h2>
          </div>
        }
        content={
          <div className="p-2 mt-0">
            <h2 className="text-base font mt-0 mb-4">Modifiez les informations de ce référent de classe ...</h2>
            <div className="flex flex-col gap-4">
              <InputText
                name="refName"
                className="mb-1"
                value={editedReferent.nom || ""}
                label={"Nom"}
                onChange={(e) => setEditedReferent({ ...editedReferent, nom: e.target.value })}
                error={errors?.nom}
              />
              <InputText
                name="refPrenom"
                className="mb-1"
                value={editedReferent.prenom || ""}
                label={"Prénom"}
                onChange={(e) => setEditedReferent({ ...editedReferent, prenom: e.target.value })}
                error={errors?.prenom}
              />
              <InputText
                name="refEmail"
                className="mb-4"
                value={editedReferent.email || ""}
                label={"Adresse email"}
                onChange={(e) => setEditedReferent({ ...editedReferent, email: e.target.value })}
                error={errors?.email}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-4">... ou choisissez un autre referent de classe existant</p>
            </div>
            <div className="mb-1">
              <Select
                value={""}
                placeholder="Choisir un référent existant"
                isClearable={true}
                onChange={handleSelectChange}
                isAsync
                noOptionsMessage="Aucun référent de classe n'a été trouvé - Ecrivez au moins deux lettres"
                loadOptions={handleReferentsClasseSearch}
              />
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={handleModalClose} />
            <Button disabled={editedReferent === undefined} title="Valider" className="flex-1" onClick={handleValiderClick} />
          </div>
        }
      />
    </div>
  );
};
