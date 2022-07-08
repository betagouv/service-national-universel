import * as FileSaver from "file-saver";
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

function getFileName(file) {
  return (file && file.name) || file;
}

export default function ModalFilesPM({ isOpen, onCancel, initialValues, young, nameFiles, title, onChange }) {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [uploading, setUploading] = useState(false);
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

  const handleUpload = (event) => {
    const files = event.target.files;
    for (let index = 0; index < Object.keys(files).length; index++) {
      let i = Object.keys(files)[index];
      if (!isFileSupported(files[i].name)) return toastr.error(`Le type du fichier ${files[i].name} n'est pas supporté.`);
      if (files[i].size > 5000000) return toastr.error(`Ce fichier ${files[i].name} est trop volumineux.`);
      const fileName = files[i].name.match(/(.*)(\..*)/);
      const newName = `${fileName[1]}-${filesList.length + index}${fileName[2]}`;
      Object.defineProperty(files[i], "name", {
        writable: true,
        value: newName,
      });
    }
    uploadFiles([...filesList, ...files]);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    const res = await api.uploadFile(`/referent/file/${nameFiles}`, files, { youngId: young._id });
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
    // We update it instant ( because the bucket is updated instant )
    setFilesList(res.data);
    setUploading(false);
  };
  const onConfirm = async (file) => {
    setLoading(true);
    try {
      const f = await api.get(`/referent/youngFile/${young._id}/military-preparation/${nameFiles}/${getFileName(file)}`);
      FileSaver.saveAs(new Blob([new Uint8Array(f.data.data)], { type: f.mimeType }), f.fileName.replace(/[^a-z0-9]/i, "-"));
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant le téléchagement", e.toString());
    }
    setLoading(false);
  };

  useEffect(() => {
    setFilesList(initialValues);
  }, [initialValues]);

  return (
    <>
      <Modal centered isOpen={isOpen} toggle={onCancel} size="lg">
        <ModalContainer>
          <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={onCancel} />
          <div className="pt-2 pb-4 text-center flex flex-col items-center px-8 w-full">
            <h3 className="mb-4">{title}</h3>

            {filesList?.length
              ? filesList.map((file, index) => (
                  <div key={index} className="flex flex-1 flex-row justify-between items-center border-[1px] border-gray-300 w-full rounded-lg py-2 px-3 mb-2">
                    <div className="flex flex-row items-center">
                      <PaperClip className="text-gray-400 mr-2" />
                      <div className="text-sm leading-5 font-normal text-gray-800">{file}</div>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                      <div className="text-sm leading-5 font-normal text-gray-800 hover:underline cursor-pointer" onClick={() => handleClick(file)}>
                        Télécharger
                      </div>
                      <div
                        className="text-sm leading-5 font-normal text-gray-800 hover:underline cursor-pointer"
                        onClick={async () => {
                          setLoading(true);
                          setFilesList(filesList?.filter((f) => file !== f));
                          await onChange();
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
              <input type="file" ref={hiddenFileInput} onChange={handleUpload} className="hidden" accept=".jpg, .jpeg, .png, .pdf" multiple />
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
