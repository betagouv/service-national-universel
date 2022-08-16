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

export default function ModalFilesPM({ isOpen, onCancel, path, title }) {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [uploading] = useState(false);
  const [filesList, setFilesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClick = (e) => {
    setModal({
      isOpen: true,
      onConfirm,
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

  const onConfirm = async (file) => {
    setLoading(true);
    await handleDownload(file._id);
    setLoading(false);
  };

  async function handleUpload([...files]) {
    console.log("files from handleUpload:", files[0].target);
    for (let index = 0; index < Object.keys(files).length; index++) {
      let i = Object.keys(files)[index];
      if (!isFileSupported(files[i].name)) return toastr.error(`Le type du fichier ${files[i].name} n'est pas supporté.`);
      if (files[i].size > 5000000) return toastr.error(`Ce fichier ${files[i].name} est trop volumineux.`);
    }
    const res = await api.uploadFile(`${path}`, files);
    if (res.code === "FILE_CORRUPTED") {
      return toastr.error(
        "Le fichier semble corrompu",
        "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        { timeOut: 0 },
      );
    }
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
    setFilesList(res.data);
  }

  async function handleDownload(fileId) {
    const res = await api.get(`${path}/${fileId}`);
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléchargement de votre fichier");
    return res;
  }

  async function handleDelete(fileId) {
    const res = await api.remove(`${path}/${fileId}`);
    if (!res.ok) return toastr.error("Une erreur s'est produite lors de la suppression de votre fichier");
    setFilesList(res.data);
  }

  async function getList(path) {
    const res = await api.get(path);
    if (!res.ok) return toastr.error("Une erreur s'est produite lors de la récupération de la liste de vos fichiers.");
    setFilesList(res.data);
  }

  useEffect(() => {
    getList(path);
  }, [path]);

  return (
    <>
      <Modal centered isOpen={isOpen} toggle={onCancel} size="lg">
        <ModalContainer>
          <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={onCancel} />
          <div className="pt-2 pb-4 text-center flex flex-col items-center px-8 w-full">
            <h3 className="mb-4">{title}</h3>

            {filesList?.length
              ? filesList.map((file) => (
                  <div key={file._id} className="flex flex-1 flex-row justify-between items-center border-[1px] border-gray-300 w-full rounded-lg py-2 px-3 mb-2">
                    <div className="flex flex-row items-center">
                      <PaperClip className="text-gray-400 mr-2" />
                      <div className="text-sm leading-5 font-normal text-gray-800">{file.name}</div>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                      <div className="text-sm leading-5 font-normal text-gray-800 hover:underline cursor-pointer" onClick={() => handleClick(file)}>
                        Télécharger
                      </div>
                      <div
                        className="text-sm leading-5 font-normal text-gray-800 hover:underline cursor-pointer"
                        onClick={async () => {
                          setLoading(true);
                          await handleDelete(file._id);
                          setLoading(false);
                        }}>
                        Supprimer
                      </div>
                    </div>
                  </div>
                ))
              : null}
            <div className="flex flex-col items-center border-[1px] border-dashed border-gray-300 w-full rounded-lg py-4 mt-3">
              <AddImage className="text-gray-400" />
              <div className="text-sm leading-5 font-medium text-blue-600 hover:underline mt-2 cursor-pointer" onClick={handleClickUpload}>
                Téléversez le formulaire
              </div>
              <input type="file" ref={hiddenFileInput} onChange={(e) => handleUpload(e.target.files)} className="hidden" accept=".jpg, .jpeg, .png, .pdf" multiple />
              <div className="text-xs leading-4 font-normal text-gray-500 mt-1">PDF, PNG, JPG jusqu’à 5Mo</div>
            </div>
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
