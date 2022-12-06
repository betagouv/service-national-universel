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
import ModalConfirm from "./ModalConfirm";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function ModalPJ({ isOpen, onCancel, onSave, onSend, name, young, application, optionsType, typeChose, defaultOption }) {
  const [newFilesList, setNewFilesList] = useState([]);
  const [numberNewFile, setNumberNewFile] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const inputFileRef = React.useRef(null);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    onSave();
    onSend(selectedOption, numberNewFile > 1 ? "true" : "false");
  };

  const handleCancel = async () => {
    onCancel();
    setSelectedOption(null);
    setNewFilesList([]);
    setLoading(false);
  };
  const uploadFiles = async (files) => {
    const filesLength = Object.keys(files).length;
    const arr = Object.values(files).map((value) => value);
    if (filesLength === 0) return;
    setNumberNewFile(filesLength);
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
    toastr.success("Fichier téléversé");
    setLoading(false);
    onSave();
    //handleChange({ target: { value: res.data, name } });
  };
  useEffect(() => {
    if (!defaultOption) return setSelectedOption(null);
    setSelectedOption(defaultOption);
  }, [defaultOption]);
  const handleChange = () => {};
  return (
    <ModalTailwind isOpen={isOpen} onClose={onCancel} className="w-[512px] bg-white rounded-lg shadow-xl">
      <div className="flex flex-col items-center justify-center mx-4 mt-3">
        <div className="text-gray-900 text-xl font-bold text-center">Joindre un fichier à la mission</div>
        <div className="w-3/4 mt-4">
          <Select options={optionsType} selected={selectedOption} setSelected={setSelectedOption} label="Choissisez le document à téléverser" />
        </div>
        {application[selectedOption] && application[selectedOption].length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {application[selectedOption].map((file, index) => {
              return (
                <div key={index} className="flex flex-row justify-between items-center border-[1px] border-gray-400 p-2 rounded-md">
                  <FileName className="mr-2">{getFileName(file)}</FileName>
                  <div className="flex flex-row">
                    <IconButton
                      icon={deleteIcon}
                      buttonsLoading={false}
                      bgColor="bg-indigo-600"
                      onClick={() => setModal({ isOpen: true, onConfirm: () => handleChange(application[selectedOption].filter((n, j) => file !== j)) })}
                    />
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
            uploadFiles(e.target.files);
          }}
          className="hidden"
        />
        <FileInput disabled={selectedOption === null} refInput={inputFileRef} loading={loading} />
        <div className="w-full flex flex-col mt-3">
          {numberNewFile >= 1 && <div className="self-end text-xs text-gray-500 mr-1">Les parties prenantes seront averties</div>}
          <div className="space-x-2 w-full flex flex-row mb-4">
            <button className="border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer w-full" onClick={handleCancel}>
              Annuler
            </button>
            <button
              className={`border-[1px] border-gray-300 text-white rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-default py-2 px-1  w-full bg-blue-600`}
              onClick={() => (numberNewFile >= 1 ? handleSave() : onSave())}
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
          console.log("should delete");
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
