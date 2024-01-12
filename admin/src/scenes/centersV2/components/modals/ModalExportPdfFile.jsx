import React from "react";
import ModalTailwind from "../../../../components/modals/ModalTailwind";
import { BiLoaderAlt } from "react-icons/bi";

export default function ModalExportPdfFile({ isOpen, onClose, title, message, estimation }) {
  return (
    <ModalTailwind isOpen={isOpen} onClose={onClose} className="w-[700px] rounded-xl bg-white">
      <div className="w-full">
        <div className="pb-16 pt-14">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="mb-2 text-[20px] text-gray-900 font-medium">{title}</h1>
            <p className="text-gray-500 text-[16px] font-normal mb-16">{message}</p>
            <span className="animate-spin mb-2">
              <BiLoaderAlt className="h-16 w-16" />
            </span>
            <p className="text-sm font-[14px] font-normal text-gray-900">{estimation}</p>
          </div>
        </div>
      </div>
    </ModalTailwind>
  );
}
