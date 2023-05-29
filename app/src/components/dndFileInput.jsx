import { Field } from "formik";
import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import Download from "../assets/icons/Download";
import { requiredMessage } from "../scenes/inscription2023/components/ErrorMessageOld";
import { slugifyFileName } from "../utils";
import ModalConfirm from "./modals/ModalConfirm";
import image from "../assets/image.svg";
import attachment from "../assets/attachment.svg";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function DndFileInput({
  optional,
  value,
  onChange,
  name,
  errorMessage = requiredMessage,
  placeholder = "votre fichier",
  download,
  onDownload,
  setNewFilesList,
  ...props
}) {
  const [filesList, setFilesList] = useState(value || []);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const handleClick = (e) => {
    setModal({
      isOpen: true,
      onConfirm: () => onDownload(e),
      title: "Téléchargement de document",
      message:
        "En téléchargeant cette pièce jointe, vous vous engagez à la supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
      value: e,
    });
  };

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
          const fileName = files[i].name.match(/(.*)(\..*)/);
          const newName = `${slugifyFileName(fileName[1])}-${filesList.length + i}${fileName[2]}`;
          Object.defineProperty(files[i], "name", {
            writable: true,
            value: newName,
          });
        }
        handleChange([...filesList, ...files]);
      },
      false,
    );
  }, []);

  function onAdd(files) {
    for (let index = 0; index < Object.keys(files).length; index++) {
      let i = Object.keys(files)[index];
      if (!isFileSupported(files[i].name)) return toastr.error(`Le type du fichier ${files[i].name} n'est pas supporté.`);
      if (files[i].size > 5000000) return toastr.error(`Ce fichier ${files[i].name} est trop volumineux.`);
      const fileName = files[i].name.match(/(.*)(\..*)/);
      const newName = `${slugifyFileName(fileName[1])}-${filesList.length + index}${fileName[2]}`;
      Object.defineProperty(files[i], "name", {
        writable: true,
        value: newName,
      });
    }
    handleChange([...filesList, ...files]);
  }

  function handleChange(files) {
    setFilesList(files);
    onChange({ target: { files, name } });
  }

  useEffect(() => {
    setNewFilesList && setNewFilesList(filesList);
  }, [filesList]);

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
            onAdd(e.target.files);
          }}
        />
        <img src={image} />
        <>
          <span style={{ color: "#5850ec" }}>Téléversez {placeholder}</span> ou glissez-déposez
          <span style={{ display: "block", fontSize: 13 }}>PDF, PNG ou JPG jusqu&apos;à 5 Mo</span>
        </>
      </ImageInput>
      {filesList.map((e, i) => (
        <File key={i}>
          {getFileName(e)} <span onClick={() => handleChange(filesList.filter((n, j) => i !== j))}>Retirer </span>
          {download && (
            <span>
              <Download onClick={() => handleClick(filesList.filter((n, j) => i === j))} />
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
