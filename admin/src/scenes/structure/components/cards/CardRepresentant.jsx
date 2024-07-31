import React, { useState } from "react";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle, HiPhone } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import api from "../../../../services/api";
import { formatPhoneNumberFR, translate } from "snu-lib";
import { copyToClipboard } from "../../../../utils";
import { AiOutlineInfoCircle } from "react-icons/ai";
import ReactTooltip from "react-tooltip";
import { capture } from "../../../../sentry";
import Button from "../Button";
import Card from "../Card";
import ModalRepresentant from "../modals/ModalRepresentant";

export default function CardRepresentant({ structure, setStructure }) {
  const representant = structure?.structureManager || null;
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
      capture(e);
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
      capture(e);
      return toastr.error("Une erreur s'est produite :", translate(e.code));
    }
  };

  return (
    <>
      <Card className="h-36 w-96">
        {representant ? <Representative representant={representant} handleShowModal={handleShowModal} /> : <CreateRepresentative handleShowModal={handleShowModal} />}
      </Card>
      <ModalRepresentant isOpen={isOpen} setIsOpen={setIsOpen} onSubmit={onSubmit} onDelete={onDelete} structure={structure} />
    </>
  );
}

function Representative({ representant, handleShowModal }) {
  const [copied, setCopied] = React.useState(false);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="cursor-pointer space-y-1 px-4 py-3" onClick={handleShowModal}>
        <div className="flex items-center gap-2">
          <p className="text-sm">Représentant de la structure</p>
          <AiOutlineInfoCircle data-tip data-for="representant" className="text-gray-500" />
          <ReactTooltip id="representant" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 shadow-sm" tooltipRadius="6">
            <div className="w-[450px] text-center">
              Dans le cadre du contrat d&apos;engagement préalable à l&apos;engagement d&apos;un volontaire, vous pouvez préciser le signataire de l&apos;ensemble des contrats et
              sa fonction au sein de votre structure
            </div>
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
            <p className="whitespace-nowrap pl-2 text-xs text-gray-700">{formatPhoneNumberFR(representant.mobile)}</p>
          </div>
        )}
        <div className="my-1 ml-2 flex w-full justify-between">
          <p className="max-w-[180px] truncate text-xs text-gray-700">{representant.email}</p>
          <div
            className="flex cursor-pointer items-center justify-center hover:scale-105"
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
  );
}

function CreateRepresentative({ handleShowModal }) {
  return (
    <div className="flex h-full flex-col justify-between px-4 py-3">
      <p className="text-sm">Représentant de la structure</p>
      <Button onClick={handleShowModal}>Renseigner</Button>
    </div>
  );
}
