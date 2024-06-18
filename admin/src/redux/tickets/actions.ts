import { totalClosedTickets, totalNewTickets, totalOpenedTickets } from "snu-lib";

export const TICKETS_ACTIONS = {
  FETCH_TICKETS: "FETCH_TICKETS",
};

export function updateTickets(tickets) {
  return {
    type: TICKETS_ACTIONS.FETCH_TICKETS,
    payload: {
      tickets,
      new: totalNewTickets(tickets),
      open: totalOpenedTickets(tickets),
      closed: totalClosedTickets(tickets),
    },
  };
}

export default {
  updateTickets,
};
