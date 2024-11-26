import React from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { IoClose } from "react-icons/io5";

export default function FullscreenModal({ isOpen, setOpen, title, children }) {
  return (
    <Dialog open={isOpen} onClose={setOpen} className="relative z-10">
      <div className="fixed inset-0 z-10 w-screen h-screen overflow-y-auto">
        <DialogPanel
          transition
          className="absolute top-0 h-screen transform overflow-hidden bg-white transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in w-full data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
          <div className="grid grid-cols-3">
            <div>
              <button onClick={setOpen}>
                <IoClose className="text-2xl cursor-pointer" />
              </button>
            </div>
            <div>
              <h2>{title}</h2>
            </div>
            <div></div>
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
