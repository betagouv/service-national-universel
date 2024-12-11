import { copyToClipboard } from "@/utils";
import { Button, Container, InputText } from "@snu/ds/admin";
import React, { useState } from "react";
import { HiCheckCircle, HiOutlinePencil } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";
import { useToggle } from "react-use";
import { ClassesRoutes } from "snu-lib";
import { ReferentInfosConfirmerModal } from "./ReferentInfosConfirmerModal";
import { ReferentInfosModifierModal, ReferentModifier } from "./ReferentInfosModifierModal";
import { Rights } from "./types";

interface Props {
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  currentReferent: ReferentModifier | undefined;
  rights: Rights;
  isLoading: boolean;
  onModifierReferent: (newReferent: ReferentModifier) => void;
}

export default function ReferentInfos({ classe, currentReferent, rights, isLoading, onModifierReferent }: Props) {
  const [copied, setCopied] = useState<boolean>(false);
  const [showModalModifier, toggleModalModifier] = useToggle(false);
  const [showModalConfirmer, toggleModalConfirmer] = useToggle(false);
  const [newReferent, setNewReferent] = useState<ReferentModifier | undefined>();

  const previousReferent = { nom: classe.referents?.[0].lastName, prenom: classe.referents?.[0].firstName, email: classe.referents?.[0].email as string };
  const containerActionList = (canEdit) => {
    if (canEdit) {
      return [<Button key="change" type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={toggleModalModifier} disabled={isLoading} />];
    } else {
      return [];
    }
  };

  const handleValider = (referent: ReferentModifier) => {
    toggleModalModifier();
    setNewReferent(referent);
    toggleModalConfirmer();
  };

  const handleConfirmer = (referent: ReferentModifier) => {
    toggleModalConfirmer();
    onModifierReferent(referent);
  };
  return (
    <>
      <Container title="Référent de classe" actions={containerActionList(rights.canEditRef)}>
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <InputText name="refName" className="mb-3" value={currentReferent?.nom || ""} label={"Nom"} readOnly disabled />
            <InputText name="refFirstName" className="mb-3" value={currentReferent?.prenom || ""} label={"Prénom"} readOnly disabled />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <InputText name="refMail" className="mb-3 w-[95%]" label={"Adresse Email"} value={currentReferent?.email || ""} readOnly disabled />
              <div
                className="flex items-center mb-3"
                onClick={() => {
                  copyToClipboard(currentReferent?.email);
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
      {showModalModifier && <ReferentInfosModifierModal referent={currentReferent!} isOpen={showModalModifier} onModalClose={toggleModalModifier} onValider={handleValider} />}
      {showModalConfirmer && newReferent && (
        <ReferentInfosConfirmerModal
          classeId={classe._id}
          previousReferent={currentReferent!}
          referent={newReferent}
          isOpen={showModalConfirmer}
          onModalClose={toggleModalConfirmer}
          onConfirmer={handleConfirmer}
        />
      )}
    </>
  );
}
