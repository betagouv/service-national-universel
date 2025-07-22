import React, { useState } from "react";
import { toast } from "react-hot-toast";
import API from "../../../services/api";
import { getStatusColor, translateState } from "../../../utils";
import Modal from "./../../setting/components/Modal";
import { useHistory } from "react-router-dom";
import Button from "./Button";

export default function TransferTicketModal({ open, setOpen, ticket, disabled = false }) {
  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => {
          setOpen(true);
        }}
      >
        Transfert
      </Button>
      <ModalContent open={open} setOpen={setOpen} ticket={ticket} />
    </>
  );
}

const ModalContent = ({ open, setOpen, ticket }) => {
  const [contactEmail, setContactEmail] = useState("");
  const history = useHistory();

  const handleTransferTicket = async () => {
    if (!contactEmail) return toast.error("Veuillez renseigner tous les champs");

    try {
      const { ok } = await API.put({ path: `/ticket/transfer/${ticket._id}`, body: { contactEmail } });
      if (ok) {
        toast.success("Ticket transféré avec succés");
      }
      setOpen(false);
      history.go(0);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Transfert d'un ticket</h5>
      <div className="mb-3 flex justify-between">
        <label className="mb-1 inline-block text-xl font-medium text-gray-700">Sujet : {ticket.subject}</label>
        <span className={`text-md items-end rounded-full px-2.5 py-0.5 font-medium  ${getStatusColor(ticket.status)}`}> {translateState[ticket.status]}</span>
      </div>
      <div className="mb-8 flex content-center items-center ">
        <label className=" inline-block text-sm font-medium text-gray-700">Contact*</label>
        <div className="ml-5 flex w-full items-center gap-4">
          <input
            type="text"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full  rounded border border-gray-300 bg-white py-2.5 px-3 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
            placeholder="Renseignez l'email ..."
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-custom-red transition-colors hover:bg-red-50"
          onClick={() => setOpen(false)}
        >
          Annuler
        </button>
        <button
          type="button"
          className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          onClick={handleTransferTicket}
        >
          Transférer
        </button>
      </div>
    </Modal>
  );
};
