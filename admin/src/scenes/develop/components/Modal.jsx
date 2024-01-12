import React, { useState } from "react";
import { Button, Container, Modal, ModalConfirmation } from "@snu/ds/admin";
import { HiOfficeBuilding, HiOutlineCheckCircle, HiOutlineTrash } from "react-icons/hi";
import { BsSend } from "react-icons/bs";
import { VscCopy } from "react-icons/vsc";
import { ProfilePic } from "@snu/ds";

export default function ModalExamples() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpenConfirmation, setIsOpenConfirmation] = useState(false);
  const [isOpenConfirmationDestructive, setIsOpenConfirmationDestructive] = useState(false);

  return (
    <Container title="Modals">
      <div className="flex">
        <Button title="Open classic" className="mr-2" onClick={() => setIsOpen(true)} />
        <Button title="Open button center" className="mr-2" onClick={() => setIsOpen2(true)} />
        <Button title="Open confirmation" className="mr-2" onClick={() => setIsOpenConfirmation(true)} />
        <Button title="Open confirmation destructive" className="mr-2 bg-red-500 hover:bg-red-700" onClick={() => setIsOpenConfirmationDestructive(true)} />
      </div>

      {/* Classic */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center">
              <ProfilePic image="https://i.pravatar.cc/300" initials="ap" className="mb-6" />
              <ProfilePic initials="ap" className="mb-6 mx-2" />
              <ProfilePic className="mb-6" />
            </div>
            <h1 className="mb-6 font-bold text-xl">Bonjour Amandine PIGNON !</h1>
            <p className="mb-6 text-lg">
              Bienvenue sur votre compte SNU en tant que Référent de classe. Vous pouvez compléter la fiche de votre classe en renseignant toutes les informations.
            </p>
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Fermer" type="secondary" className="flex-1 justify-center" onClick={() => setIsOpen(false)} />
            <Button leftIcon={<HiOfficeBuilding />} title="Compléter les informations" className="flex-1" onClick={() => setIsOpen(false)} />
          </div>
        }
      />

      {/* Center */}
      <Modal
        isOpen={isOpen2}
        onClose={() => setIsOpen2(false)}
        content={
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center">
              <ProfilePic icon={({ size, className }) => <BsSend size={size} className={className} />} className="mb-6 mx-2" />
            </div>
            <h1 className="mb-6 font-bold text-xl">Invitez des élèves à rejoindre votre classe !</h1>
            <p className="mb-6 text-lg">
              Vous pouvez inviter des élèves à rejoindre votre classe en leur partageant ce lien : https://moncompte.snu.gouv.fr/classe-engagee/075IDF765098
            </p>
          </div>
        }
        footer={
          <div className="flex items-center justify-center">
            <Button leftIcon={<VscCopy />} title="Copier le lien" type="secondary" onClick={() => setIsOpen2(false)} />
          </div>
        }
      />

      {/* Confirmation */}
      <ModalConfirmation
        isOpen={isOpenConfirmation}
        onClose={() => setIsOpenConfirmation(false)}
        icon={<HiOutlineCheckCircle size={48} className="text-gray-300" />}
        title="Valider le dossier"
        text="Vous vous apprêtez à valider le dossier d’inscription de Marlon BRANDO. Un email sera automatiquement envoyé au volontaire."
        actions={[
          { title: "Fermer", isCancel: true, onClick: () => console.log("Fermer") },
          { title: "Valider", onClick: () => console.log("Valider") },
        ]}
      />

      {/* Confirmation Destructive */}
      <ModalConfirmation
        isOpen={isOpenConfirmationDestructive}
        onClose={() => setIsOpenConfirmationDestructive(false)}
        icon={<HiOutlineTrash size={48} className="text-gray-300" />}
        title="Êtes-vous sûr de vouloir supprimer ce dossier ?"
        text="Vous vous apprêtez à valider le dossier d’inscription de Marlon BRANDO. Un email sera automatiquement envoyé au volontaire."
        actions={[
          { title: "Fermer", isCancel: true, onClick: () => console.log("Fermer") },
          { title: "Supprimer", isDestructive: true, onClick: () => console.log("Supprimer") },
        ]}
      />
    </Container>
  );
}
