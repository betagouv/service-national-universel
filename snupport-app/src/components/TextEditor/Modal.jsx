import { Dialog, DialogBackdrop, Transition } from "@headlessui/react";
import React from "react";
import { HiX } from "react-icons/hi";

export default function Modal({ open, setOpen, className, children }) {
  return (
    <Transition.Root show={open}>
      <Dialog as="div" className="fixed inset-0 z-[200] overflow-y-auto" onClose={setOpen}>
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <DialogBackdrop className="fixed inset-0 bg-purple-snu/80 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={`inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-screen-md sm:px-20 sm:pt-[38px] sm:pb-[50px] sm:align-middle ${className}`}
            >
              <button
                type="button"
                className="absolute right-9 top-10 text-2xl text-gray-400 transition-colors hover:text-red-500 focus:outline-none"
                onClick={() => setOpen(false)}
              >
                <HiX />
              </button>

              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
