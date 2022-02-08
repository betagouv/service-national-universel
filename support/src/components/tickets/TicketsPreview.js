import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import API from "../../services/api";
import ResizablePanel from "../ResizablePanel";
import TicketPreview from "./TicketPreview";

const TicketsPreview = ({ activeTicketsIds, handleRemoveTicketFromPreview }) => {
  const router = useRouter();
  const { data } = useSWR(API.getUrl({ path: "/support-center/ticket", query: { ticketsIds: activeTicketsIds.join(",") } }));
  const [activeTicketId, setActiveTicketId] = useState(() => localStorage.getItem("snu-tickets-active-ticket-id") || null);
  useEffect(() => {
    localStorage.setItem("snu-tickets-active-ticket-id", activeTicketId);
  }, [activeTicketId]);

  useEffect(() => {
    if (activeTicketsIds.length === 1 && !activeTicketId) {
      setActiveTicketId(activeTicketsIds[0]);
    }
  }, [activeTicketsIds, activeTicketId]);

  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    if (!activeTicketsIds.length && !!tickets.length) {
      setTickets([]);
    } else {
      const newTickets = activeTicketsIds.map((id) => data?.data?.find((t) => t._id === id)).filter(Boolean) || [];
      if (!!activeTicketsIds.length && !!data?.data && tickets.length !== newTickets.length) {
        setTickets(newTickets);
      }
    }
  }, [data?.data, activeTicketsIds]);

  const handleTicketTabClick = (e) => setActiveTicketId(e?.currentTarget?.dataset?.ticketid);
  const handleTicketClose = (e) => {
    e.stopPropagation();
    const ticketId = e?.target?.dataset?.ticketid;
    if (ticketId === activeTicketId) setActiveTicketId(null);
    handleRemoveTicketFromPreview(ticketId);
  };

  const handleTicketOpen = (e) => {
    e.stopPropagation();
    const ticketId = e?.target?.dataset?.ticketid;
    router.push(`/admin/tickets/${ticketId}`);
  };

  const activeTicket = useMemo(() => tickets.find((t) => t._id === activeTicketId), [activeTicketId, tickets]);

  return (
    <ResizablePanel className={`relative z-10 flex h-80 w-full shrink-0 grow-0 flex-col overflow-hidden`} position="bottom" name="admin-tickets-bottom-panel">
      <div className="relative flex h-full shrink-0 flex-col overflow-x-hidden">
        {!activeTicket ? (
          <span className="flex w-full flex-1 items-center justify-center">Cliquez sur un ticket pour l'afficher</span>
        ) : (
          <TicketPreview ticket={activeTicket} handleTicketClose={handleTicketClose} handleTicketOpen={handleTicketOpen} />
        )}
        <div className="flex w-full max-w-full flex-shrink-0 justify-end gap-2 overflow-hidden px-2">
          {tickets.map((ticket) => (
            <button
              key={ticket._id}
              onClick={handleTicketTabClick}
              data-ticketid={ticket._id}
              style={{ flexBasis: "25%" }}
              className={`flex w-16 flex-shrink grow-0 justify-between rounded-t-lg rounded-b-none border-none bg-snu-purple-100 px-2 pt-3 pb-4 text-snu-purple-900 hover:bg-snu-purple-300 hover:text-white ${
                activeTicketId === ticket._id ? "!bg-snu-purple-900 !text-white" : ""
              }`}
            >
              <span className="grow-0 truncate whitespace-nowrap">{ticket.title}</span>
              <div className="flex shrink-0 grow-0">
                <svg onClick={handleTicketOpen} data-ticketid={ticket._id} className="h-4 w-4 shrink-0 p-0.5" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M13 4.78369V1.78369M13 1.78369H10M13 1.78369L9.25 5.53369M1 10.7837V13.7837M1 13.7837H4M1 13.7837L4.75 10.0337"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                  />
                </svg>
                <svg
                  data-ticketid={ticket._id}
                  onClick={handleTicketClose}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" className="pointer-events-none" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </ResizablePanel>
  );
};

export default TicketsPreview;
