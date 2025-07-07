import { getMaxOpenTicketCount } from "../../scenes/ticket/components/TicketPreviewContainer/utils";
import { ticketPreviewActions } from "./actions";

const initState = {
  tickets: [],
  isTicketListOpen: false,
  openTicketIds: [],
  expandedTicketIds: [],
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case ticketPreviewActions.ADD_TICKET:
      if (state.tickets.some(({ ticket }) => ticket._id === action.ticket.ticket._id)) {
        return state;
      }
      return { ...state, tickets: [...state.tickets, action.ticket] };
    case ticketPreviewActions.UPDATE_TICKET: {
      const updatedTickets = state.tickets.map((currentTicket) => {
        if (currentTicket.ticket._id === action.ticketId) {
          return { ...currentTicket, ...action.ticket };
        }
        return currentTicket;
      });
      return { ...state, tickets: updatedTickets };
    }
    case ticketPreviewActions.SET_TICKET_LIST_OPEN:
      return { ...state, isTicketListOpen: action.isOpen };
    case ticketPreviewActions.OPEN_TICKET:
      if (state.openTicketIds.includes(action.ticketId)) return state;
      if (state.openTicketIds.length === getMaxOpenTicketCount()) {
        const openTicketIds = [action.ticketId, ...state.openTicketIds.slice(0, -1)];
        return { ...state, openTicketIds, expandedTicketIds: [action.ticketId] };
      } else {
        return { ...state, openTicketIds: [action.ticketId, ...state.openTicketIds], expandedTicketIds: [...state.expandedTicketIds, action.ticketId] };
      }
    case ticketPreviewActions.CLOSE_TICKET:
      return {
        ...state,
        tickets: state.tickets.filter(({ ticket }) => ticket._id !== action.ticketId),
        openTicketIds: state.openTicketIds.filter((id) => id !== action.ticketId),
        expandedTicketIds: state.expandedTicketIds.filter((id) => id !== action.ticketId),
      };
    case ticketPreviewActions.TOGGLE_TICKET_EXPANSION:
      if (state.expandedTicketIds.includes(action.ticketId)) {
        return { ...state, expandedTicketIds: state.expandedTicketIds.filter((id) => id !== action.ticketId) };
      } else {
        return { ...state, expandedTicketIds: [...state.expandedTicketIds, action.ticketId] };
      }
    case ticketPreviewActions.REDUCE_OPEN_TICKETS_TO: {
      const extraTicketCount = state.openTicketIds.length - action.ticketCount;
      if (extraTicketCount <= 0) return state;
      const ticketIdsToClose = state.openTicketIds.slice(-extraTicketCount);
      return {
        ...state,
        openTicketIds: state.openTicketIds.filter((id) => !ticketIdsToClose.includes(id)),
        expandedTicketIds: state.expandedTicketIds.filter((id) => !ticketIdsToClose.includes(id)),
      };
    }
    default:
      return state;
  }
}
