import React, { useState } from "react";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, ModalConfirmation } from "@snu/ds/admin";
import { HiPlus } from "react-icons/hi";
import InstitutionIcon from "@/components/drawer/icons/Institution";
import ClasseIcon from "@/components/drawer/icons/Classe";

export default function view() {
  const [modalChef, setModalChef] = useState(false);
  const [modalSousChef, setModalSousChef] = useState(false);

  return (
    <Page>
      <Header
        title="Mon établissement"
        breadcrumb={[{ title: <InstitutionIcon className="scale-[65%]" /> }, { title: "Mon établissement" }]}
        actions={[
          <Button key="modal-sous-chef" className="ml-2" type="secondary" title="Modal 1ère connexion Référent de classe" onClick={() => setModalSousChef(true)} />,
          <Button key="modal-chef" className="ml-2" type="secondary" title="Modal 1ère connexion Chef d'ét." onClick={() => setModalChef(true)} />,
        ]}
      />
      <Container title="bla bla bla" />

      {/* INSTITUTION_CHEF */}
      <ModalConfirmation
        isOpen={modalChef}
        onClose={() => setModalChef(false)}
        icon={<ProfilePic initials="ep" />}
        title="Bonjour Estelle PÉPIN !"
        text="Bienvenue sur votre compte SNU Responsable Classe engagée en tant que Chef d’établissement. Vous pouvez créer une classe engagée et ajouter un référent d’établissement."
        actions={[
          { title: "Créer une classe engagée", leftIcon: <ClasseIcon />, onClick: () => (window.location.href = "/mes-classes/create") },
          { title: "Ajouter un coordinateur", leftIcon: <HiPlus />, onClick: () => console.info("Ajouter un coordinateur") },
        ]}
      />
      {/* INSTITUTION_SOUS_CHEF */}
      <ModalConfirmation
        isOpen={modalSousChef}
        onClose={() => setModalSousChef(false)}
        icon={<ProfilePic initials="ap" />}
        title="Bonjour Amandine PIGNON !"
        text="Bienvenue sur votre compte SNU en tant que Référent de classe. Vous pouvez compléter la fiche de votre classe en renseignant toutes les informations."
        actions={[
          { title: "Fermer", isCancel: true },
          { title: "Compléter les informations", leftIcon: <ClasseIcon />, onClick: () => console.info("Compléter les informations") },
        ]}
      />
    </Page>
  );
}
