import React from "react";
import { Modal } from "reactstrap";
import CloseSvg from "../../../assets/Close";
import RoundDownloadButton from "../../../components/buttons/RoundDownloadButton";
import { ModalContainer } from "../../../components/modals/Modal";
import api from "../../../services/api";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function ModalDocument({ isOpen, onCancel, initialValues, young, title, nameFiles }) {
  return (
    <Modal centered isOpen={isOpen} toggle={onCancel} size="lg">
      <ModalContainer>
        <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={onCancel} />

        <div className="p-2 text-center w-full flex flex-col items-center">
          <div className="mb-4">
            <h3 className="mb-3">{title}</h3>
          </div>

          <div className="text-lg mb-4">Telecharger le(s) document(s) : </div>
          {initialValues[nameFiles].map((e, i) => (
            <div key={e} className="mx-1 flex items-center">
              <RoundDownloadButton
                bgColor="bg-indigo-600"
                source={() => {
                  console.log(e);
                  return api.get(`/referent/youngFile/${young._id}/${nameFiles}/${getFileName(e)}`);
                }}
                title={`Télécharger`}
              />
              <div className="ml-2">{getFileName(e)}</div>
            </div>
          ))}
        </div>

        <button onClick={onCancel} className="w-[90%] border border-gray-300 rounded-md py-2.5 px-6 mt-3 shadow-sm hover:bg-slate-50">
          Retour
        </button>
      </ModalContainer>
    </Modal>
  );
}
