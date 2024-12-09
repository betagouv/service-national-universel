import { Button, InputText, Modal, Select } from "@snu/ds/admin";
import React, { useState } from "react";

interface ReferentInfosModifierProps {
  referent: Referent;
  isOpen: boolean;
  onModalClose: () => void;
}

interface Referent {
  id?: string;
  nom?: string;
  prenom?: string;
  email?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export const ReferentInfosModifier = ({ referent, isOpen, onModalClose: handleModalClose }: ReferentInfosModifierProps) => {
  const [editedReferent, setEditedReferent] = useState(referent);
  const [referentsClasse, setReferentsClasse] = useState<Referent[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //
  };

  const mapReferentsToOptions = (referents: Referent[]) => {
    const referentsOptions = referents.map((referent) => ({ value: referent.email?.toString() || "", label: `${referent.nom} ${referent.prenom}` }));
    setOptions(referentsOptions);
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
            <Select
              placeholder="Choisir un référent existant"
              options={options}
              value={options.find((option) => option.value === referent.email) ?? null}
              isClearable={true}
              onChange={handleSelectChange}
            />
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={handleModalClose} />
            {/* <Button disabled={isPending} onClick={() => mutate()} title="Confirmer" className="flex-1" /> */}
            <Button disabled title="Valider" className="flex-1" />
          </div>
        }
      />
    </div>
  );
};
