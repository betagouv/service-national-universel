import { Field } from "formik";
import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import Download from "../assets/icons/Download";
import { requiredMessage } from "../scenes/inscription2023/components/ErrorMessageOld";
import api from "../services/api";
import ModalConfirm from "./modals/ModalConfirm";
import image from "../assets/image.svg";
import attachment from "../assets/attachment.svg";

export default function DndFileInput({ optional, value, name, errorMessage = requiredMessage, placeholder = "votre fichier", download, path, onChange, ...props }) {
  const [filesList, setFilesList] = useState(value);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  useEffect(() => {
    const dropArea = document.getElementById(`file-drop-${name}`);
    dropArea.addEventListener("dragleave", (e) => e.preventDefault(), false);
    dropArea.addEventListener("dragover", (e) => e.preventDefault(), false);
    dropArea.addEventListener(
      "dragenter",
      (e) => {
        e.preventDefault();
        dropArea.style.background = "#eee";
      },
      false,
    );
    dropArea.addEventListener(
      "drop",
      (e) => {
        e.preventDefault();
        let dt = e.dataTransfer;
        let files = dt.files;
        dropArea.style.background = "#fff";
        for (let i = 0; i < files.length; i++) {
          if (!isFileSupported(files[i].name)) return toastr.error(`Le type du fichier ${files[i].name} n'est pas supporté.`);
          if (files[i].size > 5000000) return toastr.error(`Ce fichier ${files[i].name} est trop volumineux.`);
        }
        handleUpload([...files]);
      },
      false,
    );
  }, []);

  // If no initial value was given (in the case of a modal window), get files list
  useEffect(() => {
    if (!value) {
      getList(path);
    }
  }, []);

  async function handleUpload([...newFiles]) {
    for (let index = 0; index < Object.keys(newFiles).length; index++) {
      let i = Object.keys(newFiles)[index];
      if (!isFileSupported(newFiles[i].name)) return toastr.error(`Le type du fichier ${newFiles[i].name} n'est pas supporté.`);
      if (newFiles[i].size > 5000000) return toastr.error(`Ce fichier ${newFiles[i].name} est trop volumineux.`);
    }
    const res = await api.uploadFiles(`${path}`, newFiles);
    if (res.code === "FILE_CORRUPTED") {
      return toastr.error(
        "Le fichier semble corrompu",
        "Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        { timeOut: 0 },
      );
    }
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
    toastr.success("Fichier téléversé");
    if (onChange) onChange(res);
    setFilesList(res.data);
  }

  const handleClick = (e) => {
    setModal({
      isOpen: true,
      onConfirm: () => handleDownload(e),
      title: "Téléchargement de document",
      message:
        "En téléchargeant cette pièce jointe, vous vous engagez à la supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
      value: e,
    });
  };
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

  return (
    <div style={{}} {...props}>
      <ImageInput id={`file-drop-${name}`}>
        <Field
          type="file"
          accept=".jpg, .jpeg, .png, .pdf"
          hidden
          multiple
          name={name}
          value={[]}
          validate={(v) => (!optional && (!v || !v.length) && errorMessage) || (v && v.size > 5000000 && "Ce fichier est trop volumineux.")}
          onChange={(e) => {
            handleUpload(e.target.files);
          }}
        />
        <img src={image} />
        <>
          <span style={{ color: "#5850ec" }}>Téléversez {placeholder}</span> ou glissez-déposez
          <span style={{ display: "block", fontSize: 13 }}>PDF, PNG ou JPG jusqu&apos;à 5 Mo</span>
        </>
      </ImageInput>
      {filesList?.map((file) => (
        <File key={file._id}>
          {file.name} <span onClick={() => handleDelete(file._id)}>Retirer </span>
          {download && (
            <span>
              <Download onClick={() => handleClick(file._id)} />
            </span>
          )}
        </File>
      ))}
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
    </div>
  );
}

function isFileSupported(fileName) {
  const allowTypes = ["jpg", "jpeg", "png", "pdf"];
  const dotted = fileName.split(".");
  const type = dotted[dotted.length - 1];
  if (!allowTypes.includes(type.toLowerCase())) return false;
  return true;
}

const ImageInput = styled.label`
  border: 2px dashed #d2d6dc;
  padding: 25px;
  text-align: center;
  outline: 0;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  max-width: 500px;
  font-size: 14px;
  line-height: 1.7;
  cursor: pointer;
  margin-bottom: 15px;
  img {
    height: 40px;
    display: block;
    margin: 10px auto;
  }
  :hover {
    background-color: #f8f8f8;
  }
`;

const File = styled.div`
  border: 1px solid #e8eaee;
  font-size: 13px;
  color: #333333;
  letter-spacing: 0.02em;
  border-radius: 8px;
  padding: 10px 15px 10px 32px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  background: url(${attachment}) left 8px center no-repeat;
  background-size: 16px;
  span {
    margin-left: auto;
    padding-left: 1rem;
    color: #535a66;
    font-weight: 500;
    cursor: pointer;
  }
`;
