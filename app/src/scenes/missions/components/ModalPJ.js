import React, { useState } from "react";
import * as FileSaver from "file-saver";
import { Modal } from "reactstrap";
import DndFileInput from "../../../components/dndFileInput";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { Formik } from "formik";
import { translateAddFilePhase2 } from "../../../utils";
import ChevronDown from "../../../assets/icons/ChevronDown";
import { BsCheck2 } from "react-icons/bs";
import { useEffect } from "react";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function ModalPJ({ isOpen, onCancel, onSave, name, young, application, optionsType, typeChose }) {
  const [type, setType] = useState();
  const [stepOne, setStepOne] = useState();
  const [disabledSave, setDisabledSave] = useState(true);
  const [newFilesList, setNewFilesList] = useState([]);
  const [numberNewFile, setNumberNewFile] = useState();

  const handleSave = (type) => {
    onSave(type, numberNewFile > 1 ? "true" : "false");
    setStepOne(true);
  };

  const handleCancel = async () => {
    const res = await api.uploadFile(`/application/${application._id}/file/${type}`, application[type]);
    if (res.code === "FILE_CORRUPTED") {
      return toastr.error(
        "Le fichier semble corrompu",
        "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        { timeOut: 0 },
      );
    }
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
    onCancel();
    setStepOne(true);
  };

  useEffect(() => {
    setStepOne(typeChose);
    setType(name);
  }, [typeChose]);

  useEffect(() => {
    let newNumberNewFile = 0;
    newFilesList.forEach((file) => (application[type].includes(file) ? null : (newNumberNewFile += 1)));
    !stepOne && newNumberNewFile >= 1 ? setDisabledSave(false) : setDisabledSave(true);
    setNumberNewFile(newNumberNewFile);
  }, [newFilesList]);

  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} size="lg">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center mx-4 mt-3">
          <div className="text-gray-900 text-xl font-bold text-center uppercase">Joindre un fichier à ma mission</div>
          <div className=" text-gray-500 text-base font-normal text-center ">Vous souhaitez ajouter: </div>
          {stepOne ? (
            <div className="flex flex-col space-y-2 my-3">
              {optionsType.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setType(option);
                    setStepOne(false);
                  }}
                  className="p-2 border rounded-lg hover:bg-blue-600 hover:text-white flex justify-between space-x-2">
                  <div>{translateAddFilePhase2(option)[0].toUpperCase() + translateAddFilePhase2(option).slice(1)}</div>
                  {application[option].length !== 0 && <div className="font-bold">{application[option].length}</div>}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div>{translateAddFilePhase2(type)}</div>
              <Formik initialValues={young} validateOnChange={false} validateOnBlur={false}>
                {({ handleChange }) => (
                  <>
                    <div className="flex mt-2 items-center justify-center">
                      <DndFileInput
                        className="flex flex-col items-center"
                        value={application[type] || []}
                        name={type}
                        download={true}
                        onDownload={async (file) => {
                          //console.log("ferihn", file[0].name);
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
            </>
          )}
          <div className="w-full flex space-x-2">
            <button className="my-4 border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer w-full" onClick={stepOne ? onCancel : handleCancel}>
              Annuler
            </button>
            <button
              className={` my-4 border-[1px] border-gray-300 text-white rounded-lg py-2 cursor-pointer w-full bg-blue-600 ${disabledSave && "bg-blue-400"}`}
              onClick={() => handleSave(type)}
              disabled={disabledSave}>
              Enregistrer et avertir les parties-prenantes.
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
