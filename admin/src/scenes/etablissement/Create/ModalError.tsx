import React from "react";
import { HiOutlineExclamation } from "react-icons/hi";
import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  content: { title: string; text: string };
}

export default function ModaleError({ isOpen, onClose, content }: Props) {
  return (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[600px]"
      icon={<HiOutlineExclamation className="bg-gray-100 rounded-full p-2" size={48} />}
      title={content.title}
      text={<div className="mt-6 text-base leading-6 font-normal text-gray-900">{content.text}</div>}
      actions={[{ title: "Modifier" }]}
    />
  );
}
