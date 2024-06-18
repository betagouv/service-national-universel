import { TICKETS_ACTIONS } from "./actions";

export type TicketsState = {
  // TODO: use API route response
  Tickets: {
    tickets: {
      _id: "NEW" | "CLOSED" | "OPEN";
      total: number;
    }[];
    new: number;
    open: number;
    closed: number;
  };
};

const initialState = {
  tickets: null,
  new: 0,
  open: 0,
  closed: 0,
};

const reducer = (oldState = initialState, action) => {
  switch (action.type) {
    case TICKETS_ACTIONS.FETCH_TICKETS:
      return {
        ...oldState,
        tickets: action.payload.tickets,
        new: action.payload.new,
        open: action.payload.open,
        closed: action.payload.closed,
      };
    default:
      return { ...oldState };
  }
};

export default reducer;
