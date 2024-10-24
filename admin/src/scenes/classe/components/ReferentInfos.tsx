import React, { useState } from "react";
import { HiOutlinePencil } from "react-icons/hi";
import { Container, InputText, Button } from "@snu/ds/admin";
import { ClassesRoutes } from "snu-lib";
import { Rights } from "./types";
import { copyToClipboard } from "@/utils";
import { HiCheckCircle } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";

interface Props {
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  setClasse: (classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>) => void;
  editRef: boolean;
  setEditRef: (edit: boolean) => void;
  errors: { [key: string]: string };
  rights: Rights;
  isLoading: boolean;
  onCancel: () => void;
  onCheckInfo: () => void;
}

export default function ReferentInfos({ classe, setClasse, editRef, setEditRef, errors, rights, isLoading, onCancel, onCheckInfo }: Props) {
  const [copied, setCopied] = useState<boolean>(false);
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
            value={classe.referents?.[0].lastName || ""}
            label={"Nom"}
            readOnly={!editRef}
            active={editRef}
            error={errors.refLastName}
            onChange={(e) => {
              const updatedReferents = classe.referents ? [...classe.referents] : [];
              updatedReferents[0].lastName = e.target.value;
              setClasse({ ...classe, referents: updatedReferents });
            }}
          />
          <InputText
            name="refFirstName"
            className="mb-3"
            value={classe.referents?.[0].firstName || ""}
            label={"Prénom"}
            readOnly={!editRef}
            active={editRef}
            error={errors.refFirstName}
            onChange={(e) => {
              const updatedReferents = classe.referents ? [...classe.referents] : [];
              updatedReferents[0].firstName = e.target.value;
              setClasse({ ...classe, referents: updatedReferents });
            }}
          />
        </div>
        <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <InputText
              name="refMail"
              className="mb-3 w-[95%]"
              label={"Adresse Email"}
              value={classe.referents?.[0].email || ""}
              readOnly={!editRef}
              active={editRef}
              error={errors.refEmail}
              onChange={(e) => {
                const updatedReferents = classe.referents ? [...classe.referents] : [];
                updatedReferents[0].email = e.target.value;
                setClasse({ ...classe, referents: updatedReferents });
              }}
            />
            <div
              className="flex items-center mb-3"
              onClick={() => {
                copyToClipboard(classe.referents?.[0].email);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}>
              {copied ? <HiCheckCircle className="text-green-500 ml-2" /> : <MdOutlineContentCopy size={20} className="ml-2 text-gray-400 cursor-pointer" />}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
