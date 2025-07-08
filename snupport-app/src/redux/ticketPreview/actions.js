export const ticketPreviewActions = {
  ADD_TICKET: "ADD_TICKET",
  UPDATE_TICKET: "UPDATE_TICKET",
  SET_TICKET_LIST_OPEN: "SET_TICKET_LIST_OPEN",
  OPEN_TICKET: "OPEN_TICKET",
  CLOSE_TICKET: "CLOSE_TICKET",
  TOGGLE_TICKET_EXPANSION: "TOGGLE_TICKET_EXPANSION",
  REDUCE_OPEN_TICKETS_TO: "REDUCE_OPEN_TICKETS_TO",
};

export function addTicket(ticket) {
  return { type: ticketPreviewActions.ADD_TICKET, ticket };
}

export function updateTicket(ticketId, ticket) {
  return { type: ticketPreviewActions.UPDATE_TICKET, ticket, ticketId };
}

export function setTicketListOpen(isOpen) {
  return { type: ticketPreviewActions.SET_TICKET_LIST_OPEN, isOpen };
}

export function openTicket(ticketId) {
  return { type: ticketPreviewActions.OPEN_TICKET, ticketId };
}

export function closeTicket(ticketId) {
  return { type: ticketPreviewActions.CLOSE_TICKET, ticketId };
}

export function toggleTicketExpansion(ticketId) {
  return { type: ticketPreviewActions.TOGGLE_TICKET_EXPANSION, ticketId };
}
export function reduceOpenTicketsTo(ticketCount) {
  return { type: ticketPreviewActions.REDUCE_OPEN_TICKETS_TO, ticketCount };
}
