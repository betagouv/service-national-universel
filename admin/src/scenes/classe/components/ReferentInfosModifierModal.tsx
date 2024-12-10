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

  const handleValiderClick = () => {
    onValider(editedReferent);
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        className="md:max-w-[800px]"
        content={
          <div className="p-8">
            <h2 className="text-xl font-bold mb-4">Edit Referent Information</h2>
            <div className="flex flex-col gap-4">
              <InputText
                name="refName"
                className="mb-3"
                value={editedReferent.nom || ""}
                label={"Nom"}
                onChange={(e) => setEditedReferent({ ...editedReferent, nom: e.target.value })}
              />
              <InputText
                name="refPrenom"
                className="mb-3"
                value={editedReferent.prenom || ""}
                label={"Prenom"}
                onChange={(e) => setEditedReferent({ ...editedReferent, prenom: e.target.value })}
              />
              <InputText
                name="refEmail"
                className="mb-3"
                value={editedReferent.email || ""}
                label={"Email"}
                onChange={(e) => setEditedReferent({ ...editedReferent, email: e.target.value })}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">... ou choisissez un autre referent de classe existant</p>
            </div>
            <div>
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
