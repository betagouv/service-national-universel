import React, { useState, useEffect, useMemo } from "react";
import withAuth from "../../../hocs/withAuth";
import Header from "../../../components/Header";
import Layout from "../../../components/Layout";
import ResizablePanel from "../../../components/ResizablePanel";
import { fakeTicketsFolders, foldersInSections } from "../../../utils/ticketsFolders";
import FoldersSection from "../../../components/tickets/FoldersSection";
import { useRouter } from "next/router";
import useSWR from "swr";
import API from "../../../services/api";
import TicketsTable from "../../../components/tickets/TicketsTable";
import ReactPaginate from "react-paginate";
import TicketPreview from "../../../components/tickets/TicketPreview";
import FullScreenIcon from "../../../components/icons/FullScreenIcon";
import CrossIcon from "../../../components/icons/CrossIcon";

const Tickets = () => {
  const router = useRouter();

  /*

  FOLDERS

  */

  const currentFolder = useMemo(() => fakeTicketsFolders.find((folder) => folder._id === router.query?.currentFolder || "inbox"), [router.query?.currentFolder]);

  /*

  TICKETS TABLE

  */
  /* Number of items per page */
  const [limitPerPage, setLimitPerPage] = useState(() => JSON.parse(localStorage.getItem("snu-tickets-limit-per-page")) || 50);
  useEffect(() => {
    localStorage.setItem("snu-tickets-limit-per-page", limitPerPage);
  }, [limitPerPage]);

  /* Pagination: back to 0 when changing folder */
  const [page, setPage] = useState(() => JSON.parse(localStorage.getItem("snu-tickets-page")) || 0);
  useEffect(() => {
    localStorage.setItem("snu-tickets-limit-per-page", limitPerPage);
  }, [limitPerPage]);
  useEffect(() => {
    if (router.query?.currentFolder) setPage(0);
  }, [router.query?.currentFolder]);

  const ticketsResponse = useSWR(API.getUrl({ path: "/support-center/ticket", query: { limit: limitPerPage, page } }));

  /* Load ticket in preview */
  const handleTicketClickFromTable = (ticketId) => setActiveTicketsIds((ids) => [...ids, ticketId].filter(Boolean));

  /*

  TICKETS PREVIEW

  */

  /* Active tickets in bottom tab bar */
  const [activeTicketsIds, setActiveTicketsIds] = useState(() => JSON.parse(localStorage.getItem("snu-tickets-active-tickets-ids")) || []);
  useEffect(() => {
    localStorage.setItem("snu-tickets-active-tickets-ids", JSON.stringify(activeTicketsIds.filter(Boolean)));
  }, [activeTicketsIds]);

  const ticketsPreviewResponse = useSWR(API.getUrl({ path: "/support-center/ticket", query: { ticketsIds: activeTicketsIds.join(",") } }));
  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    if (!activeTicketsIds.length && !!tickets.length) {
      setTickets([]);
    } else {
      const newTickets = activeTicketsIds.map((id) => ticketsPreviewResponse?.data?.data?.find((t) => t._id === id)).filter(Boolean) || [];
      if (!!activeTicketsIds.length && !!ticketsPreviewResponse?.data?.data && tickets.length !== newTickets.length) {
        setTickets(newTickets);
      }
    }
  }, [ticketsPreviewResponse?.data?.data, activeTicketsIds]);

  /* Active ticket in preview */
  const [activeTicketId, setActiveTicketId] = useState(() => localStorage.getItem("snu-tickets-active-ticket-id") || null);
  useEffect(() => {
    localStorage.setItem("snu-tickets-active-ticket-id", activeTicketId);
  }, [activeTicketId]);

  const handleTicketTabClick = (ticketId) => setActiveTicketId(ticketId);

  const activeTicket = useMemo(() => tickets.find((t) => t._id === activeTicketId), [activeTicketId, tickets]);

  /* When click on ticket from the table for the first time, auto-preview the ticket */
  useEffect(() => {
    if (activeTicketsIds.length === 1 && !activeTicketId) {
      setActiveTicketId(activeTicketsIds[0]);
    }
  }, [activeTicketsIds, activeTicketId]);

  /* Tickets actions */
  const handleTicketClose = (ticketId) => {
    if (ticketId === activeTicketId) setActiveTicketId(null);
    setActiveTicketsIds((ids) => ids.filter((id) => id !== ticketId));
  };

  const handleTicketOpenFullScreen = (ticketId) => router.push(`/admin/tickets/${ticketId}`);

  return (
    <>
      <Layout title="Tickets" className="flex flex-col">
        <Header>🚧 Tickets (EN COURS DE DÉVELOPPEMENT) 🚧</Header>
        <div className="relative flex h-full w-full flex-shrink flex-grow overflow-hidden border-t-2 bg-coolGray-200">
          {/* FOLDERS ON THE LEFT SIDE */}
          <ResizablePanel className={`z-10 flex w-80 shrink-0 grow-0 overflow-hidden border-l-2`} position="left" name="admin-tickets-left-panel">
            <div className="relative flex w-full flex-col overflow-hidden">
              <aside className="my-2 mr-1 ml-2 flex-1 rounded-lg bg-white p-3 drop-shadow-md">
                {foldersInSections.map((section) => (
                  <FoldersSection section={section} key={section.sectionName} />
                ))}
              </aside>
            </div>
          </ResizablePanel>
          {/* RIGHT SIDE OF SCREEN: TICKETS TABLE + TICKETS PREVIEW */}
          <div className="flex-shrink-1 flex w-full flex-grow flex-col overflow-hidden">
            {/* TICKETS TABLE */}
            <div className="flex w-full flex-grow flex-col overflow-auto">
              <div className="w-{calc(100% - 3rem)} my-1 ml-1 mr-2 mt-2 flex flex-1 flex-col overflow-hidden rounded-lg bg-white drop-shadow-md">
                <span className="block p-6 text-xl font-bold">{currentFolder?.name}</span>
                <div className="flex basis-full overflow-scroll">
                  <TicketsTable onTicketClick={handleTicketClickFromTable} tickets={ticketsResponse?.data?.data || []} />
                </div>
                <div className="flex justify-between px-6 pb-2 pt-3">
                  <select onChange={(e) => setLimitPerPage(e.target.value)} value={limitPerPage}>
                    {[10, 20, 50, 100].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <div className="flex rounded-l-lg">
                    <ReactPaginate
                      className="flex"
                      pageClassName="border border-r-0 w-10 h-10 flex justify-center items-center"
                      breakClassName="border w-10 h-10 flex justify-center items-center"
                      previousClassName="border border-r-0 w-10 h-10 flex justify-center items-center  rounded-l-lg"
                      nextClassName="border w-10 h-10 flex justify-center items-center  rounded-r-lg"
                      pageLinkClassName="flex justify-center items-center"
                      breakLabel="..."
                      nextLabel=">"
                      activeClassName="font-bold color-snu-purple-900 bg-snu-purple-100 "
                      forcePage={page}
                      onPageChange={({ selected }) => setPage(selected)}
                      pageRangeDisplayed={3}
                      pageCount={ticketsResponse?.data?.total / limitPerPage}
                      previousLabel="<"
                      renderOnZeroPageCount={null}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* TICKETS PREVIEW */}
            <ResizablePanel className={`relative z-10 flex h-80 w-full shrink-0 grow-0 flex-col overflow-hidden`} position="bottom" name="admin-tickets-bottom-panel">
              <div className="relative flex h-full shrink-0 flex-col overflow-x-hidden">
                {!activeTicket ? (
                  <span className="flex w-full flex-1 items-center justify-center">Cliquez sur un ticket pour l'afficher</span>
                ) : (
                  <TicketPreview ticket={activeTicket} onTicketClose={handleTicketClose} onTicketOpen={handleTicketOpenFullScreen} />
                )}
                <div className="flex w-full max-w-full flex-shrink-0 justify-end gap-2 overflow-hidden px-2">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket._id}
                      onClick={() => handleTicketTabClick(ticket._id)}
                      style={{ flexBasis: "25%" }}
                      className={`flex w-16 flex-shrink grow-0 justify-between rounded-t-lg rounded-b-none border-none bg-snu-purple-100 px-2 pt-3 pb-4 text-snu-purple-900 hover:bg-snu-purple-300 hover:text-white ${
                        activeTicketId === ticket._id ? "!bg-snu-purple-900 !text-white" : ""
                      }`}
                    >
                      <span className="grow-0 truncate whitespace-nowrap">{ticket.title}</span>
                      <div className="flex shrink-0 grow-0">
                        <FullScreenIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTicketOpenFullScreen(ticket._id);
                          }}
                        />
                        <CrossIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTicketClose(ticket._id);
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </ResizablePanel>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default withAuth(Tickets);
