import React, { useState } from "react";
import { Modal } from "reactstrap";
import ModalTailwind from "../../../components/ui/modals/Modal";
import { GrClose } from "react-icons/gr";
import { RiArrowRightLine } from "react-icons/ri";
import Button from "../../../components/dsfr/ui/buttons/Button";
import SecondaryButton from "../../../components/dsfr/ui/buttons/SecondaryButton";

export default function ModalRecap({ isOpen, topTitle = "alerte", title, message, onChange, onCancel, onConfirm, confirmText = "Confirmer", cancelText = "Annuler", young }) {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    await onConfirm();
    setSending(false);
  };

  return (
    <ModalTailwind isOpen={isOpen} className="w-[384px] rounded-none space-y-2 bg-white p-2">
      <section className="px-4">
        <button className="w-full mt-4 flex items-center justify-end gap-2 pb-2 text-sm text-[#000091]" onClick={onCancel}>
          Fermer
          <GrClose className="h-3 mt-0.5"/>
        </button>
        <div className="flex py-2 text-[24px] font-semibold leading-32">
          <RiArrowRightLine className="text-black w-12 h-12 mx-auto pb-2" />
          {title}
        </div>
        <div className="text-sm text-[16px] text-gray-500 leading-[24px]">{message}</div>
        <hr className="my-2" />
        <div className="mb-3">
          <p className="text-gray-500">Niveau de scolarité</p>
          <p className="font-bold">{young.scolarity}</p>
        </div>
        <hr className="my-2" />
        <div className="mb-3">
          <p className="text-gray-500">Commune de l'établissement</p>
          <p className="font-bold">{young.school.city}</p>
        </div>
        <hr className="my-2" />
        <div className="flex justify-end my-8">
          <SecondaryButton className="mr-2" children={cancelText} disabled={sending} onClick={onCancel || onChange} />
          <Button children={confirmText} loading={sending} disabled={sending} onClick={submit} primary />
        </div>
      </section>
    </ModalTailwind>
  );
}
