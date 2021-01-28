import { Field } from "formik";
import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { requiredMessage } from "../scenes/inscription/components/errorMessage";

function getFileName(file) {
  return (file && file.name) || file;
}

export default ({ value, onChange, name, errorMessage = requiredMessage, placeholder = "votre fichier" }) => {
  const [filesList, setFilesList] = useState(value || []);

  useEffect(() => {
    const dropArea = document.getElementById("file-drop");
    dropArea.addEventListener("dragleave", (e) => e.preventDefault(), false);
    dropArea.addEventListener("dragover", (e) => e.preventDefault(), false);
    dropArea.addEventListener(
      "dragenter",
      (e) => {
        e.preventDefault();
        dropArea.style.background = "#eee";
      },
      false
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
        handleChange(files);
      },
      false
    );
  });

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
    <div style={{}}>
      <ImageInput id="file-drop">
        <Field
          type="file"
          accept=".jpg, .jpeg, .png, .pdf"
          hidden
          multiple
          name={name}
          value={[]}
          validate={(v) => ((!v || !v.length) && errorMessage) || (v && v.size > 5000000 && "Ce fichier est trop volumineux.")}
          onChange={(e) => onAdd(e.target.files)}
        />
        <img src={require("../assets/image.svg")} />
        <>
          <span style={{ color: "#5850ec" }}>Téléversez {placeholder}</span> ou glissez-déposez
          <span style={{ display: "block", fontSize: 13 }}>PDF, PNG ou JPG jusqu'à 5 Mo</span>
        </>
      </ImageInput>
      {filesList.map((e, i) => (
        <File key={i}>
          {getFileName(e)} <span onClick={() => handleChange(filesList.filter((n, j) => i !== j))}>Retirer</span>
        </File>
      ))}
    </div>
  );
};

function isFileSupported(fileName) {
  const allowTypes = ["jpg", "jpeg", "png", "pdf"];
  const dotted = fileName.split(".");
  const type = dotted[dotted.length - 1];
  if (!allowTypes.includes(type)) return false;
  return true;
}

const ImageInput = styled.label`
  border: 1px dashed #d2d6dc;
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
  span {
    margin-left: auto;
    color: #535a66;
    font-weight: 500;
    cursor: pointer;
  }
`;
