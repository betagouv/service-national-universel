import React, { useState } from "react";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle, HiPhone } from "react-icons/hi";
import { copyToClipboard, translate, formatPhoneNumberFR } from "../../../../utils";
import ModalRepresentant from "../modals/ModalRepresentant";
import { toastr } from "react-redux-toastr";
import api from "../../../../services/api";

export default function CardRepresentant({ structure }) {
  const [representant, setRepresentant] = useState(structure.structureManager || null);
  const [copied, setCopied] = React.useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const handleShowModal = () => setIsOpen(true);

  const onSubmit = async (value) => {
    try {
      const { ok, code, data } = await api.post(`/structure/${structure._id}/representant`, value);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la mise a jour du représentant de la structure : ", translate(code));
      toastr.success("Le représentant de la structure a été mis à jour ");
      setRepresentant(data.structureManager);
      setIsOpen(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue lors de la mise a jour du représentant de la structure : ", translate(e.code));
    }
  };

  const onDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/structure/${structure._id}/representant`);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Le représentant a bien été supprimé");
      setRepresentant(null);
    } catch (e) {
      return toastr.error("Une erreur s'est produite :", translate(e.code));
    }
  };

  return (
    <>
      {representant ? (
        <div className="w-96 rounded-lg bg-white shadow-sm hover:cursor-pointer hover:scale-105" onClick={handleShowModal}>
          <div className="px-4 py-3 space-y-1">
            <p className="text-sm">Représentant de la structure</p>
            <p className="text-sm text-gray-500">
              {representant.firstName} {representant.lastName}
            </p>
            <p className="text-xs text-gray-500">{representant.role}</p>
          </div>

          <div className="flex border-t-[1px] border-gray-200 px-3 py-2">
            {representant.mobile && (
              <div className="flex items-center border-r-[1px] border-gray-200 pr-2">
                <HiPhone className="text-gray-400" />
                <div className="pl-2 text-gray-700 whitespace-nowrap text-xs">{formatPhoneNumberFR(representant.mobile)}</div>
              </div>
            )}
            <div className={`flex flex-2 my-2 px-2 truncate ${!representant.mobile ? "items-center justify-center w-full" : ""}`}>
              <div className="pr-2 flex-row text-gray-700 truncate text-xs">{representant.email}</div>
              <div
                className="flex items-center justify-center cursor-pointer hover:scale-105"
                onClick={() => {
                  copyToClipboard(representant.email);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 3000);
                }}>
                {copied ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-96 p-4 rounded-lg bg-white shadow-sm hover:scale-105 flex flex-col justify-between">
          <p className="text-sm">Représentant de la structure</p>
          <button className="rounded-lg border-[1px] bg-blue-600 border-blue-600 text-[#ffffff] hover:bg-white hover:text-[#2563eb] text-xs p-2" onClick={handleShowModal}>
            Renseigner
          </button>
        </div>
      )}
      <ModalRepresentant isOpen={isOpen} setIsOpen={setIsOpen} onSubmit={onSubmit} onDelete={onDelete} representant={representant} structure={structure} />
    </>
  );
}
