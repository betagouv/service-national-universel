import ReactModal from "react-modal";

ReactModal.setAppElement("#__next");

const Modal = ({ children, isOpen, onRequestClose }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      className="w-1/2 h-1/2 border-2 bg-white p-20 rounded-lg"
      overlayClassName="bg-opacity-75	 bg-black flex w-screen h-screen fixed inset-0 items-center justify-center"
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      onRequestClose={onRequestClose}
    >
      {children}
    </ReactModal>
  );
};

export default Modal;
