import React, { useState, useEffect } from "react";
import api from "../../../../../services/api";
import { toastr } from "react-redux-toastr";
import FileInput from "./FileInput";
import Select from "./Select";
import ModalTailwind from "../../../../../components/modals/ModalTailwind";
import styled from "styled-components";
import RoundDownloadButton from "../../../../../components/buttons/RoundDownloadButton";
import IconButton from "../../../../../components/buttons/IconButton";
import deleteIcon from "../../../../../assets/delete.svg";
import ModalConfirm from "../../../../../components/modals/ModalConfirm";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function ModalPJ({ isOpen, onCancel, onSave, onSend, application, optionsType, defaultOption }) {
  const [numberNewFile, setNumberNewFile] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const inputFileRef = React.useRef(null);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loading, setLoading] = useState(false);
  const [filesList, setFilesList] = useState([]);

  const handleAdd = (files) => {
    const newFiles = Object.values(files).map((val) => val);
    updateFiles(newFiles.concat(filesList), true);
  };
  const handleDelete = (file) => {
    const newArray = filesList.filter((f) => f !== file);
    setFilesList([...newArray]);
    updateFiles(newArray, false);
  };
  const handleCancel = async () => {
    onCancel();
    setLoading(false);
  };
  const updateFiles = async (files, upload) => {
    const filesLength = Object.keys(files).length;
    const arr = Object.values(files).map((value) => value);
    setLoading(true);
    const res = await api.uploadFile(`/application/${application._id}/file/${selectedOption}`, arr);
    if (res.code === "FILE_CORRUPTED") {
      return toastr.error(
        "Le fichier semble corrompu",
        "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        { timeOut: 0 },
      );
    }
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
    if (!upload) {
      toastr.success("Fichier supprimé");
    } else {
      setNumberNewFile(filesLength);
      const newArray = files.filter((file) => typeof file !== "string" && !filesList.includes(file.name)).map((file) => file.name);
      setFilesList((filesList) => [...filesList, ...newArray]);
      toastr.success("Fichier téléversé");
    }
    onSave();
    setLoading(false);
  };
  useEffect(() => {
    if (!selectedOption) return;
    setFilesList(application[selectedOption]);
  }, [selectedOption]);
  useEffect(() => {
    if (!defaultOption && !selectedOption) return setSelectedOption(null);
    setNumberNewFile(0);
    setSelectedOption(defaultOption || selectedOption);
  }, [defaultOption]);
  return (
    <ModalTailwind isOpen={isOpen} onClose={onCancel} className="w-[512px] rounded-lg bg-white shadow-xl">
      <div className="mx-4 mt-3 flex flex-col items-center justify-center">
        <div className="text-center text-xl font-bold text-gray-900">Joindre un fichier à la mission</div>
        <div className="mt-4 w-3/4">
          <Select options={optionsType} selected={selectedOption} setSelected={setSelectedOption} label="Choissisez le document à téléverser" />
        </div>
        {filesList && filesList.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {filesList.map((file, index) => {
              return (
                <div key={index} className="flex flex-row items-center justify-between rounded-md border-[1px] border-gray-400 p-2">
                  <FileName className="mr-2">{getFileName(file)}</FileName>
                  <div className="flex flex-row">
                    <IconButton icon={deleteIcon} buttonsLoading={false} bgColor="bg-indigo-600" onClick={() => setModal({ isOpen: true, onConfirm: () => handleDelete(file) })} />
                    <RoundDownloadButton
                      bgColor="bg-indigo-600"
                      source={async () => {
                        return await api.get(`/application/${application._id}/file/${selectedOption}/${file}`);
                      }}
                      title={`Télécharger`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <input
          type="file"
          multiple
          id="file-upload"
          name="file-upload"
          ref={inputFileRef}
          accept=".png, .jpg, .jpeg, .pdf"
          onChange={(e) => {
            handleAdd(e.target.files);
          }}
          className="hidden"
        />
        <FileInput disabled={selectedOption === null} refInput={inputFileRef} loading={loading} />
        <div className="mt-3 flex w-full flex-col">
          {numberNewFile >= 1 && <div className="mr-1 self-end text-xs text-gray-500">Les parties prenantes seront averties</div>}
          <div className="mb-4 flex w-full flex-row space-x-2">
            <button className="w-full cursor-pointer rounded-lg border-[1px] border-gray-300 py-2 text-gray-700" onClick={handleCancel}>
              Annuler
            </button>
            <button
              className={`w-full cursor-pointer rounded-lg border-[1px] border-gray-300 bg-blue-600 py-2 px-1 text-white  disabled:cursor-default disabled:opacity-50`}
              onClick={() => onSend(selectedOption, numberNewFile > 1 ? "true" : "false")}
              disabled={loading || selectedOption === null || numberNewFile === 0}>
              Envoyer
            </button>
          </div>
        </div>
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
    </ModalTailwind>
  );
}

const FileName = styled.span`
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
`;
