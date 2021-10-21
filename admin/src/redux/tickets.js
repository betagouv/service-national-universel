const initialState = {
  tickets: null,
  new: 0,
  open: 0,
  closed: 0,
};

const reducer = (oldState = initialState, action) => {
  switch (action.type) {
    case 'FETCH_TICKETS':
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
