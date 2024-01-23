import React from "react";
import { Dialog, Transition } from "@headlessui/react";

type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  classNameContent?: string;
  header?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  className,
  classNameContent,
  header,
  content,
  footer,
}: OwnProps) {
  return (
    <Transition.Root show={isOpen}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ds-deep-blue-500 bg-opacity-60 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`relative w-full transform transition-all ${className}`}
              >
                <div className={"p-8 rounded-md bg-white " + classNameContent}>
                  {header && <div className="mb-6">{header}</div>}
                  {content}
                  {footer && <div className="mt-6">{footer}</div>}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
