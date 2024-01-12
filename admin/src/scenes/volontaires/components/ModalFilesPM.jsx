import React, { useEffect, useRef, useState } from "react";
import { toastr } from "react-redux-toastr";
import { Modal } from "reactstrap";
import CloseSvg from "../../../assets/Close";
import AddImage from "../../../assets/icons/AddImage";
import PaperClip from "../../../assets/icons/PaperClip";
import ModalButton from "../../../components/buttons/ModalButton";
import { Footer, ModalContainer } from "../../../components/modals/Modal";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import api from "../../../services/api";
import FileSaver from "file-saver";

export default function ModalFilesPM({ isOpen, onCancel, path, title, readOnly = false }) {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [uploading] = useState(false);
  const [filesList, setFilesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClick = (e) => {
    setModal({
      isOpen: true,
      onConfirm: handleDownload,
      title: "Téléchargement de document",
      message:
        "En téléchargeant cette pièce jointe, vous vous engagez à la supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
      value: e,
    });
  };

  const hiddenFileInput = useRef(null);

  const handleClickUpload = () => {
    hiddenFileInput.current.click();
  };

  async function handleUpload([...files]) {
    for (let index = 0; index < Object.keys(files).length; index++) {
      let i = Object.keys(files)[index];
      if (!isFileSupported(files[i].name)) return toastr.error(`Le type du fichier ${files[i].name} n'est pas supporté.`);
      if (files[i].size > 5000000) return toastr.error(`Ce fichier ${files[i].name} est trop volumineux.`);
    }
    const res = await api.uploadFiles(`${path}`, files);
    if (res.code === "FILE_CORRUPTED") {
      return toastr.error(
        "Le fichier semble corrompu",
        "Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        { timeOut: 0 },
      );
    }
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
    setFilesList(res.data);
  }

  async function handleDownload(fileId) {
    setLoading(true);
    try {
      const res = await api.get(`${path}/${fileId}`);
      FileSaver.saveAs(new Blob([new Uint8Array(res.data.data)], { type: res.mimeType }), res.fileName);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant le téléchagement", e.toString());
    }
    setLoading(false);
  }

  async function handleDelete(fileId) {
    const res = await api.remove(`${path}/${fileId}`);
    if (!res.ok) return toastr.error("Une erreur s'est produite lors de la suppression de votre fichier");
    setFilesList(res.data);
  }

  async function getList(path) {
    if (path) {
      const res = await api.get(path);
      if (!res.ok) return toastr.error("Une erreur s'est produite lors de la récupération de la liste de vos fichiers.");
      setFilesList(res.data);
    }
  }

  useEffect(() => {
    getList(path);
  }, [path]);

  return (
    <>
      <Modal centered isOpen={isOpen} toggle={onCancel} size="lg">
        <ModalContainer>
          <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={onCancel} />
          <div className="flex w-full flex-col items-center px-8 pt-2 pb-4 text-center">
            <h3 className="mb-4">{title}</h3>

            {filesList?.length
              ? filesList.map((file) => (
                  <div key={file._id} className="mb-2 flex w-full flex-1 flex-row items-center justify-between rounded-lg border-[1px] border-gray-300 py-2 px-3">
                    <div className="flex flex-row items-center">
                      <PaperClip className="mr-2 text-gray-400" />
                      <div className="text-sm font-normal leading-5 text-gray-800">{file.name}</div>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                      <div className="cursor-pointer text-sm font-normal leading-5 text-gray-800 hover:underline" onClick={() => handleClick(file._id)}>
                        Télécharger
                      </div>
                      {!readOnly && (
                        <div
                          className="cursor-pointer text-sm font-normal leading-5 text-gray-800 hover:underline"
                          onClick={async () => {
                            setLoading(true);
                            await handleDelete(file._id);
                            setLoading(false);
                          }}>
                          Supprimer
                        </div>
                      )}
                    </div>
                  </div>
                ))
              : null}
            {!readOnly && (
              <div className="mt-3 flex w-full flex-col items-center rounded-lg border-[1px] border-dashed border-gray-300 py-4">
                <AddImage className="text-gray-400" />
                <div className="mt-2 cursor-pointer text-sm font-medium leading-5 text-blue-600 hover:underline" onClick={handleClickUpload}>
                  Téléversez le formulaire
                </div>
                <input type="file" ref={hiddenFileInput} onChange={(e) => handleUpload(e.target.files)} className="hidden" accept=".jpg, .jpeg, .png, .pdf" multiple />
                <div className="mt-1 text-xs font-normal leading-4 text-gray-500">PDF, PNG, JPG jusqu’à 5Mo</div>
              </div>
            )}
          </div>
          <Footer>
            <ModalButton onClick={onCancel} disabled={loading || uploading}>
              Retour
            </ModalButton>
          </Footer>
        </ModalContainer>
      </Modal>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null, value: null })}
        onConfirm={async () => {
          await modal?.onConfirm(modal?.value);
          setModal({ isOpen: false, onConfirm: null, value: null });
        }}
      />
    </>
  );
}

function isFileSupported(fileName) {
  const allowTypes = ["jpg", "jpeg", "png", "pdf"];
  const dotted = fileName.split(".");
  const type = dotted[dotted.length - 1];
  if (!allowTypes.includes(type.toLowerCase())) return false;
  return true;
}
