import React, { useState } from "react";
import * as FileSaver from "file-saver";
import { Modal } from "reactstrap";
import DndFileInput from "../../../components/dndFileInput";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { Formik } from "formik";
import { translateModelFields } from "../../../utils";
import ChevronDown from "../../../assets/icons/ChevronDown";
import { BsCheck2 } from "react-icons/bs";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function ModalPJ({ isOpen, onCancel, onSave, name, young, application, optionsType }) {
  const [openType, setOpenType] = useState(false);
  const [type, setType] = useState(name || "justificatifsFiles");

  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} size="lg">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center mx-4 mt-3">
          <div className="text-gray-900 text-xl font-bold text-center uppercase">Joindre un fichier à ma mission</div>
          <div className=" text-gray-500 text-base font-normal text-center ">Vous souhaitez ajouter: </div>
          <div className="border-[1px] border-gray-300 w-1/2 rounded-lg mt-3 px-3 py-2.5">
            <div className="relative">
              <button className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait w-full" onClick={() => setOpenType((e) => !e)}>
                <div className="flex items-center gap-2">
                  <span className=" text-sm leading-5 font-normal">{translateModelFields("mission", type)}</span>
                </div>
                <ChevronDown className="text-gray-400" />
              </button>
              {/* display options */}
              <div className={`${openType ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0 shadow overflow-hidden z-50 top-[30px]`}>
                {optionsType.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setType(option);
                      setOpenType(false);
                    }}
                    className={`${option === type && "font-bold bg-gray-50"}`}>
                    <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                      <div>{translateModelFields("mission", option)}</div>
                      {option === type ? <BsCheck2 /> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Formik initialValues={young} validateOnChange={false} validateOnBlur={false}>
            {({ handleChange }) => (
              <>
                <div className="flex mt-2 items-center justify-center">
                  <DndFileInput
                    newDesign={true}
                    placeholder="un document justificatif"
                    errorMessage="Vous devez téléverser un document justificatif"
                    value={application[type]}
                    source={(e) => api.get(`/referent/youngFile/${young._id}/${type}/${e}`)}
                    name={type}
                    onChange={async (e) => {
                      const res = await api.uploadFile(`/application/${application._id}/file/${type}`, e.target.files);
                      //const res = await api.uploadFile(`/referent/file/${type}`, e.target.files, { youngId: young._id });
                      if (res.code === "FILE_CORRUPTED") {
                        return toastr.error(
                          "Le fichier semble corrompu",
                          "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                          { timeOut: 0 },
                        );
                      }
                      if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                      // We update and save it instant.
                      handleChange({ target: { value: res.data, name: type } });
                      // handleSubmit();
                    }}

                    // className="flex flex-col items-center"
                    // value={application[type] || []}
                    // name={type}
                    // download={true}
                    // onDownload={async (file) => {
                    //   //console.log("ferihn", file[0].name);
                    //   try {
                    //     const f = await api.get(`/young/file/${young._id}/${type}/${getFileName(file)}`);
                    //     FileSaver.saveAs(new Blob([new Uint8Array(f.data.data)], { type: f.mimeType }), f.fileName.replace(/[^a-z0-9]/i, "-"));
                    //   } catch (e) {
                    //     toastr.error("Oups, une erreur est survenue pendant le téléchagement", e.toString());
                    //   }
                    // }}
                    // onChange={async (e) => {
                    //   const res = await api.uploadFile(`/application/${application._id}/file/${type}`, e.target.files);
                    //   if (res.code === "FILE_CORRUPTED") {
                    //     return toastr.error(
                    //       "Le fichier semble corrompu",
                    //       "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                    //       { timeOut: 0 },
                    //     );
                    //   }
                    //   if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                    //   // We update it instant ( because the bucket is updated instant )
                    //   toastr.success("Fichier téléversé");
                    //   handleChange({ target: { value: res.data, name } });
                    //   //await dispatch(setYoung(res.young)); // updateStatus(res.young);
                    // }}
                  />
                </div>
              </>
            )}
          </Formik>
          <div className="w-full flex space-x-2">
            <button className="my-4 border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer w-full" onClick={onCancel}>
              Annuler
            </button>
            <button className="my-4 border-[1px] border-gray-300 text-white rounded-lg py-2 cursor-pointer w-full bg-blue-600" onClick={onSave}>
              Enregistrer et avertir les parties-prenantes.
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
