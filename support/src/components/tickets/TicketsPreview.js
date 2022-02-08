import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import API from "../../services/api";
import ResizablePanel from "../ResizablePanel";

const TicketsPreview = ({ activeTicketsIds, handleRemoveTicketFromPreview }) => {
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

  const tickets = useMemo(() => activeTicketsIds.map((id) => data?.data?.find((t) => t._id === id)).filter(Boolean) || [], [data?.data, activeTicketsIds]);

  const handleTicketTabClick = (e) => setActiveTicketId(e?.currentTarget?.dataset?.ticketid);
  const handleTicketClose = (e) => {
    e.stopPropagation();
    const ticketId = e?.target?.dataset?.ticketid;
    if (ticketId === activeTicketId) setActiveTicketId(null);
    handleRemoveTicketFromPreview(ticketId);
  };

  return (
    <ResizablePanel className={`flex-grow-0 flex-shrink-0 border-l-2 z-10 overflow-hidden flex flex-col h-80 w-full relative`} position="bottom" name="admin-tickets-bottom-panel">
      <div className="relative flex-shrink-0 flex flex-col h-full overflow-x-hidden">
        <div className="flex-grow flex-shrink w-full h-full ">
          {!activeTicketId ? <span className="w-full h-full flex justify-center items-center">Cliquez sur un ticket pour l'afficher</span> : "Ticket !"}
        </div>
        <div className="w-full flex flex-shrink-1 gap-3 px-2 max-w-full overflow-hidden justify-end">
          {tickets.map((ticket) => (
            <button
              key={ticket._id}
              onClick={handleTicketTabClick}
              data-ticketid={ticket._id}
              style={{ flexBasis: "25%" }}
              className={`w-16 flex justify-between py-2 px-4 flex-grow-0 flex-shrink bg-snu-purple-100 hover:bg-snu-purple-300 rounded-t-lg rounded-b-none border-none text-snu-purple-900 hover:text-white ${
                activeTicketId === ticket._id ? "!text-white !bg-snu-purple-900" : ""
              }`}
            >
              <span className="whitespace-nowrap truncate flex-grow-0">{ticket.title}</span>
              <svg
                data-ticketid={ticket._id}
                onClick={handleTicketClose}
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </ResizablePanel>
  );
};

export default TicketsPreview;
