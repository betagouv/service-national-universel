import React, { useState, useEffect } from "react";
import * as FileSaver from "file-saver";
import { Modal } from "reactstrap";
import DndFileInput from "../../../../../components/dndFileInputV2";
import api from "../../../../../services/api";
import { toastr } from "react-redux-toastr";
import { translateAddFilePhase2 } from "../../../../../utils";
import FileInput from "./FileInput";
import Select from "./Select";
import ModalTailwind from "../../../../../components/modals/ModalTailwind";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function ModalPJ({ isOpen, onCancel, onSave, onSend, name, young, application, optionsType, typeChose, defaultOption }) {
  const [type, setType] = useState(null);
  const [stepOne, setStepOne] = useState();
  const [disabledSave, setDisabledSave] = useState(true);
  const [newFilesList, setNewFilesList] = useState([]);
  const [numberNewFile, setNumberNewFile] = useState();
  const [selectedOption, setSelectedOption] = useState(null);
  const inputFileRef = React.useRef(null);
  const handleSave = (type) => {
    onSave();
    onSend(type, numberNewFile > 1 ? "true" : "false");
    setStepOne(true);
  };

  const handleCancel = async () => {
    onCancel();
    setSelectedOption(null);
    setNewFilesList([]);
  };

  useEffect(() => {
    let newNumberNewFile = 0;
    if (newFilesList.length === 0) return;
    console.log("newFilesList", newFilesList);
    newFilesList?.forEach((file) => (application[selectedOption].includes(file) ? null : (newNumberNewFile += 1)));
    console.log(newNumberNewFile);
    setNumberNewFile(newNumberNewFile);
  }, [newFilesList]);

  useEffect(() => {
    if (!defaultOption) return setSelectedOption(null);
    setSelectedOption(defaultOption);
  }, [defaultOption]);

  return (
    <ModalTailwind isOpen={isOpen} onClose={onCancel} className="w-[512px] bg-white rounded-lg shadow-xl">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center mx-4 mt-3">
          <div className="text-gray-900 text-xl font-bold text-center">Joindre un fichier à la mission</div>
          <div className="w-3/4 mt-4">
            <Select options={optionsType} selected={selectedOption} setSelected={setSelectedOption} label="Choissisez le document à téléverser" />
          </div>
          <input
            type="file"
            multiple
            id="file-upload"
            name="file-upload"
            ref={inputFileRef}
            accept=".png, .jpg, .jpeg, .pdf"
            onChange={(e) => {
              console.log("on change", e);
              setNewFilesList(Object.keys(e.target.files).map((key) => e.target.files[key]));
            }}
            className="hidden"
          />
          <FileInput disabled={selectedOption === null} refInput={inputFileRef} />
          {/*<Formik initialValues={young} validateOnChange={false} validateOnBlur={false}>
            {({ handleChange }) => (
              <>
                <div className="flex mt-2 items-center justify-center">
                   <DndFileInput
                    className="flex flex-col items-center"
                    value={application[type] || []}
                    name={type}
                    download={true}
                    onDownload={async (file) => {
                      try {
                        const f = await api.get(`/application/${application._id}/file/${type}/${getFileName(file[0])}`);
                        FileSaver.saveAs(new Blob([new Uint8Array(f.data.data)], { type: f.mimeType }), f.fileName.replace(/[^a-z0-9]/i, "-"));
                      } catch (e) {
                        toastr.error("Oups, une erreur est survenue pendant le téléchagement", e.toString());
                      }
                    }}
                    onChange={async (e) => {
                      const res = await api.uploadFile(`/application/${application._id}/file/${type}`, e.target.files);
                      if (res.code === "FILE_CORRUPTED") {
                        return toastr.error(
                          "Le fichier semble corrompu",
                          "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                          { timeOut: 0 },
                        );
                      }
                      if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                      toastr.success("Fichier téléversé");
                      handleChange({ target: { value: res.data, name } });
                    }}
                    setNewFilesList={setNewFilesList}
                  />
                </div>
              </>
            )}
          </Formik>
          */}
          <div className="w-full flex flex-col mt-3">
            {numberNewFile >= 1 || (selectedOption === null && <div className="self-end text-xs text-gray-500 mr-1">Les parties prenantes seront averties</div>)}
            <div className="space-x-2 w-full flex flex-row mb-4">
              <button className="border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer w-full" onClick={handleCancel}>
                Annuler
              </button>
              <button
                className={`border-[1px] border-gray-300 text-white rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-default py-2 px-1  w-full bg-blue-600 ${
                  disabledSave && "bg-blue-400"
                }`}
                onClick={() => (numberNewFile >= 1 ? handleSave(type) : onSave())}
                disabled={selectedOption === null}>
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalTailwind>
  );
}
