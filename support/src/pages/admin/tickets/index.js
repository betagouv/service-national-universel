import { useState, useEffect } from "react";
import Header from "../../../components/Header";
import Layout from "../../../components/Layout";
import TicketsPreview from "../../../components/tickets/TicketsPreview";
import TicketsFolders from "../../../components/tickets/TicketsFolders";
// import TicketsRightDrawer from "../../../components/TicketsRightDrawer";
import TicketsInbox from "../../../components/tickets/TicketsInbox";
import withAuth from "../../../hocs/withAuth";

const Tickets = () => {
  const [activeTicketsIds, setActiveTicketsIds] = useState(() => JSON.parse(localStorage.getItem("snu-tickets-active-tickets-ids")) || []);

  const handleTicketClick = (e) => {
    const ticketId = e?.currentTarget?.dataset?.ticketid;
    setActiveTicketsIds((ids) => [...ids, ticketId].filter(Boolean));
  };

  const handleRemoveTicketFromPreview = (ticketId) => {
    setActiveTicketsIds((ids) => ids.filter((id) => id !== ticketId));
  };

  useEffect(() => {
    localStorage.setItem("snu-tickets-active-tickets-ids", JSON.stringify(activeTicketsIds.filter(Boolean)));
  }, [activeTicketsIds]);

  return (
    <>
      <Layout title="Tickets" className="flex flex-col">
        <Header>🚧 Tickets (EN COURS DE DÉVELOPPEMENT) 🚧</Header>
        <div className="relative bg-coolGray-200 flex border-t-2 h-full w-full flex-grow flex-shrink overflow-hidden">
          <TicketsFolders />
          <div className="flex flex-grow flex-col flex-shrink-1 w-full overflow-hidden">
            <div className="flex flex-grow flex-col overflow-auto w-full">
              <TicketsInbox onTicketClick={handleTicketClick} />
            </div>
            {!!activeTicketsIds.length && <TicketsPreview activeTicketsIds={activeTicketsIds} handleRemoveTicketFromPreview={handleRemoveTicketFromPreview} />}
          </div>
          {/* <TicketsRightDrawer /> */}
        </div>
      </Layout>
    </>
  );
};

export default withAuth(Tickets);
