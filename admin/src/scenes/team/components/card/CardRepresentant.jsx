import React, { useState, useEffect } from "react";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle, HiPhone, HiPlus } from "react-icons/hi";
import { translate, formatPhoneNumberFR } from "snu-lib";
import { copyToClipboard } from "../../../../utils";
import ModalRepresentant from "../modal/ModalRepresentant";
import { toastr } from "react-redux-toastr";
import api from "../../../../services/api";

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
        <div className="mr-4 flex max-w-xs flex-col rounded-lg bg-white shadow-sm hover:scale-105 hover:cursor-pointer" onClick={handleShowModal}>
          <div className="flex flex-1 flex-col px-7 py-6 ">
            <div className="mb-1 text-sm font-bold">Représentant de l’État</div>
            <div className="text-xs text-gray-500">
              {representant.firstName} {representant.lastName}
            </div>
          </div>

          <div className=" flex flex-row border-t-[1px] border-gray-200 py-2">
            {representant.mobile ? (
              <>
                <div className="my-2 flex flex-1 flex-row items-center justify-center border-r-[1px] border-gray-200 px-2">
                  <HiPhone className="text-gray-400" />
                  <div className="whitespace-nowrap pl-2 text-xs text-gray-700">{formatPhoneNumberFR(representant.mobile)}</div>
                </div>
              </>
            ) : null}
            <div className={`flex-2 my-2 flex truncate px-2 ${!representant.mobile ? "w-full items-center justify-center" : ""}`}>
              <div className="flex-row truncate pr-2 text-xs text-gray-700">{representant.email}</div>
              <div
                className="flex cursor-pointer items-center justify-center hover:scale-105"
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
        <div className="mr-4 flex flex-col rounded-lg bg-white shadow-sm">
          <div className="flex flex-1 flex-col justify-center px-7">
            <div className="text-bold mb-1 text-sm">Représentant de l’État</div>
            <div className="text-xs text-gray-500">Non renseigné</div>
            <div className=" flex flex-row pt-4">
              <div
                className="border-grey-200 mx-auto flex items-center justify-center rounded-lg border-[1px] border-dashed border-indigo-700 bg-white px-2 py-1 shadow-sm hover:scale-105 hover:cursor-pointer"
                onClick={handleShowModal}>
                <HiPlus className="text-indigo-300" />
                <div className="pl-2 text-xs text-indigo-700">Ajouter un représentant</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ModalRepresentant isOpen={isOpen} setIsOpen={setIsOpen} onSubmit={onSubmit} representant={representant} department={department} />
    </>
  );
}
