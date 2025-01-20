import React from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { IoClose } from "react-icons/io5";

type PropTypes = {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  loading?: boolean;
  disabled?: boolean;
  confirmText?: string;
  cancelText?: string;
};

export default function ResponsiveModal({ isOpen, setOpen, title, children, onConfirm, loading, confirmText, cancelText, disabled }: PropTypes) {
  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="absolute top-0 md:relative transform overflow-hidden md:rounded-lg bg-white transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in w-full md:w-fit max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
            <div className="relative min-h-screen md:min-h-fit">
              <div className="mt-2 grid grid-cols-[4rem_auto_4rem]">
                <div>
                  <button onClick={() => setOpen(false)} className="w-full p-3">
                    <IoClose className="text-2xl md:text-3xl cursor-pointer text-gray-400" />
                  </button>
                </div>
                <div>
                  <h2 className="mt-3 text-center font-medium text-lg md:text-3xl leading-6">{title}</h2>
                </div>
                <div></div>
              </div>
              {children}
              {onConfirm ? (
                <div className="absolute bottom-0 md:relative w-full p-3 grid gap-3 bg-gray-50 mt-2">
                  <button
                    onClick={onConfirm}
                    disabled={loading || disabled}
                    className="w-full text-sm bg-blue-600 border-[1px] border-blue-600 text-white p-2 rounded-md disabled:bg-gray-400 disabled:border-gray-400 hover:bg-blue-800 hover:border-blue-800 transition">
                    {loading ? "Envoi des données..." : confirmText || "Envoyer"}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    className="w-full text-sm border bg-[#ffffff] text-gray-500 p-2 rounded-md hover:bg-gray-100 transition">
                    {cancelText || "Annuler"}
                  </button>
                </div>
              ) : null}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
