import React, { useState, useEffect } from "react";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";
import { HiPhone } from "react-icons/hi";
import { copyToClipboard } from "../../../../utils";
import { HiPlus } from "react-icons/hi";
import ModalRepresentant from "../modal/ModalRepresentant";
import { toastr } from "react-redux-toastr";
import api from "../../../../services/api";
import { translate } from "../../../../utils";
import { formatPhoneNumberFR } from "../../../../utils";

export default function CardRepresentant({ representant, getService, department, idServiceDep }) {
  const [copied, setCopied] = React.useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const handleShowModal = () => setIsOpen(true);

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);

  const onSubmit = async (value) => {
    try {
      const { ok } = await api.post(`/department-service/${idServiceDep}/representant`, value);
      if (!ok) return toastr.error("Une erreur s'est produite lors de la mise a jour du représentant de l’État");
      toastr.success("Le représentant de l’État a été mis à jour ");
      await getService();
      setIsOpen(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue lors de la mise a jour du représentant de l’État : ", translate(e.code));
    }
  };

  return (
    <>
      {representant ? (
        <div className="flex flex-col max-w-xs rounded-lg bg-white shadow-sm mr-4 hover:cursor-pointer hover:scale-105" onClick={handleShowModal}>
          <div className="flex flex-1 flex-col px-7 py-6 ">
            <div className="text-sm text-bold mb-1">Représentant de l’État</div>
            <div className="text-xs text-gray-500">
              {representant.firstName} {representant.lastName}
            </div>
          </div>

          <div className=" flex flex-row border-t-[1px] border-gray-200 py-2">
            {representant.mobile ? (
              <>
                <div className="flex flex-1 flex-row justify-center items-center border-r-[1px] border-gray-200 my-2 px-2">
                  <HiPhone className="text-gray-400" />
                  <div className="pl-2 text-gray-700 text-sm whitespace-nowrap text-xs">{formatPhoneNumberFR(representant.mobile)}</div>
                </div>
              </>
            ) : null}
            <div className={`flex flex-2 my-2 px-2 truncate ${!representant.mobile ? "items-center justify-center w-full" : ""}`}>
              <div className="pr-2 flex-row text-gray-700 text-sm truncate text-xs">{representant.email}</div>
              <div
                className="flex items-center justify-center cursor-pointer hover:scale-105"
                onClick={() => {
                  copyToClipboard(representant.email);
                  setCopied(true);
                }}>
                {copied ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col rounded-lg bg-white shadow-sm mr-4">
          <div className="flex flex-1 flex-col px-7 justify-center">
            <div className="text-bold mb-1 text-sm">Représentant de l’État</div>
            <div className="text-gray-500 text-xs">Non renseigné</div>
            <div className=" flex flex-row pt-4">
              <div
                className="flex border-dashed border-indigo-700 rounded-lg bg-white border-grey-200 border-[1px] shadow-sm mx-auto px-2 py-1 items-center justify-center hover:cursor-pointer hover:scale-105"
                onClick={handleShowModal}>
                <HiPlus className="text-indigo-300" />
                <div className="pl-2 text-indigo-700 text-xs">Ajouter un représentant</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ModalRepresentant isOpen={isOpen} setIsOpen={setIsOpen} onSubmit={onSubmit} representant={representant} department={department} />
    </>
  );
}
