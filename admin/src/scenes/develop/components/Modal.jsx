import React, { useState } from "react";
import { Button, Container, Modal } from "@snu/ds/admin";
import { HiOfficeBuilding } from "react-icons/hi";
import { BsSend } from "react-icons/bs";
import { VscCopy } from "react-icons/vsc";
import { ProfilePic } from "@snu/ds";

export default function ModalExamples() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);

  return (
    <Container title="Modals">
      <div className="flex">
        <Button title="Open modal classic" className="mr-2" onClick={() => setIsOpen(true)} />
        <Button title="Open modal center" onClick={() => setIsOpen2(true)} />
      </div>

      {/* Classic */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Fermer" type="secondary" className="flex-1" onClick={() => setIsOpen(false)} />
            <Button leftIcon={<HiOfficeBuilding />} title="Compléter les informations" className="flex-1" onClick={() => setIsOpen(false)} />
          </div>
        }>
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
      </Modal>

      {/* Center */}
      <Modal
        isOpen={isOpen2}
        onClose={() => setIsOpen2(false)}
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button leftIcon={<VscCopy />} title="Copier le lien" type="secondary" className="flex-1" onClick={() => setIsOpen2(false)} />
          </div>
        }>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <ProfilePic icon={(size, className) => <BsSend size={size} className={className} />} className="mb-6 mx-2" />
          </div>
          <h1 className="mb-6 font-bold text-xl">Invitez des élèves à rejoindre votre classe !</h1>
          <p className="mb-6 text-lg">
            Vous pouvez inviter des élèves à rejoindre votre classe en leur partageant ce lien : https://moncompte.snu.gouv.fr/classe-engagee/075IDF765098
          </p>
        </div>
      </Modal>
    </Container>
  );
}
