import React from "react";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

const Modal = ({ children, isOpen, onRequestClose, fullScreen, closeButton, className = "" }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      className={`relative flex min-w-min ${fullScreen ? "h-screen w-screen p-0" : "max-h-3/4 rounded-lg border-2 border-snu-purple-900 p-12"} overflow-auto bg-white ${className}`}
      overlayClassName="bg-opacity-75	z-50 bg-black flex w-screen h-screen fixed inset-0 items-center justify-center"
      shouldCloseOnOverlayClick
      shouldCloseOnEsc={true}
      shouldFocusAfterRender={false}
      onRequestClose={onRequestClose}
      onAfterOpen={() => {
        document.getElementById("root").style.overflow = "hidden";
      }}
      onAfterClose={() => {
        document.getElementById("root").style.overflow = "visible";
      }}
    >
      {children}
      {closeButton ? (
        closeButton
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-6 right-6 h-6 w-6 cursor-pointer"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          onClick={onRequestClose}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </ReactModal>
  );
};

export default Modal;
