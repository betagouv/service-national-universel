export const ticketStates = {
  1: "new",
  2: "open",
  3: "pending reminder",
  4: "closed",
  7: "pending closure",
};

export const ticketStateNameById = (id) => ticketStates[id];
export const ticketStateIdByName = (name) => {
  return Number(
    Object.keys(ticketStates).reduce((ret, key) => {
      ret[ticketStates[key]] = key;
      return ret;
    }, {})[name],
  );
};
export const totalOpenedTickets = (tickets) => {
  return (tickets || []).filter((ticket) => (ticket || {}).state_id === ticketStateIdByName("open")).length;
};
export const totalNewTickets = (tickets) => {
  return (tickets || []).filter((ticket) => (ticket || {}).state_id === ticketStateIdByName("new")).length;
};
export const totalClosedTickets = (tickets) => {
  return (tickets || []).filter((ticket) => (ticket || {}).state_id === ticketStateIdByName("closed")).length;
};
