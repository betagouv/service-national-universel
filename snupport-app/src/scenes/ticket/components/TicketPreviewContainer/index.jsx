import debounce from "lodash.debounce";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import TicketPreviewList from "./TicketPreviewList";
import TicketPreview from "./TicketPreview";
import { setTicketListOpen, openTicket, toggleTicketExpansion, closeTicket, reduceOpenTicketsTo } from "../../../../redux/ticketPreview/actions";
import { SNUPPORT_URL_ADMIN } from "../../../../config";
import { getMaxOpenTicketCount } from "./utils";

const TicketPreviewContainer = ({ update, filter }) => {
  const dispatch = useDispatch();
  const { tickets, isTicketListOpen, openTicketIds, expandedTicketIds } = useSelector((state) => state.TicketPreview);
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    const handleResize = debounce(() => {
      const maxTicketCount = getMaxOpenTicketCount();
      const extraTicketCount = openTicketIds.length - maxTicketCount;
      if (extraTicketCount > 0) {
        dispatch(reduceOpenTicketsTo(maxTicketCount));
      }
    }, 1000);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleTicketListOpen = () => {
    dispatch(setTicketListOpen(!isTicketListOpen));
  };

  const openInNewTab = (id) => () => {
    window.open(`${SNUPPORT_URL_ADMIN}/ticket/${id}`, "_blank");
  };

  return (
    <div className="fixed right-5 bottom-0 z-[100] flex h-0 items-end gap-2">
      {openTicketIds && (
        <>
          {openTicketIds.map((openTicketId) => (
            <TicketPreview
              key={openTicketId}
              openInNewTab={openInNewTab(openTicketId)}
              ticketId={openTicketId}
              isOpen={expandedTicketIds.includes(openTicketId)}
              toggleOpen={() => dispatch(toggleTicketExpansion(openTicketId))}
              onClose={() => {
                update(filter);
                dispatch(closeTicket(openTicketId));
              }}
              user={user}
            />
          ))}
        </>
      )}
      {tickets && tickets.length > 0 && (
        <TicketPreviewList
          isOpen={isTicketListOpen}
          toggleOpen={toggleTicketListOpen}
          tickets={tickets.map(({ ticket }) => ({ ...ticket, isOpen: openTicketIds.includes(ticket._id) }))}
          onOpen={(ticketId) => dispatch(openTicket(ticketId))}
          onClose={(ticketId) => dispatch(closeTicket(ticketId))}
        />
      )}
    </div>
  );
};

export default TicketPreviewContainer;
