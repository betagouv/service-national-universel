import React, { useState } from "react";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, Label, InputText, ModalConfirmation } from "@snu/ds/admin";
import ClasseIcon from "@/components/drawer/icons/Classe";

export default function create() {
  const [form, setForm] = useState({});
  const [modalConfirmation, setModalConfirmation] = useState(false);

  const actions = [
    <a key="cancel" href="/mes-classes" className="mr-2">
      <Button title="Annuler" type="secondary" disabled />
    </a>,
    <Button key="create" leftIcon={<ClasseIcon />} title="Créer cette classe" disabled={!form.name} onClick={() => setModalConfirmation(true)} />,
  ];

  return (
    <Page>
      <Header
        title="Création d’une classe engagée"
        breadcrumb={[{ title: <ClasseIcon className="scale-[65%]" /> }, { title: "Mes classes", href: "/mes-classes" }, { title: "Créer une classe" }]}
        actions={actions}
      />
      <Container title="Informations générales">
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <Label title="Cohorte" tooltip="This is a test and need to be replaced." />
            <InputText value="CLE 23-24" disabled />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1">
            <Label title="Numéro d’identification" tooltip="This is a test and need to be replaced." />
            <div className="flex items-center justify-between gap-3">
              <InputText className="flex-1" value="75IDF_11/10/2024_" disabled />
              <InputText className="flex-1" placeholder="ABCDE" />
            </div>
          </div>
        </div>
      </Container>
      <Container title="Référent de classe">
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <Label title="Nouveau référent de classe ..." />
            <InputText className="mb-3" label="Nom" placeholder="Préciser" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <InputText className="mb-3" label="Prénom" placeholder="Préciser" />
            <InputText label="Adresse email" type="email" placeholder="Préciser" />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1">
            <Label title="... ou référent de classe existant" />
          </div>
        </div>
      </Container>
      <div className="flex items-center justify-end">{actions}</div>

      <ModalConfirmation
        isOpen={modalConfirmation}
        onClose={() => setModalConfirmation(false)}
        className="md:max-w-[700px]"
        icon={<ProfilePic icon={({ size, className }) => <ClasseIcon size={size} className={className} />} />}
        title="Confirmez-vous ces informations ?"
        text={
          <div className="text-left w-[636px] text-ds-gray-900">
            <div className="my-6">
              <div className="text-lg mb-2">Informations générales</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Numéro d’identification</div>
                <div className="flex-1 font-bold text-right">75IDF_11/10/2024_XYZ12</div>
              </div>
            </div>
            <div className="my-6">
              <div className="text-lg mb-2">Référent de classe</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Prénom et Nom</div>
                <div className="flex-1 font-bold text-right">Amandine PIGNON</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Adresse email</div>
                <div className="flex-1 font-bold text-right">amandine.pignon@ac-paris.fr</div>
              </div>
            </div>
          </div>
        }
        actions={[
          { title: "Modifier", isCancel: true },
          { title: "Valider", onClick: () => console.info("Créer cette classe") },
        ]}
      />
    </Page>
  );
}
