import React, { useContext, useState } from "react";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle, HiPhone } from "react-icons/hi";
import { copyToClipboard, translate, formatPhoneNumberFR } from "../../../../utils";
import { toastr } from "react-redux-toastr";
import api from "../../../../services/api";
import { StructureContext } from "../../view";

import Card from "../Card";
import Button from "../Button";
import Warning from "../../../../assets/icons/Warning";
import ReactTooltip from "react-tooltip";
import ModalRepresentant from "../modals/ModalRepresentant";

export default function CardRepresentant() {
  const { structure, setStructure } = useContext(StructureContext);
  const representant = structure.structureManager || null;
  const [copied, setCopied] = React.useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const handleShowModal = () => setIsOpen(true);

  const onSubmit = async (value) => {
    try {
      const { ok, code, data } = await api.post(`/structure/${structure._id}/representant`, value);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la mise a jour du représentant de la structure : ", translate(code));
      toastr.success("Le représentant de la structure a été mis à jour ");
      setStructure(data);
      setIsOpen(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue lors de la mise a jour du représentant de la structure : ", translate(e.code));
    }
  };

  const onDelete = async () => {
    try {
      const { ok, code, data } = await api.remove(`/structure/${structure._id}/representant`);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Le représentant a bien été supprimé");
      setStructure(data);
    } catch (e) {
      return toastr.error("Une erreur s'est produite :", translate(e.code));
    }
  };

  return (
    <>
      <Card onClick={handleShowModal} className="w-96">
        {representant ? (
          <>
            <div className="px-4 py-3 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm">Représentant de la structure</p>
                <Warning data-tip data-for="representant" />
                <ReactTooltip id="representant" type="light" place="top">
                  <span>
                    Dans le cadre du contrat d’engagement préalable à l’engagement d’un volontaire, vous pouvez préciser le signataire de l’ensemble des contrats et sa fonction au
                    sein de votre structure
                  </span>
                </ReactTooltip>
              </div>
              <p className="text-sm text-gray-500">
                {representant.firstName} {representant.lastName}
              </p>
              <p className="text-xs text-gray-500">{representant.role}</p>
            </div>

            <div className="flex border-t-[1px] border-gray-200 px-3 py-2">
              {representant.mobile && (
                <div className="flex items-center border-r-[1px] border-gray-200 pr-3">
                  <HiPhone className="text-gray-400" />
                  <p className="pl-2 text-gray-700 whitespace-nowrap text-xs">{formatPhoneNumberFR(representant.mobile)}</p>
                </div>
              )}
              <div className={`flex flex-2 my-1 px-3 truncate ${!representant.mobile ? "items-center justify-center w-full" : ""}`}>
                <p className="pr-2 text-gray-700 truncate text-xs">{representant.email}</p>
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
          </>
        ) : (
          <div className="flex flex-col justify-between px-4 py-3 h-full">
            <p className="text-sm">Représentant de la structure</p>
            <Button onClick={handleShowModal}>Renseigner</Button>
          </div>
        )}
      </Card>
      <ModalRepresentant isOpen={isOpen} setIsOpen={setIsOpen} onSubmit={onSubmit} onDelete={onDelete} />
    </>
  );
}
