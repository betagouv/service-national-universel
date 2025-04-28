import React from "react";
import plausibleEvent from "../../../../../services/plausible";
import { HiOutlineDownload, HiOutlineMail } from "react-icons/hi";
import useAuth from "@/services/useAuth";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import ButtonPrimaryOutline from "../../../../../components/ui/buttons/ButtonPrimaryOutline";
import CloseSvg from "../../../../../assets/Close";
import ModalConfirm from "../../../../../components/modals/ModalConfirm";
import ModalTailwind from "../../../../../components/ui/modals/Modal";
import { useDownloadConvocation, useSendConvocationByEmail } from "../utils/convocationMutations";
import { useToggle } from "react-use";

export function ModalConvocation({ open, setOpen }) {
  const { young } = useAuth();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useToggle(false);
  const { mutate: download, isPending: isDownloadPending } = useDownloadConvocation();
  const { mutate: sendByEmail, isPending: isEmailPending } = useSendConvocationByEmail();

  const handleDownload = () => {
    plausibleEvent("Phase1/telechargement convocation");
    download();
  };

  const handleMail = async () => {
    sendByEmail(undefined, {
      onSuccess: () => {
        setOpen(false);
        setIsConfirmModalOpen();
      },
    });
  };

  return (
    <ModalTailwind isOpen={open} onClose={() => setOpen(false)} className="w-full space-y-2 rounded-md bg-white p-4 md:w-auto">
      <div className="flex justify-between gap-4">
        <h1 className="m-0 text-lg font-semibold text-gray-900">Choisissez une option de téléchargement</h1>
        <CloseSvg className="close-icon hover:cursor-pointer" height={16} width={16} onClick={() => setOpen(false)} />
      </div>

      <br />
      <ButtonPrimary onClick={handleDownload} disabled={isDownloadPending} className="w-full">
        <HiOutlineDownload className="mr-2 h-5 w-5 text-blue-300" />
        Télécharger
      </ButtonPrimary>

      <ButtonPrimaryOutline onClick={() => setIsConfirmModalOpen()} disabled={isEmailPending} className="w-full">
        <HiOutlineMail className="mr-2 h-5 w-5" />
        Recevoir par mail
      </ButtonPrimaryOutline>
      <ModalConfirm
        isOpen={isConfirmModalOpen}
        title="Envoi de document par mail"
        message={`Vous allez recevoir votre convocation par mail à l'adresse ${young.email}.`}
        onCancel={() => setIsConfirmModalOpen()}
        onConfirm={handleMail}
      />
    </ModalTailwind>
  );
}
