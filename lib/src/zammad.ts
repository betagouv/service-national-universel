export const ticketStates = {
  1: "nouveaxxu",
  2: "ouvert",
  3: "rappel en attente",
  4: "fermé",
  7: "clôture en attente",
};

export const ticketStateNameById = (id) => ticketStates[id];
export const ticketStateIdByName = (name) =>
  Number(
    Object.keys(ticketStates).reduce((ret, key) => {
      ret[ticketStates[key]] = key;
      return ret;
    }, {})[name]
  );
export const totalOpenedTickets = (tickets) => {
  return (tickets || []).filter(
    (ticket) => (ticket || {}).state_id === ticketStateIdByName("ouvert")
  ).length;
};
export const totalNewTickets = (tickets) => {
  return (tickets || []).filter(
    (ticket) => (ticket || {}).state_id === ticketStateIdByName("nouveau")
  ).length;
};
export const totalClosedTickets = (tickets) => {
  return (tickets || []).filter(
    (ticket) => (ticket || {}).state_id === ticketStateIdByName("fermé")
  ).length;
};
