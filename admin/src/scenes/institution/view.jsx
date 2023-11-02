import React, { useState } from "react";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, ModalConfirmation, Label, InputText } from "@snu/ds/admin";
import { HiPlus, HiOutlinePencil, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { VscCopy } from "react-icons/vsc";
import InstitutionIcon from "@/components/drawer/icons/Institution";
import ClasseIcon from "@/components/drawer/icons/Classe";

export default function view() {
  const [form, setForm] = useState({ name: "Lycée Professionnel Marie Laurencin" });
  const [contacts] = useState([
    { name: "Estelle PÉPIN", role: "Chef d’établissement", phone: "(+33) 06 05 04 03 02", email: "estelle.pepin@ac-paris.fr" },
    { name: "Maxime PISTACHE", role: "Coordinateur d’établissement", phone: "(+33) 06 07 08 09 01", email: "maxime.pistache@ac-paris.fr" },
  ]);
  const [modalChef, setModalChef] = useState(false);
  const [modalSousChef, setModalSousChef] = useState(false);

  return (
    <Page>
      <Header
        title={form.name}
        breadcrumb={[{ title: <InstitutionIcon className="scale-[65%]" /> }, { title: "Fiche de mon établissement" }]}
        actions={[
          <Button key="modal-sous-chef" className="ml-2" type="secondary" title="Modal 1ère connexion Référent de classe" onClick={() => setModalSousChef(true)} />,
          <Button key="modal-chef" className="ml-2" type="secondary" title="Modal 1ère connexion Chef d'ét." onClick={() => setModalChef(true)} />,
        ]}
      />
      <Container title="Contacts" actions={[
          <a key="list-users" href="/utilisateurs">
            <Button type="tertiary" title="Voir mon équipe" />
          </a>,
        ]}>
        <div className="flex items-stretch justify-between">
          {contacts.map((contact, index) => <div key={contact.email} className="flex-1 shrink-0 flex items-stretch justify-between">
            <div>
              <div className="text-base font-bold text-ds-gray-900">{contact.name}</div>
              <div className="mb-4 text-ds-gray-500">{contact.role}</div>
              <div className="flex items-center justify-start mb-2"><HiOutlinePhone size={20} className="mr-2" />{contact.phone}</div>
              <div className="flex items-center justify-start"><HiOutlineMail size={20} className="mr-2" /> {contact.email} <VscCopy size={20} className="ml-2 text-gray-400 cursor-pointer" /></div>
            </div>
            {index < contacts.length - 1 && <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>}
          </div>)}
        </div>
      </Container>
      <Container title="Informations générales" actions={[<Button key="update" type="change" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" />]}>
        <div className="flex items-stretch justify-between">
          <div className="flex-1 shrink-0">
            <Label title="Nom de l’établissement" tooltip="This is a test and need to be replaced." />
            <InputText className="mb-4" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Label title="Adresse postale" tooltip="This is a test and need to be replaced." />
            <InputText className="mb-3" label="Numéro et nom de la voie" />
            <div className="flex items-stretch justify-stretch gap-3 mb-3">
              <InputText className="flex-1" label="Code postal" />
              <InputText className="flex-1" label="Ville" />
            </div>
            <div className="flex items-stretch justify-stretch gap-3 mb-3">
              <InputText className="flex-1" label="Département" />
              <InputText className="flex-1" label="Région" />
            </div>
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1 shrink-0">
            <Label title="Type d’établissement" tooltip="This is a test and need to be replaced." />
            <InputText className="mb-4" value="Lycée professionnel" />
            <Label title="Filière" tooltip="This is a test and need to be replaced." />
            <InputText className="mb-4" value="Autres" />
          </div>
        </div>
      </Container>

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
