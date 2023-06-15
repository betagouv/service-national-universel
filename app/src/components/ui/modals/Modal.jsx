import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import ButtonPrimary from "../buttons/ButtonPrimary";
import ButtonLight from "../buttons/ButtonLight";

const Modal = ({ isOpen = false, onClose: handleClose = () => {}, children = <></>, className = "w-full bg-white p-4 md:w-[512px] md:p-6" }) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={handleClose}>
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
              <Dialog.Panel className={`relative transform rounded-md transition-all ${className}`}>{children}</Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const ModalHeader = ({ className, children, ...rest }) => {
  return (
    <div className={`flex flex-col items-center gap-7 px-6 pt-6 text-gray-900 ${className}`} {...rest}>
      {children}
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

const ModalTitel = ({ children, className = "" }) => <h1 className={`mb-6 text-xl font-medium text-gray-900 md:text-center ${className}`}>{children}</h1>;

const ModalSubtitle = ({ children, className = "" }) => <span className={`mb-7 text-sm text-gray-500 md:text-center ${className}`}>{children}</span>;

const ModalButtonContainer = ({ children, className = "" }) => <div className={`mt-3 flex w-full flex-col gap-3 md:flex-row ${className}`}>{children}</div>;

const ModalButtons = ({ className = "", onCancel, onConfirm, confirmText = "Confirmer", cancelText = "Annuler", disabled }) => (
  <ModalButtonContainer className={className}>
    {onConfirm && (
      <ButtonPrimary disabled={disabled} className="flex-1 md:order-last" onClick={onConfirm}>
        {confirmText}
      </ButtonPrimary>
    )}
    {onCancel && (
      <ButtonLight className="flex-1" onClick={onCancel}>
        {cancelText}
      </ButtonLight>
    )}
  </ModalButtonContainer>
);

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;
Modal.Title = ModalTitel;
Modal.Subtitle = ModalSubtitle;
Modal.ButtonContainer = ModalButtonContainer;
Modal.Buttons = ModalButtons;

export default Modal;
