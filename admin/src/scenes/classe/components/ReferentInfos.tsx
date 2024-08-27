import React from "react";
import { HiOutlinePencil } from "react-icons/hi";
import { Container, InputText, Button } from "@snu/ds/admin";
import { ClasseDto } from "snu-lib";
import { User } from "@/types";
import { Rights } from "./types";

interface Props {
  classe: ClasseDto;
  setClasse: (classe: ClasseDto) => void;
  editRef: boolean;
  setEditRef: (edit: boolean) => void;
  errors: { [key: string]: string };
  rights: Rights;
  user: User;
  isLoading: boolean;
  onCancel: () => void;
  onCheckInfo: () => void;
}

export default function ReferentInfos({ classe, setClasse, editRef, setEditRef, errors, rights, user, isLoading, onCancel, onCheckInfo }: Props) {
  const containerActionList = ({ edit, setEdit, canEdit }) => {
    if (edit) {
      return [
        <div key="actions" className="flex items-center justify-end ml-6">
          <Button key="cancel" type="cancel" title="Annuler" onClick={onCancel} disabled={isLoading} />
          <Button key="validate" type="primary" title="Valider" className={"!h-8 ml-2"} onClick={onCheckInfo} loading={isLoading} disabled={isLoading} />
        </div>,
      ];
    } else if (canEdit) {
      return [<Button key="change" type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={isLoading} />];
    } else {
      return [];
    }
  };
  return (
    <Container title="Référent de classe" actions={containerActionList({ edit: editRef, setEdit: setEditRef, canEdit: rights.canEditRef })}>
      <div className="flex items-stretch justify-stretch">
        <div className="flex-1">
          <InputText
            name="refName"
            className="mb-3"
            value={classe.referents[0].lastName}
            label={"Nom"}
            readOnly={!editRef}
            active={editRef}
            error={errors.refLastName}
            onChange={(e) => {
              const updatedReferents = [...classe.referents];
              updatedReferents[0].lastName = e.target.value;
              setClasse({ ...classe, referents: updatedReferents });
            }}
          />
          <InputText
            name="refFirstName"
            className="mb-3"
            value={classe.referents[0].firstName}
            label={"Prénom"}
            readOnly={!editRef}
            active={editRef}
            error={errors.refFirstName}
            onChange={(e) => {
              const updatedReferents = [...classe.referents];
              updatedReferents[0].firstName = e.target.value;
              setClasse({ ...classe, referents: updatedReferents });
            }}
          />
        </div>
        <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
        <div className="flex-1">
          <InputText
            name="refMail"
            className="mb-3"
            label={"Adresse Email"}
            value={classe.referents[0].email}
            readOnly={!editRef}
            active={editRef}
            error={errors.refEmail}
            onChange={(e) => {
              const updatedReferents = [...classe.referents];
              updatedReferents[0].email = e.target.value;
              setClasse({ ...classe, referents: updatedReferents });
            }}
          />
        </div>
      </div>
    </Container>
  );
}
