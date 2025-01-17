import React from "react";
import Modal from "@/components/ui/modals/Modal";
import Convocation from "../Convocation";
import Close from "@/components/layout/navbar/assets/Close";

export default function ConvocationModal({ isOpen, setIsOpen, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-full bg-white p-4 md:max-w-4xl md:p-6">
      <div className="flex justify-end">
        <button onClick={() => setIsOpen(false)} disabled={loading} className="text-gray-600 p-2 translate-x-2 -translate-y-2 disabled:cursor-wait disabled:bg-gray-200">
          <Close className="close-icon" height={10} width={10} />
        </button>
      </div>
      <Convocation />
    </Modal>
  );
}
