import React from "react";
import { HiOutlineEye } from "react-icons/hi";

import { ModalConfirmation } from "@snu/ds/admin";

import { Etablissement } from "./type";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  etablissement: Etablissement;
  onConfirmSubmit: () => void;
}

export default function ModaleConfirmation({ isOpen, onClose, etablissement, onConfirmSubmit }: Props) {
  return (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[650px]"
      icon={<HiOutlineEye className="bg-gray-100 rounded-full p-2" size={48} />}
      title="Validation des informations saisies"
      text={
        <div className="mt-8 text-base leading-6 font-normal text-gray-900 mx-1">
          <h1 className="font-bold text-start mb-3">Informations générales</h1>
          <div className="flex justify-between">
            <div className=" flex-col justify-start text-start">
              <p>UAI :</p>
              <p>Adresse email :</p>
              <p>Nom :</p>
              <p>Prénom :</p>
            </div>
            <div className="flex-col justify-start text-end">
              <p>{etablissement.uai}</p>
              <p>{etablissement.email}</p>
              <p>{etablissement.refLastName}</p>
              <p>{etablissement.refFirstName}</p>
            </div>
          </div>
        </div>
      }
      actions={[
        { title: "Modifier", isCancel: true },
        { title: "Valider", onClick: () => onConfirmSubmit() },
      ]}
    />
  );
}
