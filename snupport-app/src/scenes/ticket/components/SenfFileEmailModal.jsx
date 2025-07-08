import React, { useEffect, useRef, useState } from "react";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import Modal from "./../../setting/components/Modal";

export default function SendFileEmailModal({ open, setOpen, update, selectedImage, setSelectedImage, reloadKey, iconButton = false }) {
  return (
    <>
      <Button
        text={"Pièce-Jointe"}
        icon={<HiOutlineDocumentAdd />}
        onClick={() => {
          setOpen(true);
        }}
      >
        <span className="text-2xl text-gray-400">
          <HiOutlineDocumentAdd />
        </span>
        {!iconButton && <span className="text-sm font-medium text-grey-text">Pièce-Jointe</span>}
      </Button>
      <ModalContent open={open} setOpen={setOpen} update={update} selectedImage={selectedImage} setSelectedImage={setSelectedImage} reloadKey={reloadKey} />
    </>
  );
}
const Button = React.forwardRef(({ ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    className="flex h-[inherit] grow items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 transition-colors hover:bg-gray-50"
  ></span>
));

const ModalContent = ({ open, setOpen, selectedImage, setSelectedImage, reloadKey }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const inputFileRef = useRef(null);

  useEffect(() => {
    if (selectedImage) {
      setImageUrl(URL.createObjectURL(selectedImage[0]));
    }
  }, [selectedImage]);

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Transfert d'une pièce-jointe</h5>

      <div>
        {imageUrl && selectedImage && (
          <div className="mb-3">
            <div className="text-md mb-2 inline-block font-medium text-gray-700">Prévisualisation de la pièce jointe:</div>
            <img src={imageUrl} alt={selectedImage[0].name} height="100px" />
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button
          text={"Pièce-Jointe"}
          icon={<HiOutlineDocumentAdd />}
          onMouseDown={(event) => {
            event.preventDefault();
            inputFileRef.current.click();
          }}
        >
          <span className="text-2xl text-gray-400">
            <HiOutlineDocumentAdd />
          </span>
          <span className="text-sm font-medium text-grey-text">Ajout d'une pièce-Jointe</span>
          <input key={reloadKey} ref={inputFileRef} type="file" className="hidden" accept="image/*, .pdf, .xls, .xlsx" onChange={(e) => setSelectedImage(e.target.files)} />
        </Button>
        <button
          type="button"
          className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-custom-red transition-colors hover:bg-red-50"
          onClick={() => setOpen(false)}
        >
          Annuler
        </button>
        <button
          type="button"
          className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          onClick={() => setOpen(false)}
        >
          Ajouter
        </button>
      </div>
    </Modal>
  );
};
