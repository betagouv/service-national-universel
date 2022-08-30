import { Field } from "formik";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { requiredMessage } from "./errorMessage";
import DownloadButton from "./buttons/DownloadButton";
import RoundDownloadButton from "./buttons/RoundDownloadButton";
import IconButton from "./buttons/IconButton";
import ModalConfirm from "./modals/ModalConfirm";
import deleteIcon from "../assets/delete.svg";
import { slugifyFileName } from "../utils";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function DndFileInput({ value, onChange, name, errorMessage = requiredMessage, placeholder = "votre fichier", source, required, tw, setNewFilesList }) {
  const [filesList, setFilesList] = useState(value || []);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  function onAdd(files) {
    Object.keys(files).forEach((i) => {
      const fileName = files[i].name.match(/(.*)(\..*)/);
      const newName = `${slugifyFileName(fileName[1])}-${filesList.length}${fileName[2]}`;
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

  useEffect(() => {
    setNewFilesList && setNewFilesList(filesList);
  }, [filesList]);

  return (
    <>
      <div className={tw}>
        {filesList.map((e, i) => (
          <File key={i} className="mx-1 justify-between">
            <FileName className="mr-2">{getFileName(e)}</FileName>
            <div>
              <IconButton
                icon={deleteIcon}
                bgColor="bg-indigo-600"
                onClick={() => setModal({ isOpen: true, onConfirm: () => handleChange(filesList.filter((n, j) => i !== j)) })}
              />
              <RoundDownloadButton
                bgColor="bg-indigo-600"
                source={() => {
                  console.log(e);
                  return source(getFileName(e));
                }}
                title={`Télécharger`}
              />
            </div>
          </File>
        ))}
        <ImageInput id="file-drop" className="mx-1">
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
          <div className="flex flex-col items-center">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 5H5C3.93913 5 2.92172 5.42143 2.17157 6.17157C1.42143 6.92172 1 7.93913 1 9V29M1 29V33C1 34.0609 1.42143 35.0783 2.17157 35.8284C2.92172 36.5786 3.93913 37 5 37H29C30.0609 37 31.0783 36.5786 31.8284 35.8284C32.5786 35.0783 33 34.0609 33 33V25M1 29L10.172 19.828C10.9221 19.0781 11.9393 18.6569 13 18.6569C14.0607 18.6569 15.0779 19.0781 15.828 19.828L21 25M33 17V25M33 25L29.828 21.828C29.0779 21.0781 28.0607 20.6569 27 20.6569C25.9393 20.6569 24.9221 21.0781 24.172 21.828L21 25M21 25L25 29M29 5H37M33 1V9M21 13H21.02"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="text-indigo-600">Téléversez {placeholder}</span>
            <span style={{ display: "block", fontSize: 13 }}>PDF, PNG ou JPG jusqu&apos;à 5 Mo</span>
          </div>
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
  border: 2px dashed #d2d6dc;
  padding: 25px;
  text-align: center;
  outline: 0;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.7;
  cursor: pointer;
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
