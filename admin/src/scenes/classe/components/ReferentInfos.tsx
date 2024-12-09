import React, { useState } from "react";
import { HiOutlinePencil } from "react-icons/hi";
import { Container, InputText, Button, Modal } from "@snu/ds/admin";
import { ClassesRoutes } from "snu-lib";
import { Rights } from "./types";
import { copyToClipboard } from "@/utils";
import { HiCheckCircle } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";
import { ReferentInfosModifier } from "./ReferentInfosModifier";
import { useToggle } from "react-use";

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
  const [showModal, toggleModal] = useToggle(false);

  const containerActionList = (canEdit) => {
    if (canEdit) {
      return [<Button key="change" type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={toggleModal} disabled={isLoading} />];
    } else {
      return [];
    }
    // if (edit) {
    //   return [
    //     <ReferentInfosModifier
    //       key="beurk"
    //       referent={{ nom: classe.referents?.[0].lastName, prenom: classe.referents?.[0].firstName, email: classe.referents?.[0].email }}
    //       isOpen={showModal}
    //       handleModalClose={toggleModal}
    //     />,
    //   ];
    //   // toggleModal(true);
    //   // return [
    //   //   <div key="actions" className="flex items-center justify-end ml-6">
    //   //     <Button key="cancel" type="cancel" title="Annuler" onClick={onCancel} disabled={isLoading} />
    //   //     <Button key="validate" type="primary" title="Valider" className={"!h-8 ml-2"} onClick={onCheckInfo} loading={isLoading} disabled={isLoading} />
    //   //   </div>,
    //   // ];
    // } else if (canEdit) {
    //   return [<Button key="change" type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={isLoading} />];
    // } else {
    //   return [];
    // }
  };

  // const handleModalClose = () => {
  //   toggleModal(false);
  // };
  return (
    <>
      <Container title="Référent de classe" actions={containerActionList(rights.canEditRef)}>
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <InputText name="refName" className="mb-3" value={classe.referents?.[0].lastName || ""} label={"Nom"} readOnly disabled />
            <InputText name="refFirstName" className="mb-3" value={classe.referents?.[0].firstName || ""} label={"Prénom"} readOnly disabled />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <InputText name="refMail" className="mb-3 w-[95%]" label={"Adresse Email"} value={classe.referents?.[0].email || ""} readOnly disabled />
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
      <ReferentInfosModifier
        referent={{ nom: classe.referents?.[0].lastName, prenom: classe.referents?.[0].firstName, email: classe.referents?.[0].email }}
        isOpen={showModal}
        onModalClose={toggleModal}
      />
      {/* {showModal && <ReferentInfosModifier referent={{ nom: classe.referents?.[0].lastName, prenom: classe.referents?.[0].firstName, email: classe.referents?.[0].email }} />} */}
      {/* {showModal && <Modal isOpen={showModal} onClose={toggleModal} className="md:max-w-[800px]" content={<div className="flex flex-col gap-4"></div>} />} */}
    </>
  );
}
