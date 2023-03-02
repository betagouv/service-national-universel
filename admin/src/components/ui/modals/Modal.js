import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

const modalSizes = {
  sm: "w-full md:w-auto md:max-w-[300px]",
  md: "w-full md:w-auto md:max-w-[540px]",
  lg: "w-full md:w-auto md:max-w-[800px]",
};

const Modal = ({ isOpen, onClose = () => {}, size = "md", children, className = "" }) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className={`relative transform transition-all ${modalSizes[size]} ${className}`}>{children}</Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const ModalHeader = ({ icon, layoutOrientation = "vertical", title, className, ...rest }) => {
  const orientation = layoutOrientation === "horizontal" ? "flex-row" : "flex-column";

  return (
    <div className={`px-6 pt-6 text-gray-900 flex gap-6 ${orientation} ${className}`} {...rest}>
      {icon && <div className="flex justify-center mb-auto">{icon}</div>}
      <h2 className="leading-7 text-xl text-center m-0">{title}</h2>
    </div>
  );
};

const ModalContent = ({ className, children, ...rest }) => {
  return (
    <div className={`p-6 text-gray-900 ${className}`} {...rest}>
      {children}
    </div>
  );
};

const ModalFooter = ({ className, children, ...rest }) => {
  return (
    <div className={`px-6 pb-6 text-gray-900 ${className}`} {...rest}>
      {children}
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
