import { Field } from "formik";
import React, { useState } from "react";
import styled from "styled-components";
import { requiredMessage } from "./errorMessage";
import DownloadButton from "./buttons/DownloadButton";
import ModalConfirm from "./modals/ModalConfirm";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function DndFileInput({ value, onChange, name, errorMessage = requiredMessage, placeholder = "votre fichier", source, required }) {
  const [filesList, setFilesList] = useState(value || []);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  function onAdd(files) {
    Object.keys(files).forEach((i) => {
      const fileName = files[i].name.match(/(.*)(\..*)/);
      const newName = `${fileName[1]}-${filesList.length}${fileName[2]}`;
      Object.defineProperty(files[i], "name", {
        writable: true,
        value: newName,
      });
    });
    handleChange([...filesList, ...files]);
  }

  function handleChange(files) {
    setFilesList(files);
    onChange({ target: { files, name } });
  }

  return (
    <>
      <div style={{}}>
        {filesList.map((e, i) => (
          <File key={i}>
            <FileName>{getFileName(e)}</FileName>
            <div>
              <span onClick={() => setModal({ isOpen: true, onConfirm: () => handleChange(filesList.filter((n, j) => i !== j)) })}>Supprimer</span>
              <DownloadLink
                key={i}
                source={() => {
                  console.log(e);
                  return source(getFileName(e));
                }}
                title={`Télécharger`}
              />
            </div>
          </File>
        ))}
        <ImageInput id="file-drop">
          <Field
            type="file"
            accept=".jpg, .jpeg, .png, .pdf"
            hidden
            multiple
            name={name}
            value={[]}
            validate={(v) => (required && (!v || !v.length) && errorMessage) || (v && v.size > 5000000 && "Ce fichier est trop volumineux.")}
            onChange={(e) => onAdd(e.target.files)}
          />
          <>
            <span style={{ color: "#5850ec" }}>Téléversez {placeholder}</span>
            <span style={{ display: "block", fontSize: 13 }}>PDF, PNG ou JPG jusqu&apos;à 5 Mo</span>
          </>
        </ImageInput>
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title="Êtes-vous sûr(e) de vouloir supprimer ce document"
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}

const FileName = styled.span`
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ImageInput = styled.label`
  border: 1px dashed #d2d6dc;
  padding: 25px;
  text-align: center;
  outline: 0;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.7;
  cursor: pointer;
  margin-bottom: 15px;
  img {
    height: 40px;
    display: block;
    margin: 10px auto;
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
  background: url(${require("../assets/attachment.svg")}) left 8px center no-repeat;
  background-size: 16px;
  div {
    display: flex;
    align-items: center;
    margin-left: auto;
    span {
      color: #535a66;
      cursor: pointer;
      margin-right: 10px;
    }
  }
`;

const DownloadLink = styled(DownloadButton)`
  margin-right: 0;
  margin-top: 0;
`;
