import React from "react";
import { HiOutlineExclamation } from "react-icons/hi";
import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
}

export default function ModaleError({ isOpen, onClose, title, text }: Props) {
  return (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[600px]"
      icon={<HiOutlineExclamation className="bg-gray-100 rounded-full p-2" size={48} />}
      title={title}
      text={<div className="mt-6 text-base leading-6 font-normal text-gray-900">{text}</div>}
      actions={[{ title: "Modifier" }]}
    />
  );
}
