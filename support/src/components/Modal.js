import ReactModal from "react-modal";

ReactModal.setAppElement("#__next");

const Modal = ({ children, isOpen, onRequestClose }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      className="relative min-w-min max-h-3/4 border-2 border-snu-purple-900 bg-white p-12 rounded-lg overflow-auto"
      overlayClassName="bg-opacity-75	z-50 bg-black flex w-screen h-screen fixed inset-0 items-center justify-center"
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      onRequestClose={onRequestClose}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 absolute top-6 right-6 cursor-pointer"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        onClick={onRequestClose}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </ReactModal>
  );
};

export default Modal;
