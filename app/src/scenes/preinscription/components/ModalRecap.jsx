import React, { useState } from "react";
import ModalTailwind from "../../../components/ui/modals/Modal";
import { RiArrowRightLine, RiCloseFill } from "react-icons/ri";
import Button from "../../../components/dsfr/ui/buttons/Button";
import SecondaryButton from "../../../components/dsfr/ui/buttons/SecondaryButton";
import { translateGrade, GRADES } from "snu-lib";

export default function ModalRecap({ isOpen, title, message, onCancel, onConfirm, confirmText = "Confirmer", cancelText = "Annuler", young }) {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    await onConfirm();
    setSending(false);
  };

  return (
    <ModalTailwind isOpen={isOpen} onClose={() => onCancel()} className="w-[384px] rounded-none space-y-2 bg-white p-2">
      <section className="px-4">
        <button className="w-full mt-4 flex items-center justify-end gap-2 pb-2 text-sm text-[#000091]" onClick={onCancel}>
          Fermer
          <RiCloseFill className="text-lg mt-1" />
        </button>
        <div className="flex py-2 text-[24px] font-semibold leading-32 gap-2">
          <RiArrowRightLine className="text-black w-12 h-12 mx-auto pb-2" />
          {title}
        </div>
        <div className="text-gray-500 leading-[24px] mb-4">{message}</div>
        <hr />
        <div className="flex flex-col mb-3">
          <span className="text-gray-500">Niveau de scolarité</span>
          <span className="font-bold">{translateGrade(young.scolarity)}</span>
        </div>
        <hr />
        <div className="mb-3 flex flex-col ">
          {young.scolarity === GRADES.NOT_SCOLARISE ? (
            <>
              <span className="text-gray-500">Code postal</span>
              <span className="font-bold">{young?.zip}</span>
            </>
          ) : (
            <>
              <span className="text-gray-500 mr-2">Commune de l'établissement</span>
              <span className="font-bold">{young.school?.city}</span>
            </>
          )}
        </div>
        <hr />
        <div className="flex justify-end my-8">
          <SecondaryButton className="mr-2" disabled={sending} onClick={onCancel}>
            {cancelText}
          </SecondaryButton>
          <Button loading={sending} disabled={sending} onClick={submit} primary>
            {confirmText}
          </Button>
        </div>
      </section>
    </ModalTailwind>
  );
}
