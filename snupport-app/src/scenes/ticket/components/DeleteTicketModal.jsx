import React from "react";
import { toast } from "react-hot-toast";
import { HiXCircle } from "react-icons/hi";
import API from "../../../services/api";
import { getStatusColor, translateState } from "../../../utils";
import Modal from "../../setting/components/Modal";

export default function DeleteTicketModal({ open, setOpen, ticket, onClick, update, filter }) {
  return (
    <>
      <button onClick={onClick}>
        <HiXCircle className="text-xl text-red-500" />
      </button>
      <ModalContent open={open} setOpen={setOpen} ticket={ticket} update={update} filter={filter} />
    </>
  );
}

const ModalContent = ({ open, setOpen, ticket, update, filter }) => {
  const deleteTicket = async () => {
    try {
      const { ok } = await API.delete({ path: `/ticket/${ticket._id}` });
      if (ok) {
        toast.success("Ticket supprimé avec succés");
        update(filter);
      }
      setOpen(false);
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Voulez-vous vraiment supprimer ce ticket ?</h5>
      <div className="flex justify-between">
        <label className="mb-1 inline-block text-xl font-medium text-gray-700">Sujet : {ticket.subject}</label>
        <span className={`text-md items-end rounded-full px-2.5 py-0.5 font-medium  ${getStatusColor(ticket.status)}`}> {translateState[ticket.status]}</span>
      </div>
      <div>
        <label className="text-l mb-1 inline-block font-medium text-gray-700">
          Agent : {ticket.agentLastName} {ticket.agentFirstName}
        </label>
      </div>
      <div>
        <label className="text-l mb-1 inline-block font-medium text-gray-700">
          Contact : {ticket.contactLastName} {ticket.contactFirstName}
        </label>
      </div>
      <div></div>
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
          onClick={() => deleteTicket()}
        >
          Confirmer
        </button>
      </div>
    </Modal>
  );
};
