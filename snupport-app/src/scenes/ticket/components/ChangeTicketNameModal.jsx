import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { HiPencil } from "react-icons/hi";
import API from "../../../services/api";
import { getStatusColor, translateState } from "../../../utils";
import Modal from "../../setting/components/Modal";
import { serializeTicketUpdate } from "../service";

export default function ChangeTicketNameModal({ open, setOpen, ticket, onClick, setTicket }) {
  return (
    <>
      <button onClick={onClick}>
        <HiPencil className="ml-4 text-xl text-gray-500" />
      </button>
      <ModalContent open={open} setOpen={setOpen} ticket={ticket} setTicket={setTicket} />
    </>
  );
}

const ModalContent = ({ open, setOpen, ticket, setTicket }) => {
  const [ticketSubject, setTicketSubject] = useState("");
  const changeTicketSubject = async () => {
    try {
      const body = serializeTicketUpdate({ subject: ticketSubject });
      const { ok, data } = await API.patch({ path: `/ticket/${ticket._id}`, body });
      if (ok) {
        toast.success("Ticket modifié avec succés");
        setTicket(data.ticket);
      }
      setOpen(false);
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Voulez-vous modifier le sujet de ce ticket ?</h5>
      <div className="mb-3 flex justify-between">
        <label className="mb-1 inline-block text-xl font-medium text-gray-700">Sujet : {ticket.subject}</label>
        <span className={`text-md items-end rounded-full px-2.5 py-0.5 font-medium  ${getStatusColor(ticket.status)}`}> {translateState[ticket.status]}</span>
      </div>
      <div>
        <input
          type="text"
          value={ticketSubject}
          onChange={(e) => setTicketSubject(e.target.value)}
          className="w-full  rounded border border-gray-300 bg-white py-2.5 px-3 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder={ticket.subject}
        />
      </div>
      <div className="mt-3 flex gap-3">
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
          onClick={() => changeTicketSubject()}
        >
          Confirmer
        </button>
      </div>
    </Modal>
  );
};
