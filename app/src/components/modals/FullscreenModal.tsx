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
          <div className="relative min-h-screen">
            <div className="grid grid-cols-[3rem_auto_3rem] p-3 mt-2">
              <div>
                <button onClick={setOpen}>
                  <IoClose className="text-2xl cursor-pointer text-gray-500" />
                </button>
              </div>
              <div>
                <h2 className="text-center font-medium text-lg leading-tight">{title}</h2>
              </div>
              <div></div>
            </div>
            {children}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
